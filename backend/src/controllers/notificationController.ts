import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/errors.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '../services/notificationService.js';

// Get user notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const limit = parseInt(req.query.limit as string, 10) || 50;
    const unreadOnly = req.query.unreadOnly === 'true';

    if (limit > 100) {
      throw new ValidationError('limit cannot exceed 100');
    }

    const notifications = await getUserNotifications(req.user.userId, limit, unreadOnly);
    const unreadCount = await getUnreadCount(req.user.userId);

    res.json({
      notifications: notifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        message: notif.message,
        read: notif.read,
        createdAt: notif.created_at,
      })),
      unreadCount,
    });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { notificationId } = req.params;

    const notification = await markNotificationAsRead(notificationId, req.user.userId);

    res.json({
      notification: {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
      },
    });
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const count = await markAllNotificationsAsRead(req.user.userId);

    res.json({
      message: `${count} notification(s) marked as read`,
      count,
    });
});

// Delete notification
export const removeNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { notificationId } = req.params;

    await deleteNotification(notificationId, req.user.userId);

    res.json({
      message: 'Notification deleted successfully',
    });
});
