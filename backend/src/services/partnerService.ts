import { getDatabasePool } from '../config/database.js';
import { Partner, PartnerComplianceStatus } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';

export interface CreatePartnerInput {
  name: string;
  address: string;
  ein: string;
  type: string;
  bedCount?: number;
  monthlyRent?: number;
  acceptsMat: boolean;
  hasNaloxone: boolean;
  hasInsurance: boolean;
  isRraMember: boolean;
}

export interface UpdatePartnerInput {
  complianceStatus?: PartnerComplianceStatus;
  acceptsMat?: boolean;
  hasNaloxone?: boolean;
  hasInsurance?: boolean;
  isRraMember?: boolean;
  stripeSubscriptionId?: string;
}

export const createPartner = async (input: CreatePartnerInput): Promise<Partner> => {
  const pool = getDatabasePool();

  // Validate required fields
  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError('Partner name is required');
  }

  if (!input.address || input.address.trim().length === 0) {
    throw new ValidationError('Address is required');
  }

  if (!input.ein) {
    throw new ValidationError('EIN is required');
  }

  // Validate EIN format (XX-XXXXXXX)
  const einRegex = /^\d{2}-\d{7}$/;
  if (!einRegex.test(input.ein)) {
    throw new ValidationError('EIN must be in format XX-XXXXXXX');
  }

  // Validate bed count
  if (input.bedCount !== undefined && (input.bedCount < 1 || input.bedCount > 1000)) {
    throw new ValidationError('Bed count must be between 1 and 1000');
  }

  // Validate monthly rent
  if (input.monthlyRent !== undefined && input.monthlyRent < 0) {
    throw new ValidationError('Monthly rent cannot be negative');
  }

  // Compliance requirements
  if (!input.hasNaloxone) {
    throw new ValidationError('Naloxone availability is mandatory');
  }

  if (!input.hasInsurance) {
    throw new ValidationError('Liability insurance is required');
  }

  try {
    const result = await pool.query(
      `INSERT INTO partners (
        name, address, ein, type, bed_count, monthly_rent,
        accepts_mat, has_naloxone, has_insurance, is_rra_member,
        compliance_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING *`,
      [
        input.name.trim(),
        input.address.trim(),
        input.ein,
        input.type || null,
        input.bedCount || null,
        input.monthlyRent || null,
        input.acceptsMat,
        input.hasNaloxone,
        input.hasInsurance,
        input.isRraMember,
      ]
    );

    logger.info('Partner application created:', {
      partnerId: result.rows[0].id,
      name: input.name,
      ein: input.ein,
    });

    return result.rows[0];
  } catch (error: any) {
    logger.error('Failed to create partner:', error);
    if (error.code === '23505') {
      throw new ValidationError('Partner with this EIN already exists');
    }
    throw new DatabaseError('Failed to create partner application');
  }
};

export const getPartnerById = async (id: string): Promise<Partner | null> => {
  const pool = getDatabasePool();

  const result = await pool.query('SELECT * FROM partners WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getPartnerByEin = async (ein: string): Promise<Partner | null> => {
  const pool = getDatabasePool();

  const result = await pool.query('SELECT * FROM partners WHERE ein = $1', [ein]);
  return result.rows[0] || null;
};

export const updatePartner = async (
  id: string,
  input: UpdatePartnerInput
): Promise<Partner> => {
  const pool = getDatabasePool();

  // Validate compliance status if provided
  if (input.complianceStatus) {
    const validStatuses: PartnerComplianceStatus[] = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(input.complianceStatus)) {
      throw new ValidationError(
        `Invalid compliance status. Must be one of: ${validStatuses.join(', ')}`
      );
    }
  }

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.complianceStatus !== undefined) {
      updates.push(`compliance_status = $${paramCount++}`);
      values.push(input.complianceStatus);
    }

    if (input.acceptsMat !== undefined) {
      updates.push(`accepts_mat = $${paramCount++}`);
      values.push(input.acceptsMat);
    }

    if (input.hasNaloxone !== undefined) {
      updates.push(`has_naloxone = $${paramCount++}`);
      values.push(input.hasNaloxone);
    }

    if (input.hasInsurance !== undefined) {
      updates.push(`has_insurance = $${paramCount++}`);
      values.push(input.hasInsurance);
    }

    if (input.isRraMember !== undefined) {
      updates.push(`is_rra_member = $${paramCount++}`);
      values.push(input.isRraMember);
    }

    if (input.stripeSubscriptionId !== undefined) {
      updates.push(`stripe_subscription_id = $${paramCount++}`);
      values.push(input.stripeSubscriptionId);
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE partners 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Partner');
    }

    logger.info('Partner updated:', { partnerId: id, updates: input });
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    logger.error('Failed to update partner:', error);
    throw new DatabaseError('Failed to update partner');
  }
};

export const getAllPartners = async (
  complianceStatus?: PartnerComplianceStatus
): Promise<Partner[]> => {
  const pool = getDatabasePool();

  let query = 'SELECT * FROM partners WHERE 1=1';
  const params: any[] = [];

  if (complianceStatus) {
    query += ' AND compliance_status = $1';
    params.push(complianceStatus);
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};
