import { Router } from 'express';
import {
  createSession,
  sendMessage,
  getHistory,
  getUserSessions,
  deleteSession,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { chatRateLimiter } from '../middleware/rateLimit.js';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// Create chat session
router.post(
  '/sessions',
  chatRateLimiter,
  validate([
    body('sessionType')
      .isIn(['INTAKE', 'COACH'])
      .withMessage('sessionType must be "INTAKE" or "COACH"'),
  ]),
  createSession
);

// Send message
router.post(
  '/messages',
  chatRateLimiter,
  validate([
    body('sessionId').notEmpty().withMessage('sessionId is required'),
    body('message').notEmpty().trim().withMessage('message is required'),
  ]),
  sendMessage
);

// Get conversation history
router.get(
  '/sessions/:sessionId/history',
  validate([
    param('sessionId').isUUID().withMessage('Invalid session ID'),
  ]),
  getHistory
);

// Get user's chat sessions
router.get(
  '/sessions',
  validate([
    query('type').optional().isIn(['INTAKE', 'COACH']).withMessage('type must be "INTAKE" or "COACH"'),
  ]),
  getUserSessions
);

// Delete chat session
router.delete(
  '/sessions/:sessionId',
  validate([
    param('sessionId').isUUID().withMessage('Invalid session ID'),
  ]),
  deleteSession
);

export default router;
