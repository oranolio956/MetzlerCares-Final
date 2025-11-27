import { getDatabasePool } from '../config/database.js';
import { Notification, NotificationType } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, DatabaseError, ValidationError } from '../utils/errors.js';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
}

export const createNotification = async (
  input: CreateNotificationInput
): Promise<Notification> => {
  const pool = getDatabasePool();

  if (!input.message || input.message.trim().length === 0) {
    throw new ValidationError('Notification message is required');
  }

  if (input.message.length > 500) {
    throw new ValidationError('Notification message must be 500 characters or less');
  }

  const validTypes: NotificationType[] = ['success', 'info', 'error'];
  if (!validTypes.includes(input.type)) {
    throw new ValidationError(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, message, read)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [input.userId, input.type, input.message.trim()]
    );

    logger.info('Notification created:', {
      notificationId: result.rows[0].id,
      userId: input.userId,
      type: input.type,
    });

    return result.rows[0];
  } catch (error: any) {
    logger.error('Failed to create notification:', error);
    if (error.code === '23503') {
      throw new ValidationError('Invalid user ID');
    }
    throw new DatabaseError('Failed to create notification');
  }
};

export const getUserNotifications = async (
  userId: string,
  limit: number = 50,
  unreadOnly: boolean = false
): Promise<Notification[]> => {
  const pool = getDatabasePool();

  let query = 'SELECT * FROM notifications WHERE user_id = $1';
  const params: any[] = [userId];

  if (unreadOnly) {
    query += ' AND read = false';
  }

  query += ' ORDER BY created_at DESC LIMIT $2';
  params.push(limit);

  const result = await pool.query(query, params);
  return result.rows;
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<Notification> => {
  const pool = getDatabasePool();

  try {
    const result = await pool.query(
      `UPDATE notifications 
       SET read = true 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Notification');
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to mark notification as read:', error);
    throw new DatabaseError('Failed to update notification');
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
  const pool = getDatabasePool();

  try {
    const result = await pool.query(
      `UPDATE notifications 
       SET read = true 
       WHERE user_id = $1 AND read = false
       RETURNING id`,
      [userId]
    );

    const count = result.rows.length;
    logger.info('All notifications marked as read:', { userId, count });
    return count;
  } catch (error) {
    logger.error('Failed to mark all notifications as read:', error);
    throw new DatabaseError('Failed to update notifications');
  }
};

export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  const pool = getDatabasePool();

  try {
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Notification');
    }

    logger.info('Notification deleted:', { notificationId, userId });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to delete notification:', error);
    throw new DatabaseError('Failed to delete notification');
  }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const pool = getDatabasePool();

  const result = await pool.query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
    [userId]
  );

  return parseInt(result.rows[0]?.count || '0', 10);
};
