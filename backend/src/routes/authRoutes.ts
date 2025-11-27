import { Router } from 'express';
import {
  handleGoogleCallback,
  handleAppleCallback,
  refreshToken,
  logout,
  logoutAll,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import { validate, refreshTokenRule } from '../middleware/validator.js';

const router = Router();

// OAuth callbacks
router.post('/google/callback', authRateLimiter, handleGoogleCallback);
router.post('/apple/callback', authRateLimiter, handleAppleCallback);

// Token management
router.post('/refresh', authRateLimiter, validate([refreshTokenRule]), refreshToken);
router.post('/logout', authenticate, logout);
router.post('/logout/all', authenticate, logoutAll);

export default router;
