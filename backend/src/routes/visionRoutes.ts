import { Router } from 'express';
import {
  generateImage,
  getVisionHistory,
  removeVisionImage,
} from '../controllers/visionController.js';
import { authenticate, requireUserType } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// All vision routes require authentication and beneficiary user type
router.use(authenticate);
router.use(requireUserType(['beneficiary']));

// Generate vision image
router.post(
  '/generate',
  validate([
    body('prompt')
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('prompt is required and must be 1-1000 characters'),
    body('size')
      .optional()
      .isIn(['1K', '2K', '4K'])
      .withMessage('size must be one of: 1K, 2K, 4K'),
  ]),
  generateImage
);

// Get vision history
router.get(
  '/history',
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  ]),
  getVisionHistory
);

// Delete vision image
router.delete(
  '/:imageId',
  validate([
    param('imageId').isUUID().withMessage('Invalid image ID'),
  ]),
  removeVisionImage
);

export default router;
