import { Router } from 'express';
import {
  getDonations,
  getDonation,
  getReceipt,
  getStats,
} from '../controllers/donationController.js';
import { authenticate } from '../middleware/auth.js';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// All donation routes require authentication
router.use(authenticate);

// Get user's donations
router.get(
  '/',
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset must be a non-negative integer'),
  ]),
  getDonations
);

// Get donation statistics
router.get('/stats', getStats);

// Get donation by ID
router.get(
  '/:donationId',
  validate([
    param('donationId').isUUID().withMessage('Invalid donation ID'),
  ]),
  getDonation
);

// Get donation receipt
router.get(
  '/:donationId/receipt',
  validate([
    param('donationId').isUUID().withMessage('Invalid donation ID'),
  ]),
  getReceipt
);

export default router;
