import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getUserSessions,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, emailRule, nameRule } from '../middleware/validator.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get current user
router.get('/me', getCurrentUser);

// Update current user
router.patch('/me', validate([nameRule, emailRule]), updateCurrentUser);

// Get user sessions
router.get('/me/sessions', getUserSessions);

export default router;
