import { getDatabasePool } from '../config/database.js';
import { Donation, ImpactType } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';

export interface CreateDonationInput {
  userId: string;
  amount: number;
  impactType: ImpactType;
  itemLabel: string;
  stripePaymentIntentId: string;
}

export const createDonation = async (input: CreateDonationInput): Promise<Donation> => {
  const pool = getDatabasePool();

  // Validate amount
  if (input.amount <= 0) {
    throw new ValidationError('Donation amount must be greater than 0');
  }

  // Validate impact type
  const validImpactTypes: ImpactType[] = ['commute', 'home', 'tech'];
  if (!validImpactTypes.includes(input.impactType)) {
    throw new ValidationError(`Invalid impact type. Must be one of: ${validImpactTypes.join(', ')}`);
  }

  try {
    const result = await pool.query(
      `INSERT INTO donations (user_id, amount, impact_type, item_label, stripe_payment_intent_id, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [
        input.userId,
        input.amount,
        input.impactType,
        input.itemLabel,
        input.stripePaymentIntentId,
      ]
    );

    logger.info('Donation created:', {
      donationId: result.rows[0].id,
      userId: input.userId,
      amount: input.amount,
    });

    return result.rows[0];
  } catch (error: any) {
    logger.error('Failed to create donation:', error);
    if (error.code === '23505') {
      throw new ValidationError('Payment intent already used');
    }
    throw new DatabaseError('Failed to create donation');
  }
};

export const getDonationById = async (id: string): Promise<Donation | null> => {
  const pool = getDatabasePool();

  const result = await pool.query('SELECT * FROM donations WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getDonationByPaymentIntent = async (
  paymentIntentId: string
): Promise<Donation | null> => {
  const pool = getDatabasePool();

  const result = await pool.query(
    'SELECT * FROM donations WHERE stripe_payment_intent_id = $1',
    [paymentIntentId]
  );

  return result.rows[0] || null;
};

export const updateDonationStatus = async (
  id: string,
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
): Promise<Donation> => {
  const pool = getDatabasePool();

  try {
    const result = await pool.query(
      `UPDATE donations 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Donation');
    }

    logger.info('Donation status updated:', { donationId: id, status });
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to update donation status:', error);
    throw new DatabaseError('Failed to update donation status');
  }
};

export const getUserDonations = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ donations: Donation[]; total: number }> => {
  const pool = getDatabasePool();

  try {
    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM donations WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get donations
    const result = await pool.query(
      `SELECT * FROM donations 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      donations: result.rows,
      total,
    };
  } catch (error) {
    logger.error('Failed to get user donations:', error);
    throw new DatabaseError('Failed to fetch donations');
  }
};

export const getDonationStats = async (userId: string): Promise<{
  totalDonated: number;
  totalDonations: number;
  byImpactType: Record<ImpactType, number>;
}> => {
  const pool = getDatabasePool();

  try {
    const result = await pool.query(
      `SELECT 
         COALESCE(SUM(amount), 0) as total_donated,
         COUNT(*) as total_donations,
         impact_type,
         SUM(amount) as type_total
       FROM donations 
       WHERE user_id = $1 AND status = 'succeeded'
       GROUP BY impact_type`,
      [userId]
    );

    const totalDonated = parseFloat(result.rows[0]?.total_donated || '0');
    const totalDonations = parseInt(result.rows[0]?.total_donations || '0', 10);

    const byImpactType: Record<ImpactType, number> = {
      commute: 0,
      home: 0,
      tech: 0,
    };

    result.rows.forEach((row) => {
      if (row.impact_type && byImpactType.hasOwnProperty(row.impact_type)) {
        byImpactType[row.impact_type as ImpactType] = parseFloat(row.type_total || '0');
      }
    });

    return {
      totalDonated,
      totalDonations,
      byImpactType,
    };
  } catch (error) {
    logger.error('Failed to get donation stats:', error);
    throw new DatabaseError('Failed to fetch donation statistics');
  }
};
