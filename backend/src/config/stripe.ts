import Stripe from 'stripe';
import { getEnv } from './env.js';
import { logger } from '../utils/logger.js';

const env = getEnv();

let stripeClient: Stripe | null = null;

export const getStripeClient = (): Stripe => {
  if (!stripeClient) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any,
      typescript: true,
    });

    logger.info('Stripe client initialized');
  }

  return stripeClient;
};

export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    const stripe = getStripeClient();
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    logger.error('Stripe webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
};
