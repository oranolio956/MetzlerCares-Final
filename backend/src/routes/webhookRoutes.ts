import { Router, Request, Response, NextFunction } from 'express';
import { handleWebhook } from '../controllers/webhookController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Stripe webhook endpoint (no authentication, uses signature verification)
// Must use raw body for signature verification
// Stripe webhook handler (already wrapped in asyncHandler in controller)
router.post('/stripe', handleWebhook);

export default router;
