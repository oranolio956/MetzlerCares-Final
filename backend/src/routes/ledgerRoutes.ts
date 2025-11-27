import { Router } from 'express';
import {
  getLedger,
  getStats,
  exportCSV,
} from '../controllers/ledgerController.js';
import { query } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// Public ledger endpoints (no authentication required for transparency)

// Get ledger transactions
router.get(
  '/',
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset must be a non-negative integer'),
    query('category').optional().isIn(['RENT', 'TRANSPORT', 'TECH']).withMessage('Invalid category'),
    query('status').optional().isIn(['PENDING', 'CLEARED']).withMessage('Invalid status'),
    query('startDate').optional().isISO8601().withMessage('Invalid startDate format (ISO 8601)'),
    query('endDate').optional().isISO8601().withMessage('Invalid endDate format (ISO 8601)'),
    query('vendor').optional().trim().isLength({ max: 255 }).withMessage('vendor must be 255 characters or less'),
  ]),
  getLedger
);

// Get ledger statistics
router.get('/stats', getStats);

// Export CSV
router.get(
  '/export',
  validate([
    query('category').optional().isIn(['RENT', 'TRANSPORT', 'TECH']).withMessage('Invalid category'),
    query('status').optional().isIn(['PENDING', 'CLEARED']).withMessage('Invalid status'),
    query('startDate').optional().isISO8601().withMessage('Invalid startDate format (ISO 8601)'),
    query('endDate').optional().isISO8601().withMessage('Invalid endDate format (ISO 8601)'),
  ]),
  exportCSV
);

export default router;
