import { getDatabasePool } from '../config/database.js';
import { User, UserType } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { ConflictError, DatabaseError } from '../utils/errors.js';

export const createUser = async (
  email: string,
  name: string | null,
  userType: UserType,
  oauthProvider: string | null = null,
  oauthId: string | null = null
): Promise<User> => {
  const pool = getDatabasePool();
  
  try {
    const result = await pool.query(
      `INSERT INTO users (email, name, user_type, oauth_provider, oauth_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, name, userType, oauthProvider, oauthId]
    );

    const user = result.rows[0];
    logger.info('User created:', { userId: user.id, email });

    // Auto-create beneficiary profile if user is beneficiary
    if (userType === 'beneficiary') {
      try {
        const { createOrUpdateBeneficiaryProfile } = await import('./beneficiaryService.js');
        await createOrUpdateBeneficiaryProfile(user.id, {
          days_sober: 0,
          next_milestone: null,
          insurance_status: 'none',
        });
        logger.info('Beneficiary profile auto-created:', { userId: user.id });
      } catch (error) {
        logger.error('Failed to create beneficiary profile:', error);
        // Don't fail user creation if profile creation fails
      }
    }

    return user;
  } catch (error: any) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new ConflictError('User with this email already exists');
    }
    logger.error('Failed to create user:', error);
    throw new DatabaseError('Failed to create user');
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );

  return result.rows[0] || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );

  return result.rows[0] || null;
};

export const getUserByOAuth = async (
  provider: string,
  oauthId: string
): Promise<User | null> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2 AND deleted_at IS NULL',
    [provider, oauthId]
  );

  return result.rows[0] || null;
};

export const updateUser = async (
  id: string,
  updates: Partial<Pick<User, 'name' | 'email'>>
): Promise<User> => {
  const pool = getDatabasePool();
  
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }

  if (updates.email !== undefined) {
    fields.push(`email = $${paramCount++}`);
    values.push(updates.email);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount} AND deleted_at IS NULL
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new DatabaseError('User not found');
  }

  return result.rows[0];
};
