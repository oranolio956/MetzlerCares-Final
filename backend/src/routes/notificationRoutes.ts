import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications
router.get(
  '/',
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be a boolean'),
  ]),
  getNotifications
);

// Mark notification as read
router.patch(
  '/:notificationId/read',
  validate([
    param('notificationId').isUUID().withMessage('Invalid notification ID'),
  ]),
  markAsRead
);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete(
  '/:notificationId',
  validate([
    param('notificationId').isUUID().withMessage('Invalid notification ID'),
  ]),
  removeNotification
);

export default router;
