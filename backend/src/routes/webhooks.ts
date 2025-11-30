import { Router } from 'express';
import { StripeService } from '../services/stripe.js';

const webhookRouter = Router();

// Stripe webhook endpoint (must be raw body, no JSON parsing)
webhookRouter.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const rawBody = req.body; // Raw body for signature verification

  try {
    // Process the webhook
    const result = await StripeService.handleWebhook(rawBody, sig);

    if (result.received) {
      res.json({ received: true });
    } else {
      res.status(400).json({ error: 'Webhook processing failed' });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);

    // Return 400 for signature verification failures
    if (error.message.includes('signature')) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Return 500 for other processing errors
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Health check for webhook endpoint
webhookRouter.get('/stripe/health', (req, res) => {
  res.json({
    status: 'healthy',
    endpoint: '/api/webhooks/stripe',
    timestamp: new Date().toISOString()
  });
});

export default webhookRouter;



