import { Router } from 'express';
import {
  submitApplication,
  getPartnerDashboard,
  getPaymentHistory,
} from '../controllers/partnerController.js';
import { authenticate } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// Submit partner application (public, no auth required)
router.post(
  '/apply',
  validate([
    body('name')
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('name is required and must be 1-255 characters'),
    body('address')
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('address is required and must be 1-500 characters'),
    body('ein')
      .matches(/^\d{2}-\d{7}$/)
      .withMessage('EIN must be in format XX-XXXXXXX'),
    body('type')
      .optional()
      .isIn(['oxford', 'private', 'nonprofit'])
      .withMessage('type must be one of: oxford, private, nonprofit'),
    body('bedCount')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('bedCount must be between 1 and 1000'),
    body('monthlyRent')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('monthlyRent must be a non-negative number'),
    body('acceptsMat')
      .optional()
      .isBoolean()
      .withMessage('acceptsMat must be a boolean'),
    body('hasNaloxone')
      .isBoolean()
      .withMessage('hasNaloxone is required and must be a boolean'),
    body('hasInsurance')
      .isBoolean()
      .withMessage('hasInsurance is required and must be a boolean'),
    body('isRraMember')
      .optional()
      .isBoolean()
      .withMessage('isRraMember must be a boolean'),
    body('customerEmail')
      .optional()
      .isEmail()
      .withMessage('customerEmail must be a valid email'),
    body('customerName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('customerName must be 1-255 characters'),
  ]),
  submitApplication
);

// Partner dashboard (requires authentication)
router.use(authenticate);

router.get(
  '/:partnerId',
  validate([
    param('partnerId').isUUID().withMessage('Invalid partner ID'),
  ]),
  getPartnerDashboard
);

router.get(
  '/:partnerId/payments',
  validate([
    param('partnerId').isUUID().withMessage('Invalid partner ID'),
  ]),
  getPaymentHistory
);

export default router;
