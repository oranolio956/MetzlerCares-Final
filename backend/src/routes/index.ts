import { Router } from 'express';
import { getEnv } from '../config/env.js';
import { auditLog } from '../middleware/audit.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = Router();
const env = getEnv();
const apiPrefix = `/api/${env.API_VERSION}`;

// Health check (no prefix)
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Audit logging for API routes
router.use(apiPrefix, auditLog);

// API routes
router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/users`, userRoutes);
router.use(`${apiPrefix}/chat`, chatRoutes);

export default router;
