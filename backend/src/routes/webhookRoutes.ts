import { Router, Request, Response } from 'express';
import { handleWebhook } from '../controllers/webhookController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Stripe webhook endpoint (no authentication, uses signature verification)
// Must use raw body for signature verification
router.post(
  '/stripe',
  // Express raw body middleware should be applied before this route
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // The body should already be raw buffer/string from middleware
    await handleWebhook(req, res);
  })
);

export default router;
