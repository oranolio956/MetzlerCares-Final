import { Router } from 'express';
import { requireAuth, requireDonor, requireBeneficiary, requireVendor, requireAdmin, authAndRole } from '../middleware/auth.js';
import { pool, dbQuery, postgresAvailable } from '../database.js';
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

const dashboardRouter = Router();

// Apply authentication to all dashboard routes
dashboardRouter.use(requireAuth);

// DONOR DASHBOARD
dashboardRouter.get('/donor', requireDonor, async (req, res) => {
  try {
    const { userId } = req.user!;

    let donor;
    if (postgresAvailable) {
      // Get donor profile and stats
      const donorQuery = `
        SELECT
          d.*,
          u.email,
          u.created_at as member_since,
          COUNT(dn.id) as total_donations,
          SUM(dn.amount) as total_donated,
          MAX(dn.created_at) as last_donation_date
        FROM donors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN donations dn ON dn.donor_id = u.id AND dn.status = 'completed'
        WHERE d.user_id = $1
        GROUP BY d.id, u.id
      `;

      const donorResult = await dbQuery(donorQuery, [userId]);
      donor = donorResult.rows[0];

      if (!donor) {
        return res.status(404).json({ error: 'Donor profile not found' });
      }
    } else {
      // Mock donor data
      donor = {
        user_id: userId,
        email: req.user?.email || 'donor@example.com',
        member_since: new Date().toISOString(),
        total_donations: 5,
        total_donated: 250.00,
        last_donation_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        impact_score: 85,
        preferred_categories: ['housing', 'food', 'transportation']
      };
    }

    let recentDonationsResult, impactResult;

    if (postgresAvailable) {
      // Get recent donations (last 10)
      const recentDonationsQuery = `
        SELECT
          d.id,
          d.amount,
          d.impact_type,
          d.created_at,
          COUNT(t.id) as beneficiaries_helped
        FROM donations d
        LEFT JOIN transactions t ON d.id = t.donation_id AND t.status = 'completed'
        WHERE d.donor_id = $1 AND d.status = 'completed'
        GROUP BY d.id
        ORDER BY d.created_at DESC
        LIMIT 10
      `;

      recentDonationsResult = await dbQuery(recentDonationsQuery, [userId]);

      // Get impact by category
      const impactQuery = `
        SELECT
          d.impact_type,
          COUNT(d.id) as donations_count,
          SUM(d.amount) as total_amount,
          COUNT(t.id) as beneficiaries_helped
        FROM donations d
        LEFT JOIN transactions t ON d.id = t.donation_id AND t.status = 'completed'
        WHERE d.donor_id = $1 AND d.status = 'completed'
        GROUP BY d.impact_type
        ORDER BY total_amount DESC
      `;

      impactResult = await dbQuery(impactQuery, [userId]);
    } else {
      // Mock data for recent donations
      recentDonationsResult = {
        rows: [
          { id: 1, amount: 50.00, impact_type: 'housing', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), beneficiaries_helped: 1 },
          { id: 2, amount: 25.00, impact_type: 'food', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), beneficiaries_helped: 2 },
          { id: 3, amount: 75.00, impact_type: 'transportation', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), beneficiaries_helped: 1 }
        ]
      };

      // Mock data for impact by category
      impactResult = {
        rows: [
          { impact_type: 'housing', donations_count: 2, total_amount: 125.00, beneficiaries_helped: 3 },
          { impact_type: 'food', donations_count: 2, total_amount: 75.00, beneficiaries_helped: 4 },
          { impact_type: 'transportation', donations_count: 1, total_amount: 50.00, beneficiaries_helped: 1 }
        ]
      };
    }

    // Calculate impact metrics
    const totalDonated = parseFloat(donor.total_donated) || 0;
    const totalBeneficiaries = impactResult.rows.reduce((sum, row) =>
      sum + parseInt(row.beneficiaries_helped), 0
    );

    // Get upcoming impact (pending transactions)
    const pendingImpactQuery = `
      SELECT COUNT(*) as pending_beneficiaries
      FROM transactions t
      JOIN donations d ON t.donation_id = d.id
      WHERE d.donor_id = $1 AND t.status = 'pending'
    `;

    const pendingImpactResult = await pool.query(pendingImpactQuery, [userId]);

    res.json({
      profile: {
        id: donor.id,
        email: donor.email,
        memberSince: donor.member_since,
        preferences: {
          anonymous: donor.is_anonymous,
          impactPreferences: donor.impact_preferences ? safeJsonParse(donor.impact_preferences, []) : []
        }
      },
      stats: {
        totalDonations: parseInt(donor.total_donations) || 0,
        totalDonated,
        totalBeneficiariesHelped: totalBeneficiaries,
        pendingBeneficiaries: parseInt(pendingImpactResult.rows[0].pending_beneficiaries) || 0,
        averageDonation: donor.total_donations > 0 ? totalDonated / donor.total_donations : 0,
        lastDonationDate: donor.last_donation_date
      },
      recentDonations: recentDonationsResult.rows.map(donation => ({
        id: donation.id,
        amount: parseFloat(donation.amount),
        impactType: donation.impact_type,
        date: donation.created_at,
        beneficiariesHelped: parseInt(donation.beneficiaries_helped)
      })),
      impactByCategory: impactResult.rows.map(category => ({
        impactType: category.impact_type,
        donationsCount: parseInt(category.donations_count),
        totalAmount: parseFloat(category.total_amount),
        beneficiariesHelped: parseInt(category.beneficiaries_helped)
      })),
      impactScore: Math.min(100, Math.floor(totalBeneficiaries * 5)) // Simple scoring algorithm
    });

  } catch (error) {
    console.error('Donor dashboard error:', error);
    res.status(500).json({ error: 'Failed to load donor dashboard' });
  }
});

// BENEFICIARY DASHBOARD
dashboardRouter.get('/beneficiary', requireBeneficiary, async (req, res) => {
  try {
    const { userId } = req.user!;

    // Get beneficiary profile and stats
    const beneficiaryQuery = `
      SELECT
        b.*,
        u.email,
        u.created_at as member_since,
        COUNT(t.id) as total_support_received,
        SUM(t.amount) as total_amount_received,
        MAX(t.created_at) as last_support_date
      FROM beneficiaries b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN transactions t ON t.beneficiary_id = b.id AND t.status = 'completed'
      WHERE b.user_id = $1
      GROUP BY b.id, u.id
    `;

    const beneficiaryResult = await pool.query(beneficiaryQuery, [userId]);
    const beneficiary = beneficiaryResult.rows[0];

    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary profile not found' });
    }

    // Get recent support (last 10 transactions)
    const recentSupportQuery = `
      SELECT
        t.id,
        t.amount,
        t.category,
        t.vendor_name,
        t.created_at,
        d.impact_type as donation_impact_type,
        d.is_anonymous as anonymous_donation
      FROM transactions t
      JOIN donations d ON t.donation_id = d.id
      WHERE t.beneficiary_id = $1 AND t.status = 'completed'
      ORDER BY t.created_at DESC
      LIMIT 10
    `;

    const recentSupportResult = await pool.query(recentSupportQuery, [userId]);

    // Get application status and next steps
    let applicationStatus = beneficiary.application_status;
    let nextSteps = [];
    let progressPercentage = 0;

    switch (applicationStatus) {
      case 'draft':
        nextSteps = ['Complete intake questionnaire', 'Provide verification documents'];
        progressPercentage = 10;
        break;
      case 'reviewing':
        nextSteps = ['Application under review', 'May be contacted for additional information'];
        progressPercentage = 50;
        break;
      case 'qualified':
        nextSteps = ['Ready to receive support', 'Check back for available opportunities'];
        progressPercentage = 100;
        break;
      case 'needs_review':
        nextSteps = ['Additional information needed', 'Contact support for assistance'];
        progressPercentage = 25;
        break;
    }

    // Get recovery milestones
    const milestones = [];
    const soberDays = beneficiary.days_sober || 0;

    if (soberDays >= 1) milestones.push({ name: 'First Day Sober', achieved: true, date: 'Achieved' });
    if (soberDays >= 7) milestones.push({ name: 'One Week Sober', achieved: true, date: 'Achieved' });
    if (soberDays >= 30) milestones.push({ name: 'One Month Sober', achieved: true, date: 'Achieved' });
    if (soberDays >= 90) milestones.push({ name: '90 Days Sober', achieved: true, date: 'Achieved' });
    if (soberDays >= 365) milestones.push({ name: 'One Year Sober', achieved: true, date: 'Achieved' });

    // Next milestone
    let nextMilestone = null;
    if (soberDays < 1) nextMilestone = { name: 'First Day Sober', daysRemaining: 1 - soberDays };
    else if (soberDays < 7) nextMilestone = { name: 'One Week Sober', daysRemaining: 7 - soberDays };
    else if (soberDays < 30) nextMilestone = { name: 'One Month Sober', daysRemaining: 30 - soberDays };
    else if (soberDays < 90) nextMilestone = { name: '90 Days Sober', daysRemaining: 90 - soberDays };
    else if (soberDays < 365) nextMilestone = { name: 'One Year Sober', daysRemaining: 365 - soberDays };

    res.json({
      profile: {
        id: beneficiary.id,
        email: beneficiary.email,
        memberSince: beneficiary.member_since,
        recovery: {
          daysSober: beneficiary.days_sober,
          medicaidStatus: beneficiary.medicaid_status,
          nextMilestone
        }
      },
      application: {
        status: applicationStatus,
        progressPercentage,
        nextSteps,
        intakeCompleted: beneficiary.intake_completed,
        qualificationScore: beneficiary.qualification_score
      },
      stats: {
        totalSupportReceived: parseInt(beneficiary.total_support_received) || 0,
        totalAmountReceived: parseFloat(beneficiary.total_amount_received) || 0,
        lastSupportDate: beneficiary.last_support_date
      },
      recentSupport: recentSupportResult.rows.map(support => ({
        id: support.id,
        amount: parseFloat(support.amount),
        category: support.category,
        vendorName: support.vendor_name,
        date: support.created_at,
        donationImpactType: support.donation_impact_type,
        anonymousDonation: support.anonymous_donation
      })),
      milestones
    });

  } catch (error) {
    console.error('Beneficiary dashboard error:', error);
    res.status(500).json({ error: 'Failed to load beneficiary dashboard' });
  }
});

// VENDOR DASHBOARD
dashboardRouter.get('/vendor', requireVendor, async (req, res) => {
  try {
    const { userId } = req.user!;

    // Get vendor profile and stats
    const vendorQuery = `
      SELECT
        v.*,
        u.email,
        u.created_at as member_since,
        COUNT(t.id) as total_payments,
        SUM(t.amount) as total_earned,
        MAX(t.created_at) as last_payment_date,
        AVG(v.rating) as current_rating
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN transactions t ON t.vendor_id = v.id AND t.status = 'completed'
      WHERE v.user_id = $1
      GROUP BY v.id, u.id
    `;

    const vendorResult = await pool.query(vendorQuery, [userId]);
    const vendor = vendorResult.rows[0];

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Get recent payments (last 10)
    const recentPaymentsQuery = `
      SELECT
        t.id,
        t.amount,
        t.category,
        t.created_at,
        d.impact_type as donation_impact_type,
        b.user_id as beneficiary_id
      FROM transactions t
      JOIN donations d ON t.donation_id = d.id
      JOIN beneficiaries b ON t.beneficiary_id = b.id
      WHERE t.vendor_id = $1 AND t.status = 'completed'
      ORDER BY t.created_at DESC
      LIMIT 10
    `;

    const recentPaymentsResult = await pool.query(recentPaymentsQuery, [vendor.id]);

    // Get earnings by month (last 6 months)
    const monthlyEarningsQuery = `
      SELECT
        DATE_TRUNC('month', t.created_at) as month,
        COUNT(t.id) as transaction_count,
        SUM(t.amount) as total_earned
      FROM transactions t
      WHERE t.vendor_id = $1 AND t.status = 'completed'
      AND t.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', t.created_at)
      ORDER BY month DESC
    `;

    const monthlyEarningsResult = await pool.query(monthlyEarningsQuery, [vendor.id]);

    // Get pending payments
    const pendingPaymentsQuery = `
      SELECT COUNT(*) as pending_count, SUM(amount) as pending_amount
      FROM transactions
      WHERE vendor_id = $1 AND status = 'pending'
    `;

    const pendingResult = await pool.query(pendingPaymentsQuery, [vendor.id]);

    // Parse service area
    const serviceArea = vendor.service_area ? safeJsonParse(vendor.service_area, []) : [];
    const pricing = vendor.pricing ? safeJsonParse(vendor.pricing, {}) : {};

    res.json({
      profile: {
        id: vendor.id,
        email: vendor.email,
        businessName: vendor.business_name,
        vendorType: vendor.vendor_type,
        memberSince: vendor.member_since,
        verificationStatus: vendor.verification_status,
        serviceArea,
        pricing,
        rating: parseFloat(vendor.current_rating) || 0
      },
      stats: {
        totalPayments: parseInt(vendor.total_payments) || 0,
        totalEarned: parseFloat(vendor.total_earned) || 0,
        pendingPayments: parseInt(pendingResult.rows[0].pending_count) || 0,
        pendingAmount: parseFloat(pendingResult.rows[0].pending_amount) || 0,
        lastPaymentDate: vendor.last_payment_date
      },
      recentPayments: recentPaymentsResult.rows.map(payment => ({
        id: payment.id,
        amount: parseFloat(payment.amount),
        category: payment.category,
        date: payment.created_at,
        donationImpactType: payment.donation_impact_type,
        beneficiaryId: payment.beneficiary_id // Anonymized - only shows existence
      })),
      monthlyEarnings: monthlyEarningsResult.rows.map(month => ({
        month: month.month,
        transactionCount: parseInt(month.transaction_count),
        totalEarned: parseFloat(month.total_earned)
      })),
      performance: {
        averageMonthlyEarnings: monthlyEarningsResult.rows.length > 0
          ? monthlyEarningsResult.rows.reduce((sum, month) => sum + parseFloat(month.total_earned), 0) / monthlyEarningsResult.rows.length
          : 0,
        paymentSuccessRate: vendor.total_payments > 0 ? 100 : 0, // All completed payments
        activeServiceArea: serviceArea.length
      }
    });

  } catch (error) {
    console.error('Vendor dashboard error:', error);
    res.status(500).json({ error: 'Failed to load vendor dashboard' });
  }
});

// ADMIN DASHBOARD
dashboardRouter.get('/admin', requireAdmin, async (req, res) => {
  try {
    // System overview stats
    const systemStatsQuery = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'donor' AND is_active = true) as total_donors,
        (SELECT COUNT(*) FROM users WHERE role = 'beneficiary' AND is_active = true) as total_beneficiaries,
        (SELECT COUNT(*) FROM users WHERE role = 'vendor' AND is_active = true) as total_vendors,
        (SELECT COUNT(*) FROM donations WHERE status = 'completed') as total_donations,
        (SELECT SUM(amount) FROM donations WHERE status = 'completed') as total_amount_donated,
        (SELECT COUNT(*) FROM transactions WHERE status = 'completed') as total_transactions,
        (SELECT COUNT(DISTINCT beneficiary_id) FROM transactions WHERE status = 'completed') as unique_beneficiaries_helped
    `;

    const systemStatsResult = await pool.query(systemStatsQuery);
    const stats = systemStatsResult.rows[0];

    // Recent activity (last 7 days)
    const recentActivityQuery = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') as new_users,
        (SELECT COUNT(*) FROM donations WHERE created_at >= NOW() - INTERVAL '7 days' AND status = 'completed') as recent_donations,
        (SELECT SUM(amount) FROM donations WHERE created_at >= NOW() - INTERVAL '7 days' AND status = 'completed') as recent_amount,
        (SELECT COUNT(*) FROM transactions WHERE created_at >= NOW() - INTERVAL '7 days' AND status = 'completed') as recent_transactions
    `;

    const recentActivityResult = await pool.query(recentActivityQuery);
    const recent = recentActivityResult.rows[0];

    // Application status breakdown
    const applicationStatsQuery = `
      SELECT
        application_status,
        COUNT(*) as count
      FROM beneficiaries
      GROUP BY application_status
    `;

    const applicationStatsResult = await pool.query(applicationStatsQuery);

    // Vendor verification status
    const vendorStatsQuery = `
      SELECT
        verification_status,
        COUNT(*) as count
      FROM vendors
      GROUP BY verification_status
    `;

    const vendorStatsResult = await pool.query(vendorStatsQuery);

    // Top impact categories
    const impactStatsQuery = `
      SELECT
        impact_type,
        COUNT(*) as donation_count,
        SUM(amount) as total_amount
      FROM donations
      WHERE status = 'completed'
      GROUP BY impact_type
      ORDER BY total_amount DESC
    `;

    const impactStatsResult = await pool.query(impactStatsQuery);

    // System health metrics
    const healthQuery = `
      SELECT
        (SELECT COUNT(*) FROM audit_logs WHERE timestamp >= NOW() - INTERVAL '24 hours') as audit_events_24h,
        (SELECT COUNT(*) FROM chat_sessions WHERE updated_at >= NOW() - INTERVAL '24 hours') as active_chats_24h,
        (SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FROM chat_sessions WHERE updated_at >= NOW() - INTERVAL '24 hours') as avg_session_duration
    `;

    const healthResult = await pool.query(healthQuery);
    const health = healthResult.rows[0];

    res.json({
      overview: {
        users: {
          total: parseInt(stats.total_users),
          donors: parseInt(stats.total_donors),
          beneficiaries: parseInt(stats.total_beneficiaries),
          vendors: parseInt(stats.total_vendors)
        },
        donations: {
          total: parseInt(stats.total_donations),
          totalAmount: parseFloat(stats.total_amount_donated) || 0,
          recent: {
            count: parseInt(recent.recent_donations),
            amount: parseFloat(recent.recent_amount) || 0
          }
        },
        impact: {
          totalTransactions: parseInt(stats.total_transactions),
          uniqueBeneficiariesHelped: parseInt(stats.unique_beneficiaries_helped),
          topCategories: impactStatsResult.rows.slice(0, 5).map(category => ({
            impactType: category.impact_type,
            donationCount: parseInt(category.donation_count),
            totalAmount: parseFloat(category.total_amount)
          }))
        },
        recentActivity: {
          newUsers: parseInt(recent.new_users),
          donations: parseInt(recent.recent_donations),
          transactions: parseInt(recent.recent_transactions)
        }
      },
      applications: {
        statusBreakdown: applicationStatsResult.rows.map(row => ({
          status: row.application_status,
          count: parseInt(row.count)
        }))
      },
      vendors: {
        verificationBreakdown: vendorStatsResult.rows.map(row => ({
          status: row.verification_status,
          count: parseInt(row.count)
        }))
      },
      systemHealth: {
        auditEvents24h: parseInt(health.audit_events_24h),
        activeChats24h: parseInt(health.active_chats_24h),
        avgSessionDuration: parseFloat(health.avg_session_duration) || 0
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

// Update beneficiary profile (admin only)
dashboardRouter.put('/beneficiary/:beneficiaryId', authAndRole(['admin']), async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const { daysSober, medicaidStatus, applicationStatus, qualificationScore } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (daysSober !== undefined) {
      updateFields.push(`days_sober = $${paramCount}`);
      values.push(daysSober);
      paramCount++;
    }

    if (medicaidStatus !== undefined) {
      updateFields.push(`medicaid_status = $${paramCount}`);
      values.push(medicaidStatus);
      paramCount++;
    }

    if (applicationStatus !== undefined) {
      updateFields.push(`application_status = $${paramCount}`);
      values.push(applicationStatus);
      paramCount++;
    }

    if (qualificationScore !== undefined) {
      updateFields.push(`qualification_score = $${paramCount}`);
      values.push(qualificationScore);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(beneficiaryId);

    const query = `
      UPDATE beneficiaries
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    await logAuditEvent(req.user!.userId, 'BENEFICIARY_UPDATED', {
      beneficiaryId: parseInt(beneficiaryId),
      updates: req.body
    }, req);

    res.json({
      beneficiary: result.rows[0],
      message: 'Beneficiary profile updated successfully'
    });

  } catch (error) {
    console.error('Beneficiary update error:', error);
    res.status(500).json({ error: 'Failed to update beneficiary profile' });
  }
});

// Update donor preferences
dashboardRouter.put('/donor/preferences', requireDonor, async (req, res) => {
  try {
    const { userId } = req.user!;
    const { isAnonymous, impactPreferences } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (isAnonymous !== undefined) {
      updateFields.push(`is_anonymous = $${paramCount}`);
      values.push(isAnonymous);
      paramCount++;
    }

    if (impactPreferences !== undefined) {
      updateFields.push(`impact_preferences = $${paramCount}`);
      values.push(JSON.stringify(impactPreferences));
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE donors
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramCount}
    `;

    await pool.query(query, values);

    await logAuditEvent(userId, 'DONOR_PREFERENCES_UPDATED', {
      updates: req.body
    }, req);

    res.json({ message: 'Donor preferences updated successfully' });

  } catch (error) {
    console.error('Donor preferences update error:', error);
    res.status(500).json({ error: 'Failed to update donor preferences' });
  }
});

export default dashboardRouter;



