import { getDatabasePool } from '../config/database.js';
import { ChatSession, Message } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, DatabaseError } from '../utils/errors.js';

export const createChatSession = async (
  userId: string,
  sessionType: 'INTAKE' | 'COACH'
): Promise<ChatSession> => {
  const pool = getDatabasePool();

  // Intake sessions expire after 30 days (ephemeral)
  // Coach sessions don't expire (permanent with consent)
  const expiresAt = sessionType === 'INTAKE' 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : null;

  try {
    const result = await pool.query(
      `INSERT INTO chat_sessions (user_id, session_type, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, sessionType, expiresAt]
    );

    logger.info('Chat session created:', {
      sessionId: result.rows[0].id,
      userId,
      sessionType,
    });

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create chat session:', error);
    throw new DatabaseError('Failed to create chat session');
  }
};

export const getChatSession = async (sessionId: string): Promise<ChatSession | null> => {
  const pool = getDatabasePool();

  const result = await pool.query(
    `SELECT * FROM chat_sessions 
     WHERE id = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
    [sessionId]
  );

  return result.rows[0] || null;
};

export const getUserChatSessions = async (
  userId: string,
  sessionType?: 'INTAKE' | 'COACH'
): Promise<ChatSession[]> => {
  const pool = getDatabasePool();

  let query = `SELECT * FROM chat_sessions 
               WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())`;
  const params: any[] = [userId];

  if (sessionType) {
    query += ' AND session_type = $2';
    params.push(sessionType);
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

export const saveMessage = async (
  sessionId: string,
  role: 'user' | 'model',
  content: string
): Promise<Message> => {
  const pool = getDatabasePool();

  try {
    const result = await pool.query(
      `INSERT INTO messages (session_id, role, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [sessionId, role, content]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to save message:', error);
    throw new DatabaseError('Failed to save message');
  }
};

export const getConversationHistory = async (
  sessionId: string,
  limit: number = 50
): Promise<Message[]> => {
  const pool = getDatabasePool();

  const result = await pool.query(
    `SELECT * FROM messages 
     WHERE session_id = $1 
     ORDER BY created_at ASC 
     LIMIT $2`,
    [sessionId, limit]
  );

  return result.rows;
};

export const deleteChatSession = async (sessionId: string, userId: string): Promise<void> => {
  const pool = getDatabasePool();

  // Verify session belongs to user
  const session = await getChatSession(sessionId);
  if (!session) {
    throw new NotFoundError('Chat session');
  }

  if (session.user_id !== userId) {
    throw new Error('Unauthorized: Session does not belong to user');
  }

  // Delete messages first (CASCADE should handle this, but being explicit)
  await pool.query('DELETE FROM messages WHERE session_id = $1', [sessionId]);
  
  // Delete session
  await pool.query('DELETE FROM chat_sessions WHERE id = $1', [sessionId]);

  logger.info('Chat session deleted:', { sessionId, userId });
};

// Cleanup expired intake sessions (run periodically)
export const cleanupExpiredChatSessions = async (): Promise<number> => {
  const pool = getDatabasePool();

  try {
    // Delete expired sessions and their messages
    const result = await pool.query(
      `DELETE FROM chat_sessions 
       WHERE expires_at IS NOT NULL AND expires_at < NOW()
       RETURNING id`
    );

    const count = result.rows.length;
    if (count > 0) {
      logger.info(`Cleaned up ${count} expired chat sessions`);
    }

    return count;
  } catch (error) {
    logger.error('Failed to cleanup expired chat sessions:', error);
    return 0;
  }
};
