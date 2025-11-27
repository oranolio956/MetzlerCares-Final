import { getDatabasePool } from '../config/database.js';
import { BeneficiaryProfile, InsuranceStatus, ApplicationStatus } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, ValidationError } from '../utils/errors.js';

export const getBeneficiaryProfile = async (userId: string): Promise<BeneficiaryProfile | null> => {
  const pool = getDatabasePool();

  const result = await pool.query(
    'SELECT * FROM beneficiary_profiles WHERE user_id = $1',
    [userId]
  );

  return result.rows[0] || null;
};

export const createOrUpdateBeneficiaryProfile = async (
  userId: string,
  updates: Partial<Pick<BeneficiaryProfile, 'days_sober' | 'next_milestone' | 'insurance_status'>>
): Promise<BeneficiaryProfile> => {
  const pool = getDatabasePool();

  try {
    // Check if profile exists
    const existing = await getBeneficiaryProfile(userId);

    if (existing) {
      // Update existing profile
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.days_sober !== undefined) {
        if (updates.days_sober < 0) {
          throw new ValidationError('days_sober cannot be negative');
        }
        updateFields.push(`days_sober = $${paramCount++}`);
        values.push(updates.days_sober);
      }

      if (updates.next_milestone !== undefined) {
        if (updates.next_milestone !== null && updates.next_milestone < 0) {
          throw new ValidationError('next_milestone cannot be negative');
        }
        updateFields.push(`next_milestone = $${paramCount++}`);
        values.push(updates.next_milestone);
      }

      if (updates.insurance_status !== undefined && updates.insurance_status !== null) {
        const validStatuses: InsuranceStatus[] = ['verified', 'pending', 'none'];
        if (!validStatuses.includes(updates.insurance_status)) {
          throw new ValidationError(`Invalid insurance status. Must be one of: ${validStatuses.join(', ')}`);
        }
        updateFields.push(`insurance_status = $${paramCount++}`);
        values.push(updates.insurance_status);
      }

      if (updateFields.length === 0) {
        return existing;
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(userId);

      const result = await pool.query(
        `UPDATE beneficiary_profiles 
         SET ${updateFields.join(', ')}
         WHERE user_id = $${paramCount}
         RETURNING *`,
        values
      );

      return result.rows[0];
    } else {
      // Create new profile
      const result = await pool.query(
        `INSERT INTO beneficiary_profiles (user_id, days_sober, next_milestone, insurance_status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          userId,
          updates.days_sober ?? 0,
          updates.next_milestone ?? null,
          updates.insurance_status ?? 'none',
        ]
      );

      logger.info('Beneficiary profile created:', { userId });
      return result.rows[0];
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logger.error('Failed to create/update beneficiary profile:', error);
    throw new DatabaseError('Failed to update beneficiary profile');
  }
};

export const getBeneficiaryDashboard = async (userId: string): Promise<{
  profile: BeneficiaryProfile | null;
  applications: Array<{
    id: string;
    type: string;
    status: ApplicationStatus;
    date: string;
    note?: string;
    details?: string;
  }>;
  daysSober: number;
  nextMilestone: number | null;
  insuranceStatus: InsuranceStatus | null;
}> => {
  const pool = getDatabasePool();

  try {
    // Get profile
    const profile = await getBeneficiaryProfile(userId);

    // Get applications
    const applicationsResult = await pool.query(
      `SELECT id, type, status, created_at, details
       FROM applications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    const applications = applicationsResult.rows.map((app) => ({
      id: app.id,
      type: app.type,
      status: app.status,
      date: new Date(app.created_at).toLocaleDateString(),
      details: app.details,
      note: app.status === 'action_needed' ? 'Action required' : undefined,
    }));

    return {
      profile,
      applications,
      daysSober: profile?.days_sober ?? 0,
      nextMilestone: profile?.next_milestone ?? null,
      insuranceStatus: profile?.insurance_status ?? null,
    };
  } catch (error) {
    logger.error('Failed to get beneficiary dashboard:', error);
    throw new DatabaseError('Failed to fetch beneficiary dashboard');
  }
};

export const verifyInsurance = async (
  userId: string,
  status: 'verified' | 'pending'
): Promise<BeneficiaryProfile> => {
  return await createOrUpdateBeneficiaryProfile(userId, {
    insurance_status: status,
  });
};
