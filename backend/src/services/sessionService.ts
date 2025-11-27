import { getDatabasePool } from '../config/database.js';
import { getRedisClient } from '../config/redis.js';
import { Session } from '../types/index.js';
import { TokenPair } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

export const createSession = async (
  userId: string,
  tokenPair: TokenPair
): Promise<Session> => {
  const pool = getDatabasePool();
  const redis = getRedisClient();

  // Calculate expiration (15 minutes for access token)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  try {
    const result = await pool.query(
      `INSERT INTO sessions (user_id, token, refresh_token, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, tokenPair.accessToken, tokenPair.refreshToken, expiresAt]
    );

    // Store refresh token in Redis for quick lookup
    await redis.setEx(
      `refresh:${tokenPair.refreshToken}`,
      7 * 24 * 60 * 60, // 7 days
      userId
    );

    logger.info('Session created:', { userId, sessionId: result.rows[0].id });
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create session:', error);
    throw error;
  }
};

export const invalidateSession = async (token: string): Promise<void> => {
  const pool = getDatabasePool();
  const redis = getRedisClient();

  try {
    // Blacklist the access token
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (expiresIn > 0) {
      await redis.setEx(`blacklist:${token}`, expiresIn, '1');
    }

    // Remove from database
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);

    logger.info('Session invalidated:', { token: token.substring(0, 20) + '...' });
  } catch (error) {
    logger.error('Failed to invalidate session:', error);
    throw error;
  }
};

export const invalidateAllUserSessions = async (userId: string): Promise<void> => {
  const pool = getDatabasePool();
  const redis = getRedisClient();

  try {
    // Get all sessions for user
    const result = await pool.query(
      'SELECT token, refresh_token FROM sessions WHERE user_id = $1',
      [userId]
    );

    // Blacklist all tokens
    for (const session of result.rows) {
      if (session.token) {
        await redis.set(`blacklist:${session.token}`, '1');
      }
      if (session.refresh_token) {
        await redis.del(`refresh:${session.refresh_token}`);
      }
    }

    // Delete from database
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);

    logger.info('All sessions invalidated for user:', { userId });
  } catch (error) {
    logger.error('Failed to invalidate all sessions:', error);
    throw error;
  }
};

export const getSessionByToken = async (token: string): Promise<Session | null> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    'SELECT * FROM sessions WHERE token = $1 OR refresh_token = $1 AND expires_at > NOW()',
    [token]
  );

  return result.rows[0] || null;
};

export const cleanupExpiredSessions = async (): Promise<number> => {
  const pool = getDatabasePool();
  
  const result = await pool.query(
    'DELETE FROM sessions WHERE expires_at < NOW() RETURNING id'
  );

  const count = result.rows.length;
  if (count > 0) {
    logger.info(`Cleaned up ${count} expired sessions`);
  }

  return count;
};
