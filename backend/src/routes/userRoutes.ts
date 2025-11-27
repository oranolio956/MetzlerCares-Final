import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getUserSessions,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get current user
router.get('/me', getCurrentUser);

// Update current user
router.patch('/me', updateCurrentUser);

// Get user sessions
router.get('/me/sessions', getUserSessions);

export default router;
