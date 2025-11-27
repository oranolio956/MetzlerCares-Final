import { getDatabasePool } from '../config/database.js';
import { Vendor, TransactionCategory } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';

export interface CreateVendorInput {
  name: string;
  category?: TransactionCategory;
}

export const createVendor = async (input: CreateVendorInput): Promise<Vendor> => {
  const pool = getDatabasePool();

  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError('Vendor name is required');
  }

  if (input.name.length > 255) {
    throw new ValidationError('Vendor name must be 255 characters or less');
  }

  if (input.category) {
    const validCategories: TransactionCategory[] = ['RENT', 'TRANSPORT', 'TECH'];
    if (!validCategories.includes(input.category)) {
      throw new ValidationError(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO vendors (name, category, verified)
       VALUES ($1, $2, false)
       RETURNING *`,
      [input.name.trim(), input.category || null]
    );

    logger.info('Vendor created:', { vendorId: result.rows[0].id, name: input.name });
    return result.rows[0];
  } catch (error: any) {
    logger.error('Failed to create vendor:', error);
    if (error.code === '23505') {
      throw new ValidationError('Vendor with this name already exists');
    }
    throw new DatabaseError('Failed to create vendor');
  }
};

export const getVendorById = async (id: string): Promise<Vendor | null> => {
  const pool = getDatabasePool();

  const result = await pool.query('SELECT * FROM vendors WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getVendorByName = async (name: string): Promise<Vendor | null> => {
  const pool = getDatabasePool();

  const result = await pool.query(
    'SELECT * FROM vendors WHERE name ILIKE $1',
    [name]
  );

  return result.rows[0] || null;
};

export const getAllVendors = async (
  category?: TransactionCategory,
  verified?: boolean
): Promise<Vendor[]> => {
  const pool = getDatabasePool();

  let query = 'SELECT * FROM vendors WHERE 1=1';
  const params: any[] = [];
  let paramCount = 1;

  if (category) {
    query += ` AND category = $${paramCount++}`;
    params.push(category);
  }

  if (verified !== undefined) {
    query += ` AND verified = $${paramCount++}`;
    params.push(verified);
  }

  query += ' ORDER BY name ASC';

  const result = await pool.query(query, params);
  return result.rows;
};

export const verifyVendor = async (id: string): Promise<Vendor> => {
  const pool = getDatabasePool();

  try {
    const result = await pool.query(
      `UPDATE vendors 
       SET verified = true, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Vendor');
    }

    logger.info('Vendor verified:', { vendorId: id });
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to verify vendor:', error);
    throw new DatabaseError('Failed to verify vendor');
  }
};
