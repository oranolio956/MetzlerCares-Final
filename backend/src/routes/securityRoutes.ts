import { Router } from 'express';
import { getSecurityAudit, requestDataAnonymization } from '../controllers/securityController.js';
import { authenticate } from '../middleware/auth.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = Router();

// All security routes require authentication
router.use(authenticate);

// Get security audit (admin only)
router.get('/audit', getSecurityAudit);

// Request data anonymization (GDPR)
router.post(
  '/anonymize/:userId',
  validate([
    param('userId').isUUID().withMessage('Invalid user ID'),
  ]),
  requestDataAnonymization
);

export default router;
