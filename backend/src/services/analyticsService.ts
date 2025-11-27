import { getDatabasePool } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../utils/errors.js';
import { ImpactType } from '../types/index.js';

export interface DonorAnalytics {
  totalInvested: number;
  livesImpacted: number;
  activeProjects: number;
  socialRoi: number;
  byImpactType: Record<ImpactType, number>;
  recentImpact: Array<{
    id: string;
    beneficiary: string;
    action: string;
    outcome: string;
    date: string;
    type: ImpactType;
  }>;
}

export const getDonorAnalytics = async (userId: string): Promise<DonorAnalytics> => {
  const pool = getDatabasePool();

  try {
    // Get total invested
    const totalResult = await pool.query(
      `SELECT 
         COALESCE(SUM(amount), 0) as total_invested,
         COUNT(*) as total_donations
       FROM donations 
       WHERE user_id = $1 AND status = 'succeeded'`,
      [userId]
    );

    const totalInvested = parseFloat(totalResult.rows[0]?.total_invested || '0');
    const totalDonations = parseInt(totalResult.rows[0]?.total_donations || '0', 10);

    // Get by impact type
    const impactResult = await pool.query(
      `SELECT impact_type, SUM(amount) as type_total, COUNT(*) as type_count
       FROM donations 
       WHERE user_id = $1 AND status = 'succeeded'
       GROUP BY impact_type`,
      [userId]
    );

    const byImpactType: Record<ImpactType, number> = {
      commute: 0,
      home: 0,
      tech: 0,
    };

    impactResult.rows.forEach((row) => {
      if (row.impact_type && byImpactType.hasOwnProperty(row.impact_type)) {
        byImpactType[row.impact_type as ImpactType] = parseFloat(row.type_total || '0');
      }
    });

    // Calculate lives impacted (simplified: each donation impacts one life)
    const livesImpacted = totalDonations;

    // Calculate active projects (donations in last 30 days)
    const activeResult = await pool.query(
      `SELECT COUNT(*) as active_count
       FROM donations 
       WHERE user_id = $1 
       AND status = 'succeeded' 
       AND created_at > NOW() - INTERVAL '30 days'`,
      [userId]
    );

    const activeProjects = parseInt(activeResult.rows[0]?.active_count || '0', 10);

    // Calculate social ROI (simplified multiplier)
    // In production, this would be more sophisticated
    const socialRoi = totalInvested > 0 ? (totalInvested * 4.2) : 0;

    // Get recent impact stories (from transactions)
    const impactStoriesResult = await pool.query(
      `SELECT 
         t.id,
         t.vendor as beneficiary,
         t.category,
         t.amount,
         t.created_at,
         d.impact_type
       FROM transactions t
       LEFT JOIN donations d ON t.donation_id = d.id
       WHERE d.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 10`,
      [userId]
    );

    const recentImpact = impactStoriesResult.rows.map((row) => ({
      id: row.id,
      beneficiary: row.beneficiary || 'Anonymous',
      action: `funded ${row.category.toLowerCase()}`,
      outcome: `$${parseFloat(row.amount).toFixed(2)} deployed`,
      date: new Date(row.created_at).toLocaleDateString(),
      type: (row.impact_type || 'home') as ImpactType,
    }));

    return {
      totalInvested,
      livesImpacted,
      activeProjects,
      socialRoi,
      byImpactType,
      recentImpact,
    };
  } catch (error) {
    logger.error('Failed to get donor analytics:', error);
    throw new DatabaseError('Failed to fetch donor analytics');
  }
};

export interface PlatformAnalytics {
  totalDonations: number;
  totalAmount: number;
  totalUsers: number;
  totalApplications: number;
  totalPartners: number;
  donationsByMonth: Array<{ month: string; amount: number; count: number }>;
}

export const getPlatformAnalytics = async (): Promise<PlatformAnalytics> => {
  const pool = getDatabasePool();

  try {
    // Get totals
    const totalsResult = await pool.query(
      `SELECT 
         (SELECT COUNT(*) FROM donations WHERE status = 'succeeded') as total_donations,
         (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'succeeded') as total_amount,
         (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
         (SELECT COUNT(*) FROM applications) as total_applications,
         (SELECT COUNT(*) FROM partners WHERE compliance_status = 'approved') as total_partners`
    );

    const totalDonations = parseInt(totalsResult.rows[0]?.total_donations || '0', 10);
    const totalAmount = parseFloat(totalsResult.rows[0]?.total_amount || '0');
    const totalUsers = parseInt(totalsResult.rows[0]?.total_users || '0', 10);
    const totalApplications = parseInt(totalsResult.rows[0]?.total_applications || '0', 10);
    const totalPartners = parseInt(totalsResult.rows[0]?.total_partners || '0', 10);

    // Get donations by month (last 12 months)
    const monthlyResult = await pool.query(
      `SELECT 
         TO_CHAR(created_at, 'YYYY-MM') as month,
         COALESCE(SUM(amount), 0) as amount,
         COUNT(*) as count
       FROM donations 
       WHERE status = 'succeeded' 
       AND created_at > NOW() - INTERVAL '12 months'
       GROUP BY TO_CHAR(created_at, 'YYYY-MM')
       ORDER BY month DESC`
    );

    const donationsByMonth = monthlyResult.rows.map((row) => ({
      month: row.month,
      amount: parseFloat(row.amount || '0'),
      count: parseInt(row.count || '0', 10),
    }));

    return {
      totalDonations,
      totalAmount,
      totalUsers,
      totalApplications,
      totalPartners,
      donationsByMonth,
    };
  } catch (error) {
    logger.error('Failed to get platform analytics:', error);
    throw new DatabaseError('Failed to fetch platform analytics');
  }
};
