import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { performSecurityAudit } from '../utils/securityAudit.js';
import { AuthenticationError } from '../utils/errors.js';
import { anonymizeUserData } from '../services/dataRetention.js';

/**
 * Get security audit results
 * Admin only
 */
export const getSecurityAudit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user || req.user.userType !== 'admin') {
    throw new AuthenticationError('Admin access required');
  }

  const audit = await performSecurityAudit();
  res.json(audit);
});

/**
 * Anonymize user data (GDPR right to be forgotten)
 * User can request their own data to be anonymized
 */
export const requestDataAnonymization = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  // User can only anonymize their own data
  const userId = req.params.userId || req.user.userId;
  if (userId !== req.user.userId && req.user.userType !== 'admin') {
    throw new AuthenticationError('Unauthorized');
  }

  await anonymizeUserData(userId);
  res.json({ message: 'User data anonymized successfully' });
});
