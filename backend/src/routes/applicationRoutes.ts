import { Router } from 'express';
import {
  submitApplication,
  getApplications,
  getApplication,
  updateApplicationDetails,
  removeApplication,
} from '../controllers/applicationController.js';
import { authenticate, requireUserType } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// All application routes require authentication
router.use(authenticate);

// Submit application (beneficiaries only)
router.post(
  '/',
  requireUserType(['beneficiary']),
  validate([
    body('type')
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('type is required and must be 1-50 characters'),
    body('details')
      .optional()
      .trim()
      .isLength({ max: 10000 })
      .withMessage('details must be 10,000 characters or less'),
  ]),
  submitApplication
);

// Get user's applications
router.get(
  '/',
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset must be a non-negative integer'),
    query('status').optional().isIn(['reviewing', 'approved', 'action_needed', 'funded', 'rejected']).withMessage('Invalid status'),
  ]),
  getApplications
);

// Get application by ID
router.get(
  '/:applicationId',
  validate([
    param('applicationId').isUUID().withMessage('Invalid application ID'),
  ]),
  getApplication
);

// Update application details
router.patch(
  '/:applicationId',
  validate([
    param('applicationId').isUUID().withMessage('Invalid application ID'),
    body('details')
      .optional()
      .trim()
      .isLength({ max: 10000 })
      .withMessage('details must be 10,000 characters or less'),
  ]),
  updateApplicationDetails
);

// Delete application
router.delete(
  '/:applicationId',
  validate([
    param('applicationId').isUUID().withMessage('Invalid application ID'),
  ]),
  removeApplication
);

export default router;
