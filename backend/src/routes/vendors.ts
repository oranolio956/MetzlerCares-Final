import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../database.js';
import { requireAuth, requireVendor, authAndRole } from '../middleware/auth.js';
import { StripeService } from '../services/stripe.js';
import { logAuditEvent } from '../middleware/hipaa.js';

// Safe JSON parsing utility
const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON, using fallback:', error);
    return fallback;
  }
};

const vendorRouter = Router();

// Validation schemas
const vendorProfileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.enum(['individual', 'company']),
  vendorType: z.enum(['housing', 'transport', 'tech']),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(5, 'ZIP code is required'),
    country: z.string().default('US')
  }),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  description: z.string().max(500).optional(),
  pricing: z.object({
    minAmount: z.number().min(0),
    maxAmount: z.number().min(0),
    currency: z.string().default('USD')
  }).optional(),
  serviceArea: z.array(z.string()).optional() // Array of ZIP codes or cities
});

const vendorUpdateSchema = z.object({
  businessName: z.string().min(1).optional(),
  description: z.string().max(500).optional(),
  pricing: z.object({
    minAmount: z.number().min(0),
    maxAmount: z.number().min(0),
    currency: z.string().default('USD')
  }).optional(),
  serviceArea: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

// Register as a vendor and create Stripe Connect account
vendorRouter.post('/register', requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { userId, role } = req.user!;

    // Check if user is already a vendor
    const existingVendor = await client.query(
      'SELECT id FROM vendors WHERE user_id = $1',
      [userId]
    );

    if (existingVendor.rows.length > 0) {
      return res.status(409).json({ error: 'User is already registered as a vendor' });
    }

    if (role !== 'vendor' && role !== 'admin') {
      return res.status(403).json({ error: 'Only vendors or admins can register vendor accounts' });
    }

    const vendorData = vendorProfileSchema.parse(req.body);

    // Create Stripe Connect account
    const stripeAccount = await StripeService.createVendorAccount({
      businessName: vendorData.businessName,
      businessType: vendorData.businessType,
      taxId: vendorData.taxId,
      address: vendorData.address,
      phone: vendorData.phone,
      email: req.user!.email || ''
    });

    // Create vendor record
    const vendorResult = await client.query(
      `INSERT INTO vendors (
        user_id, business_name, vendor_type, stripe_account_id,
        verification_status, service_area, pricing, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, business_name, vendor_type, verification_status`,
      [
        userId,
        vendorData.businessName,
        vendorData.vendorType,
        stripeAccount.accountId,
        'pending',
        JSON.stringify(vendorData.serviceArea || []),
        JSON.stringify(vendorData.pricing || { minAmount: 0, maxAmount: 0, currency: 'USD' })
      ]
    );

    await client.query('COMMIT');

    await logAuditEvent(userId, 'VENDOR_REGISTERED', {
      businessName: vendorData.businessName,
      vendorType: vendorData.vendorType,
      stripeAccountId: stripeAccount.accountId
    }, req);

    res.status(201).json({
      vendor: vendorResult.rows[0],
      stripeOnboardingUrl: stripeAccount.onboardingUrl,
      message: 'Vendor registered successfully. Please complete Stripe onboarding.'
    });

  } catch (error) {
    await client.query('ROLLBACK');

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid vendor data',
        details: error.errors
      });
    }

    console.error('Vendor registration error:', error);
    await logAuditEvent(req.user!.userId, 'VENDOR_REGISTRATION_FAILED', { error: error.message }, req);

    res.status(500).json({ error: 'Vendor registration failed' });
  } finally {
    client.release();
  }
});

// Get vendor profile
vendorRouter.get('/profile', requireAuth, async (req, res) => {
  try {
    const { userId } = req.user!;

    const vendorResult = await pool.query(
      `SELECT v.*, u.email
       FROM vendors v
       JOIN users u ON v.user_id = u.id
       WHERE v.user_id = $1`,
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const vendor = vendorResult.rows[0];

    // Get Stripe account status
    let stripeStatus = null;
    if (vendor.stripe_account_id) {
      try {
        stripeStatus = await StripeService.getVendorAccountStatus(vendor.stripe_account_id);
      } catch (stripeError) {
        console.error('Stripe account status error:', stripeError);
        stripeStatus = { error: 'Unable to retrieve account status' };
      }
    }

    // Parse JSON fields
    vendor.service_area = safeJsonParse(vendor.service_area || '[]', []);
    vendor.pricing = safeJsonParse(vendor.pricing || '{}', {});

    res.json({
      vendor,
      stripeStatus
    });

  } catch (error) {
    console.error('Vendor profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
});

// Update vendor profile
vendorRouter.put('/profile', requireAuth, async (req, res) => {
  try {
    const { userId } = req.user!;
    const updateData = vendorUpdateSchema.parse(req.body);

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (updateData.businessName) {
      updates.push(`business_name = $${paramCount}`);
      values.push(updateData.businessName);
      paramCount++;
    }

    if (updateData.description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(updateData.description);
      paramCount++;
    }

    if (updateData.pricing) {
      updates.push(`pricing = $${paramCount}`);
      values.push(JSON.stringify(updateData.pricing));
      paramCount++;
    }

    if (updateData.serviceArea) {
      updates.push(`service_area = $${paramCount}`);
      values.push(JSON.stringify(updateData.serviceArea));
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE vendors
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING id, business_name, vendor_type, verification_status, service_area, pricing
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = result.rows[0];
    vendor.service_area = safeJsonParse(vendor.service_area || '[]', []);
    vendor.pricing = safeJsonParse(vendor.pricing || '{}', {});

    await logAuditEvent(userId, 'VENDOR_PROFILE_UPDATED', updateData, req);

    res.json({ vendor });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid update data',
        details: error.errors
      });
    }
    console.error('Vendor update error:', error);
    res.status(500).json({ error: 'Failed to update vendor profile' });
  }
});

// Get vendor's transaction history
vendorRouter.get('/transactions', requireAuth, async (req, res) => {
  try {
    const { userId } = req.user!;
    const { status, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT
        t.id,
        t.amount,
        t.category,
        t.status,
        t.created_at,
        t.stripe_transfer_id,
        d.impact_type as donation_impact_type,
        d.amount as original_donation_amount
      FROM transactions t
      JOIN vendors v ON t.vendor_id = v.id
      JOIN donations d ON t.donation_id = d.id
      WHERE v.user_id = $1
    `;

    const values = [userId];
    let paramCount = 2;

    if (status) {
      query += ` AND t.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Calculate totals
    const totals = await pool.query(
      `SELECT
        COUNT(*) as total_transactions,
        SUM(t.amount) as total_earned,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_transactions
       FROM transactions t
       JOIN vendors v ON t.vendor_id = v.id
       WHERE v.user_id = $1`,
      [userId]
    );

    res.json({
      transactions: result.rows,
      summary: totals.rows[0],
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: result.rows.length === parseInt(limit as string)
      }
    });

  } catch (error) {
    console.error('Vendor transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get vendor dashboard stats
vendorRouter.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const { userId } = req.user!;

    // Get vendor info
    const vendorResult = await pool.query(
      'SELECT id, business_name, verification_status, rating FROM vendors WHERE user_id = $1',
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = vendorResult.rows[0];

    // Get transaction stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_transactions,
        SUM(amount) as total_earned,
        AVG(amount) as avg_transaction,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COUNT(CASE WHEN created_at >= $1 THEN 1 END) as recent_transactions
       FROM transactions t
       JOIN vendors v ON t.vendor_id = v.id
       WHERE v.user_id = $2`,
      [thirtyDaysAgo, userId]
    );

    const stats = statsResult.rows[0];

    // Get pending payouts
    const pendingResult = await pool.query(
      `SELECT COUNT(*) as pending_transfers, SUM(amount) as pending_amount
       FROM transactions t
       JOIN vendors v ON t.vendor_id = v.id
       WHERE v.user_id = $1 AND t.status = 'pending'`,
      [userId]
    );

    const pending = pendingResult.rows[0];

    res.json({
      vendor,
      stats: {
        totalTransactions: parseInt(stats.total_transactions) || 0,
        totalEarned: parseFloat(stats.total_earned) || 0,
        averageTransaction: parseFloat(stats.avg_transaction) || 0,
        completedTransactions: parseInt(stats.completed_transactions) || 0,
        recentTransactions: parseInt(stats.recent_transactions) || 0,
        pendingTransfers: parseInt(pending.pending_transfers) || 0,
        pendingAmount: parseFloat(pending.pending_amount) || 0
      }
    });

  } catch (error) {
    console.error('Vendor dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Search available vendors (public endpoint for beneficiary matching)
vendorRouter.get('/search', async (req, res) => {
  try {
    const { type, city, state = 'CO', limit = 10 } = req.query;

    let query = `
      SELECT
        v.id,
        v.business_name,
        v.vendor_type,
        v.rating,
        v.total_transactions,
        v.service_area,
        v.pricing,
        v.created_at
      FROM vendors v
      WHERE v.verification_status = 'verified'
    `;

    const values = [];
    let paramCount = 1;

    if (type) {
      query += ` AND v.vendor_type = $${paramCount}`;
      values.push(type);
      paramCount++;
    }

    if (city) {
      query += ` AND $${paramCount} = ANY(v.service_area)`;
      values.push(city);
      paramCount++;
    }

    query += ` ORDER BY v.rating DESC, v.total_transactions DESC LIMIT $${paramCount}`;
    values.push(limit);

    const result = await pool.query(query, values);

    // Parse JSON fields for response
    const vendors = result.rows.map(vendor => ({
      ...vendor,
      serviceArea: safeJsonParse(vendor.service_area || '[]', []),
      pricing: safeJsonParse(vendor.pricing || '{}', {})
    }));

    res.json({ vendors });

  } catch (error) {
    console.error('Vendor search error:', error);
    res.status(500).json({ error: 'Failed to search vendors' });
  }
});

// Admin endpoints for vendor management
vendorRouter.put('/:vendorId/verification', authAndRole(['admin']), async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }

    await pool.query(
      'UPDATE vendors SET verification_status = $1, updated_at = NOW() WHERE id = $2',
      [status, vendorId]
    );

    await logAuditEvent(req.user!.userId, 'VENDOR_VERIFICATION_UPDATED', {
      vendorId: parseInt(vendorId),
      newStatus: status
    }, req);

    res.json({ message: `Vendor verification status updated to ${status}` });

  } catch (error) {
    console.error('Vendor verification update error:', error);
    res.status(500).json({ error: 'Failed to update vendor verification' });
  }
});

// Get all vendors (admin only)
vendorRouter.get('/admin/all', authAndRole(['admin']), async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM vendors';
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` WHERE verification_status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      vendors: result.rows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });

  } catch (error) {
    console.error('Admin vendor list error:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

export default vendorRouter;



