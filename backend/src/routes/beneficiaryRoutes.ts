import { Router } from 'express';
import {
  getDashboard,
  verifyInsuranceStatus,
  updateProfile,
} from '../controllers/beneficiaryController.js';
import { authenticate, requireUserType } from '../middleware/auth.js';
import { requireCFR42Compliance, preventRedisclosure } from '../middleware/cfr42.js';
import { requireHIPAAAccess } from '../middleware/hipaa.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// All beneficiary routes require authentication and beneficiary user type
router.use(authenticate);
router.use(requireUserType(['beneficiary']));

// Get dashboard (HIPAA + 42 CFR Part 2)
router.get(
  '/me/dashboard',
  requireHIPAAAccess('BENEFICIARY_PROFILE', (req) => req.user?.userId !== undefined),
  requireCFR42Compliance('PROFILE'),
  preventRedisclosure(),
  getDashboard
);

// Verify insurance
router.post(
  '/me/insurance/verify',
  validate([
    body('status')
      .isIn(['verified', 'pending'])
      .withMessage('status must be "verified" or "pending"'),
  ]),
  verifyInsuranceStatus
);

// Update profile
router.patch(
  '/me/profile',
  validate([
    body('daysSober').optional().isInt({ min: 0 }).withMessage('daysSober must be a non-negative integer'),
    body('nextMilestone').optional({ nullable: true }).isInt({ min: 0 }).withMessage('nextMilestone must be a non-negative integer or null'),
    body('insuranceStatus').optional().isIn(['verified', 'pending', 'none']).withMessage('Invalid insurance status'),
  ]),
  updateProfile
);

export default router;
