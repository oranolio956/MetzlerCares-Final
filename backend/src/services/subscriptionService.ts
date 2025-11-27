import Stripe from 'stripe';
import { getStripeClient } from '../config/stripe.js';
import { logger } from '../utils/logger.js';
import { ValidationError, DatabaseError } from '../utils/errors.js';
import { updatePartner } from './partnerService.js';

const MONTHLY_FEE = 99.00; // $99/month network fee

export interface CreateSubscriptionInput {
  partnerId: string;
  customerEmail: string;
  customerName: string;
}

export const createSubscription = async (
  input: CreateSubscriptionInput
): Promise<Stripe.Subscription> => {
  const stripe = getStripeClient();

  try {
    // Create or retrieve customer
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({
      email: input.customerEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: input.customerEmail,
        name: input.customerName,
        metadata: {
          partnerId: input.partnerId,
        },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(MONTHLY_FEE * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
            product_data: {
              name: 'SecondWind Network Membership',
              description: 'Monthly network membership fee for partner facilities',
            },
          },
        },
      ],
      metadata: {
        partnerId: input.partnerId,
      },
    });

    // Update partner with subscription ID
    await updatePartner(input.partnerId, {
      stripeSubscriptionId: subscription.id,
    });

    logger.info('Subscription created:', {
      subscriptionId: subscription.id,
      partnerId: input.partnerId,
    });

    return subscription;
  } catch (error: any) {
    logger.error('Failed to create subscription:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      throw new ValidationError(error.message);
    }
    
    throw new DatabaseError('Failed to create subscription');
  }
};

export const getSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  const stripe = getStripeClient();

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error: any) {
    logger.error('Failed to retrieve subscription:', error);
    
    if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
      throw new ValidationError('Subscription not found');
    }
    
    throw new DatabaseError('Failed to retrieve subscription');
  }
};

export const cancelSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  const stripe = getStripeClient();

  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    logger.info('Subscription cancelled:', { subscriptionId });
    return subscription;
  } catch (error: any) {
    logger.error('Failed to cancel subscription:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      throw new ValidationError(error.message);
    }
    
    throw new DatabaseError('Failed to cancel subscription');
  }
};

export const handleSubscriptionWebhook = async (
  event: Stripe.Event
): Promise<void> => {
  const subscription = event.data.object as Stripe.Subscription;
  const partnerId = subscription.metadata?.partnerId;

  if (!partnerId) {
    logger.warn('Subscription webhook missing partnerId:', { subscriptionId: subscription.id });
    return;
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Subscription is active
      logger.info('Subscription active:', { subscriptionId: subscription.id, partnerId });
      break;

    case 'customer.subscription.deleted':
      // Subscription cancelled
      await updatePartner(partnerId, {
        stripeSubscriptionId: null,
      });
      logger.info('Subscription cancelled, partner updated:', { partnerId });
      break;

    case 'invoice.payment_failed':
      // Payment failed - could update partner status
      logger.warn('Subscription payment failed:', { subscriptionId: subscription.id, partnerId });
      break;

    default:
      logger.info('Unhandled subscription webhook:', { type: event.type });
  }
};
