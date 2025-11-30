import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../database.js';
import { requireAuth, requireDonor } from '../middleware/auth.js';
import { StripeService } from '../services/stripe.js';
import { logAuditEvent } from '../middleware/hipaa.js';

const donationRouter = Router();

// Validation schemas
const donationSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least $1').max(10000, 'Amount cannot exceed $10,000'),
  impactType: z.enum(['shelter', 'mobility', 'tech', 'wellness'], {
    errorMap: () => ({ message: 'Impact type must be shelter, mobility, tech, or wellness' })
  }),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  isAnonymous: z.boolean().default(false),
  note: z.string().max(500).optional()
});

const setupIntentSchema = z.object({
  customerId: z.string().optional() // Optional for future saved payment methods
});

// Create donation payment intent
donationRouter.post('/create-payment-intent', requireDonor, async (req, res) => {
  try {
    const { userId } = req.user!;
    const donationData = donationSchema.parse(req.body);

    // Verify donor exists and is active
    const donorResult = await pool.query(
      'SELECT id FROM donors WHERE user_id = $1',
      [userId]
    );

    if (donorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Donor profile not found. Please complete registration.' });
    }

    // Create payment intent through Stripe
    const paymentResult = await StripeService.processDonation({
      amount: donationData.amount * 100, // Convert to cents
      donorId: userId,
      impactType: donationData.impactType,
      isAnonymous: donationData.isAnonymous,
      paymentMethodId: donationData.paymentMethodId,
      metadata: {
        note: donationData.note,
        userId: userId.toString()
      }
    });

    await logAuditEvent(userId, 'DONATION_PAYMENT_INTENT_CREATED', {
      amount: donationData.amount,
      impactType: donationData.impactType,
      paymentIntentId: paymentResult.paymentIntentId
    }, req);

    res.json({
      paymentIntent: {
        id: paymentResult.paymentIntentId,
        clientSecret: paymentResult.clientSecret,
        status: paymentResult.status
      },
      estimatedBeneficiaries: Math.floor(donationData.amount / 50), // Rough estimate
      message: 'Payment intent created successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid donation data',
        details: error.errors
      });
    }

    console.error('Payment intent creation error:', error);
    await logAuditEvent(req.user!.userId, 'DONATION_PAYMENT_INTENT_FAILED', { error: error.message }, req);

    res.status(500).json({
      error: 'Failed to create payment intent',
      message: 'Please try again or contact support if the issue persists'
    });
  }
});

// Create setup intent for saving payment methods (future feature)
donationRouter.post('/create-setup-intent', requireDonor, async (req, res) => {
  try {
    const setupData = setupIntentSchema.parse(req.body);

    const setupIntent = await StripeService.createSetupIntent(setupData.customerId);

    res.json({
      setupIntent: {
        id: setupIntent.setupIntentId,
        clientSecret: setupIntent.clientSecret
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid setup data',
        details: error.errors
      });
    }

    console.error('Setup intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment setup' });
  }
});

// Get donor's donation history
donationRouter.get('/history', requireDonor, async (req, res) => {
  try {
    const { userId } = req.user!;
    const { limit = 20, offset = 0, status } = req.query;

    let query = `
      SELECT
        d.id,
        d.amount,
        d.impact_type,
        d.status,
        d.is_anonymous,
        d.created_at,
        d.stripe_payment_id,
        COUNT(t.id) as beneficiaries_helped
      FROM donations d
      LEFT JOIN transactions t ON d.id = t.donation_id AND t.status = 'completed'
      WHERE d.donor_id = $1
    `;

    const values = [userId];
    let paramCount = 2;

    if (status) {
      query += ` AND d.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ` GROUP BY d.id ORDER BY d.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get summary statistics
    const summaryResult = await pool.query(
      `SELECT
        COUNT(*) as total_donations,
        SUM(amount) as total_amount,
        AVG(amount) as avg_donation,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_donations,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount
       FROM donations WHERE donor_id = $1`,
      [userId]
    );

    const summary = summaryResult.rows[0];

    res.json({
      donations: result.rows,
      summary: {
        totalDonations: parseInt(summary.total_donations) || 0,
        totalAmount: parseFloat(summary.total_amount) || 0,
        averageDonation: parseFloat(summary.avg_donation) || 0,
        completedDonations: parseInt(summary.completed_donations) || 0,
        completedAmount: parseFloat(summary.completed_amount) || 0
      },
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: result.rows.length === parseInt(limit as string)
      }
    });

  } catch (error) {
    console.error('Donation history fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch donation history' });
  }
});

// Get donor's impact portfolio
donationRouter.get('/portfolio', requireDonor, async (req, res) => {
  try {
    const { userId } = req.user!;

    // Get impact by category
    const impactResult = await pool.query(
      `SELECT
        d.impact_type,
        COUNT(d.id) as donations_count,
        SUM(d.amount) as total_amount,
        COUNT(t.id) as beneficiaries_helped,
        AVG(d.amount) as avg_donation
       FROM donations d
       LEFT JOIN transactions t ON d.id = t.donation_id AND t.status = 'completed'
       WHERE d.donor_id = $1 AND d.status = 'completed'
       GROUP BY d.impact_type`,
      [userId]
    );

    // Get recent transactions (last 10)
    const recentTransactions = await pool.query(
      `SELECT
        t.id,
        t.amount,
        t.category,
        t.vendor_name,
        t.status,
        t.created_at,
        d.impact_type,
        d.amount as donation_amount
       FROM transactions t
       JOIN donations d ON t.donation_id = d.id
       WHERE d.donor_id = $1
       ORDER BY t.created_at DESC
       LIMIT 10`,
      [userId]
    );

    // Calculate overall impact metrics
    const totalStats = await pool.query(
      `SELECT
        SUM(d.amount) as total_donated,
        COUNT(DISTINCT t.beneficiary_id) as unique_beneficiaries,
        COUNT(t.id) as total_transactions,
        AVG(d.amount) as avg_donation
       FROM donations d
       LEFT JOIN transactions t ON d.id = t.donation_id AND t.status = 'completed'
       WHERE d.donor_id = $1 AND d.status = 'completed'`,
      [userId]
    );

    const stats = totalStats.rows[0];

    res.json({
      impactByCategory: impactResult.rows,
      recentTransactions: recentTransactions.rows,
      summary: {
        totalDonated: parseFloat(stats.total_donated) || 0,
        uniqueBeneficiariesHelped: parseInt(stats.unique_beneficiaries) || 0,
        totalTransactions: parseInt(stats.total_transactions) || 0,
        averageDonation: parseFloat(stats.avg_donation) || 0,
        impactScore: Math.min(100, Math.floor((parseInt(stats.total_transactions) || 0) * 10)) // Simple scoring
      }
    });

  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch impact portfolio' });
  }
});

// Get donation statistics (public endpoint)
donationRouter.get('/stats', async (req, res) => {
  try {
    // Get public statistics (anonymized)
    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_donations,
        SUM(amount) as total_amount,
        COUNT(DISTINCT donor_id) as unique_donors,
        AVG(amount) as avg_donation,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_donations,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN amount ELSE 0 END) as recent_amount
       FROM donations
       WHERE status = 'completed'`
    );

    const impactResult = await pool.query(
      `SELECT
        impact_type,
        COUNT(*) as donation_count,
        SUM(d.amount) as total_amount
       FROM donations d
       WHERE d.status = 'completed'
       GROUP BY impact_type
       ORDER BY total_amount DESC`
    );

    const stats = statsResult.rows[0];

    res.json({
      overall: {
        totalDonations: parseInt(stats.total_donations) || 0,
        totalAmount: parseFloat(stats.total_amount) || 0,
        uniqueDonors: parseInt(stats.unique_donors) || 0,
        averageDonation: parseFloat(stats.avg_donation) || 0,
        recentDonations: parseInt(stats.recent_donations) || 0,
        recentAmount: parseFloat(stats.recent_amount) || 0
      },
      byImpactType: impactResult.rows.map(row => ({
        impactType: row.impact_type,
        donationCount: parseInt(row.donation_count),
        totalAmount: parseFloat(row.total_amount)
      }))
    });

  } catch (error) {
    console.error('Donation stats error:', error);
    res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
});

// Admin: Get detailed donation analytics
donationRouter.get('/admin/analytics', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const dateParams = [];

    if (startDate) {
      dateFilter += ' AND d.created_at >= $1';
      dateParams.push(startDate);
    }

    if (endDate) {
      dateFilter += ` AND d.created_at <= $${dateParams.length + 1}`;
      dateParams.push(endDate);
    }

    // Comprehensive analytics
    const analyticsResult = await pool.query(
      `SELECT
        COUNT(d.id) as total_donations,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as avg_donation,
        COUNT(DISTINCT d.donor_id) as unique_donors,
        COUNT(t.id) as total_transactions,
        COUNT(DISTINCT t.beneficiary_id) as unique_beneficiaries,
        SUM(t.amount) as total_distributed,
        json_build_object(
          'shelter', COUNT(*) FILTER (WHERE d.impact_type = 'shelter'),
          'mobility', COUNT(*) FILTER (WHERE d.impact_type = 'mobility'),
          'tech', COUNT(*) FILTER (WHERE d.impact_type = 'tech'),
          'wellness', COUNT(*) FILTER (WHERE d.impact_type = 'wellness')
        ) as donations_by_type
       FROM donations d
       LEFT JOIN transactions t ON d.id = t.donation_id AND t.status = 'completed'
       WHERE d.status = 'completed' ${dateFilter}`,
      dateParams
    );

    const analytics = analyticsResult.rows[0];

    // Calculate efficiency metrics
    const totalDonated = parseFloat(analytics.total_amount) || 0;
    const totalDistributed = parseFloat(analytics.total_distributed) || 0;
    const efficiency = totalDonated > 0 ? (totalDistributed / totalDonated) * 100 : 0;

    res.json({
      period: { startDate, endDate },
      summary: {
        totalDonations: parseInt(analytics.total_donations) || 0,
        totalAmount: totalDonated,
        averageDonation: parseFloat(analytics.avg_donation) || 0,
        uniqueDonors: parseInt(analytics.unique_donors) || 0,
        totalTransactions: parseInt(analytics.total_transactions) || 0,
        uniqueBeneficiaries: parseInt(analytics.unique_beneficiaries) || 0,
        totalDistributed,
        efficiency: Math.round(efficiency * 100) / 100
      },
      breakdowns: {
        byImpactType: analytics.donations_by_type
      }
    });

  } catch (error) {
    console.error('Admin donation analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default donationRouter;



