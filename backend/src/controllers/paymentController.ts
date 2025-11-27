import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError, AuthenticationError, NotFoundError } from '../utils/errors.js';
import { createPaymentIntent, CreatePaymentIntentInput } from '../services/paymentService.js';
import { createDonation, CreateDonationInput } from '../services/donationService.js';
import { logger } from '../utils/logger.js';
import { ImpactType } from '../types/index.js';

// Create payment intent
export const createIntent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { amount, impactType, itemLabel, quantity = 1 } = req.body;

    // Validate required fields
    if (!amount || typeof amount !== 'number') {
      throw new ValidationError('amount is required and must be a number');
    }

    if (!impactType || !['commute', 'home', 'tech'].includes(impactType)) {
      throw new ValidationError('impactType must be one of: commute, home, tech');
    }

    if (!itemLabel || typeof itemLabel !== 'string') {
      throw new ValidationError('itemLabel is required and must be a string');
    }

    if (quantity && (typeof quantity !== 'number' || quantity < 1 || quantity > 100)) {
      throw new ValidationError('quantity must be a number between 1 and 100');
    }

    const totalAmount = amount * quantity;

    // Create payment intent
    const paymentIntentInput: CreatePaymentIntentInput = {
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        userId: req.user.userId,
        userType: req.user.userType,
        impactType,
        itemLabel,
        quantity: quantity.toString(),
      },
      description: `${quantity}x ${itemLabel}`,
    };

    const paymentIntent = await createPaymentIntent(paymentIntentInput);

    // Create donation record (pending status)
    const donationInput: CreateDonationInput = {
      userId: req.user.userId,
      amount: totalAmount,
      impactType: impactType as ImpactType,
      itemLabel: `${quantity}x ${itemLabel}`,
      stripePaymentIntentId: paymentIntent.id,
    };

    const donation = await createDonation(donationInput);

    logger.info('Payment intent and donation created:', {
      paymentIntentId: paymentIntent.id,
      donationId: donation.id,
      userId: req.user.userId,
    });

    res.status(201).json({
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      donation: {
        id: donation.id,
        amount: donation.amount,
        impactType: donation.impact_type,
        itemLabel: donation.item_label,
        status: donation.status,
      },
    });
});

// Get payment intent status
export const getPaymentStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      throw new ValidationError('paymentIntentId is required');
    }

    const { retrievePaymentIntent } = await import('../services/paymentService.js');
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    // Verify the payment intent belongs to the user
    if (paymentIntent.metadata.userId !== req.user.userId) {
      throw new AuthenticationError('Payment intent does not belong to user');
    }

    res.json({
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
      },
    });
});

// Cancel payment intent
export const cancelPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      throw new ValidationError('paymentIntentId is required');
    }

    const { retrievePaymentIntent, cancelPaymentIntent } = await import('../services/paymentService.js');
    
    // Verify ownership first
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);
    if (paymentIntent.metadata.userId !== req.user.userId) {
      throw new AuthenticationError('Payment intent does not belong to user');
    }

    // Only allow cancellation if not already succeeded
    if (paymentIntent.status === 'succeeded') {
      throw new ValidationError('Cannot cancel a completed payment');
    }

    await cancelPaymentIntent(paymentIntentId);

    // Update donation status
    const { getDonationByPaymentIntent, updateDonationStatus } = await import('../services/donationService.js');
    const donation = await getDonationByPaymentIntent(paymentIntentId);
    if (donation) {
      await updateDonationStatus(donation.id, 'failed');
    }

    res.json({
      message: 'Payment cancelled successfully',
    });
});
