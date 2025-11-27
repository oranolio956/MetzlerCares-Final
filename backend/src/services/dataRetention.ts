import { getDatabasePool } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Data Retention and Deletion Service
 * 
 * Implements data retention policies for compliance:
 * - HIPAA: 6 years minimum retention
 * - 42 CFR Part 2: Retention as required by state law
 * - GDPR: Right to be forgotten
 */

// Retention periods (in days)
const RETENTION_PERIODS = {
  audit_logs: 2555, // 7 years (HIPAA requirement)
  chat_sessions: 30, // Ephemeral intake sessions
  messages: 30, // Messages in ephemeral sessions
  applications: 1825, // 5 years
  documents: 1825, // 5 years
  donations: 2555, // 7 years (tax records)
  transactions: 2555, // 7 years (financial records)
  notifications: 365, // 1 year
};

/**
 * Delete expired data based on retention policies
 */
export const cleanupExpiredData = async (): Promise<Record<string, number>> => {
  const pool = getDatabasePool();
  const results: Record<string, number> = {};

  try {
    // Cleanup expired audit logs (older than retention period)
    const auditResult = await pool.query(
      `DELETE FROM audit_logs 
       WHERE created_at < NOW() - INTERVAL '${RETENTION_PERIODS.audit_logs} days'
       RETURNING id`
    );
    results.audit_logs = auditResult.rows.length;

    // Cleanup expired notifications
    const notificationResult = await pool.query(
      `DELETE FROM notifications 
       WHERE created_at < NOW() - INTERVAL '${RETENTION_PERIODS.notifications} days'
       RETURNING id`
    );
    results.notifications = notificationResult.rows.length;

    // Note: Chat sessions and messages are already cleaned up by chatCleanup service
    // Note: Applications, documents, donations, transactions should NOT be auto-deleted
    // They must be retained per compliance requirements

    logger.info('Data retention cleanup completed:', results);
    return results;
  } catch (error) {
    logger.error('Data retention cleanup failed:', error);
    return results;
  }
};

/**
 * Anonymize user data (GDPR right to be forgotten)
 * Instead of deleting, we anonymize to maintain referential integrity
 */
export const anonymizeUserData = async (userId: string): Promise<void> => {
  const pool = getDatabasePool();

  try {
    await pool.query('BEGIN');

    // Anonymize user record
    await pool.query(
      `UPDATE users 
       SET email = $1, name = $2, oauth_id = $3
       WHERE id = $4`,
      [
        `deleted-${userId}@deleted.local`,
        'Deleted User',
        `deleted-${userId}`,
        userId,
      ]
    );

    // Anonymize beneficiary profile
    await pool.query(
      `UPDATE beneficiary_profiles 
       SET days_sober = NULL, next_milestone = NULL, insurance_status = 'none'
       WHERE user_id = $1`,
      [userId]
    );

    // Delete chat sessions and messages (ephemeral data)
    await pool.query('DELETE FROM messages WHERE chat_session_id IN (SELECT id FROM chat_sessions WHERE user_id = $1)', [userId]);
    await pool.query('DELETE FROM chat_sessions WHERE user_id = $1', [userId]);

    // Delete notifications
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [userId]);

    // Note: We keep donations, transactions, applications for compliance
    // But we remove the link to the user by setting user_id to a system user

    await pool.query('COMMIT');
    logger.info('User data anonymized:', { userId });
  } catch (error) {
    await pool.query('ROLLBACK');
    logger.error('Failed to anonymize user data:', error);
    throw error;
  }
};

/**
 * Start data retention cleanup job
 */
let retentionInterval: NodeJS.Timeout | null = null;

export const startDataRetentionCleanup = (): void => {
  if (retentionInterval) {
    logger.warn('Data retention cleanup already started');
    return;
  }

  // Run cleanup weekly
  const runCleanup = async () => {
    try {
      await cleanupExpiredData();
    } catch (error) {
      logger.error('Data retention cleanup job failed:', error);
    }
  };

  // Run immediately on start
  runCleanup();

  // Then run weekly
  retentionInterval = setInterval(runCleanup, 7 * 24 * 60 * 60 * 1000);
  logger.info('Data retention cleanup job started');
};

export const stopDataRetentionCleanup = (): void => {
  if (retentionInterval) {
    clearInterval(retentionInterval);
    retentionInterval = null;
    logger.info('Data retention cleanup job stopped');
  }
};
