import { Router } from 'express';
import { getEnv } from '../config/env.js';
import { auditLog } from '../middleware/audit.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import chatRoutes from './chatRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import donationRoutes from './donationRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import beneficiaryRoutes from './beneficiaryRoutes.js';
import documentRoutes from './documentRoutes.js';
import ledgerRoutes from './ledgerRoutes.js';
import partnerRoutes from './partnerRoutes.js';
import visionRoutes from './visionRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();
const env = getEnv();
const apiPrefix = `/api/${env.API_VERSION}`;

// Health check (no prefix)
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Webhooks (no audit logging, no rate limiting)
router.use(`${apiPrefix}/webhooks`, webhookRoutes);

// Audit logging for API routes
router.use(apiPrefix, auditLog);

// API routes
router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/users`, userRoutes);
router.use(`${apiPrefix}/chat`, chatRoutes);
router.use(`${apiPrefix}/payments`, paymentRoutes);
router.use(`${apiPrefix}/donations`, donationRoutes);
router.use(`${apiPrefix}/applications`, applicationRoutes);
router.use(`${apiPrefix}/beneficiaries`, beneficiaryRoutes);
router.use(`${apiPrefix}/documents`, documentRoutes);
router.use(`${apiPrefix}/ledger`, ledgerRoutes);
router.use(`${apiPrefix}/partners`, partnerRoutes);
router.use(`${apiPrefix}/vision`, visionRoutes);
router.use(`${apiPrefix}/analytics`, analyticsRoutes);
router.use(`${apiPrefix}/notifications`, notificationRoutes);

export default router;
