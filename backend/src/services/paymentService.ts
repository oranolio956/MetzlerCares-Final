import Stripe from 'stripe';
import { getStripeClient } from '../config/stripe.js';
import { logger } from '../utils/logger.js';
import { ValidationError, DatabaseError } from '../utils/errors.js';

export interface CreatePaymentIntentInput {
  amount: number;
  currency?: string;
  metadata: Record<string, string>;
  description?: string;
}

export const createPaymentIntent = async (
  input: CreatePaymentIntentInput
): Promise<Stripe.PaymentIntent> => {
  const stripe = getStripeClient();

  // Validate amount (minimum $1, convert to cents)
  const amountInCents = Math.round(input.amount * 100);
  if (amountInCents < 100) {
    throw new ValidationError('Minimum donation amount is $1.00');
  }

  // Maximum amount check (prevent accidental large donations)
  if (amountInCents > 10000000) {
    throw new ValidationError('Maximum donation amount is $100,000.00');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: input.currency || 'usd',
      metadata: input.metadata,
      description: input.description || 'SecondWind Donation',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info('Payment intent created:', {
      paymentIntentId: paymentIntent.id,
      amount: input.amount,
    });

    return paymentIntent;
  } catch (error: any) {
    logger.error('Failed to create payment intent:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      throw new ValidationError(error.message);
    }
    
    throw new DatabaseError('Failed to create payment intent');
  }
};

export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  const stripe = getStripeClient();

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error: any) {
    logger.error('Failed to retrieve payment intent:', error);
    
    if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
      throw new ValidationError('Payment intent not found');
    }
    
    throw new DatabaseError('Failed to retrieve payment intent');
  }
};

export const cancelPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  const stripe = getStripeClient();

  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    logger.info('Payment intent cancelled:', { paymentIntentId });
    return paymentIntent;
  } catch (error: any) {
    logger.error('Failed to cancel payment intent:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      throw new ValidationError(error.message);
    }
    
    throw new DatabaseError('Failed to cancel payment intent');
  }
};

export const createRefund = async (
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> => {
  const stripe = getStripeClient();

  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);
    logger.info('Refund created:', { refundId: refund.id, paymentIntentId });
    return refund;
  } catch (error: any) {
    logger.error('Failed to create refund:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      throw new ValidationError(error.message);
    }
    
    throw new DatabaseError('Failed to create refund');
  }
};
