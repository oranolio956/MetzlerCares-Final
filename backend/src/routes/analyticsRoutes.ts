import { Router } from 'express';
import {
  getDonorStats,
  getPlatformStats,
} from '../controllers/analyticsController.js';
import { authenticate, requireUserType } from '../middleware/auth.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Get donor analytics (donors only)
router.get('/donors/me', requireUserType(['donor']), getDonorStats);

// Get platform analytics (all authenticated users for now, can restrict to admin later)
router.get('/platform', getPlatformStats);

export default router;
