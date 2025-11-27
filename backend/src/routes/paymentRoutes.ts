import { Router } from 'express';
import {
  createIntent,
  getPaymentStatus,
  cancelPayment,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// Create payment intent
router.post(
  '/intents',
  validate([
    body('amount')
      .isFloat({ min: 1, max: 100000 })
      .withMessage('amount must be between $1 and $100,000'),
    body('impactType')
      .isIn(['commute', 'home', 'tech'])
      .withMessage('impactType must be one of: commute, home, tech'),
    body('itemLabel')
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('itemLabel is required and must be 1-255 characters'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('quantity must be between 1 and 100'),
  ]),
  createIntent
);

// Get payment status
router.get(
  '/intents/:paymentIntentId',
  validate([
    param('paymentIntentId').notEmpty().withMessage('paymentIntentId is required'),
  ]),
  getPaymentStatus
);

// Cancel payment
router.post(
  '/intents/:paymentIntentId/cancel',
  validate([
    param('paymentIntentId').notEmpty().withMessage('paymentIntentId is required'),
  ]),
  cancelPayment
);

export default router;
