import { getDatabasePool } from '../../src/config/database.js';
import { generateAccessToken, generateRefreshToken } from '../../src/utils/jwt.js';
import { UserType } from '../../src/types/index.js';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  accessToken: string;
  refreshToken: string;
}

/**
 * Create a test user in the database
 */
export const createTestUser = async (
  email: string = 'test@example.com',
  name: string = 'Test User',
  userType: UserType = 'donor'
): Promise<TestUser> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    `INSERT INTO users (email, name, user_type, oauth_provider, oauth_id)
     VALUES ($1, $2, $3, 'test', $4)
     RETURNING id, email, name, user_type`,
    [email, name, userType, `test-${Date.now()}`]
  );

  const user = result.rows[0];
  
  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    userType: user.user_type,
  });
  
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    userType: user.user_type,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.user_type,
    accessToken,
    refreshToken,
  };
};

/**
 * Create a test session
 */
export const createTestSession = async (
  userId: string,
  token: string = generateAccessToken({ userId, email: 'test@example.com', userType: 'donor' }),
  refreshToken: string = generateRefreshToken({ userId, email: 'test@example.com', userType: 'donor' })
): Promise<string> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    `INSERT INTO sessions (user_id, token, refresh_token, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '1 day')
     RETURNING id`,
    [userId, token, refreshToken]
  );

  return result.rows[0].id;
};

/**
 * Create a test donation
 */
export const createTestDonation = async (
  userId: string,
  amount: number = 100,
  status: string = 'succeeded'
): Promise<string> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    `INSERT INTO donations (user_id, amount, impact_type, item_label, stripe_payment_intent_id, status)
     VALUES ($1, $2, 'tech', 'Test Item', $3, $4)
     RETURNING id`,
    [userId, amount, `pi_test_${Date.now()}`, status]
  );

  return result.rows[0].id;
};

/**
 * Create a test application
 */
export const createTestApplication = async (
  userId: string,
  type: string = 'rent',
  status: string = 'reviewing'
): Promise<string> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    `INSERT INTO applications (user_id, type, status, details)
     VALUES ($1, $2, $3, 'Test application details')
     RETURNING id`,
    [userId, type, status]
  );

  return result.rows[0].id;
};

/**
 * Create a test transaction
 */
export const createTestTransaction = async (
  donationId: string | null = null,
  category: 'RENT' | 'TRANSPORT' | 'TECH' = 'TECH',
  amount: number = 100
): Promise<string> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    `INSERT INTO transactions (donation_id, category, amount, vendor, recipient_hash, status)
     VALUES ($1, $2, $3, 'Test Vendor', '0x1234567890abcdef', 'completed')
     RETURNING id`,
    [donationId, category, amount]
  );

  return result.rows[0].id;
};

/**
 * Wait for a specified amount of time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
