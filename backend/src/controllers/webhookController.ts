import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyWebhookSignature } from '../config/stripe.js';
import { logger } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';
import {
  getDonationByPaymentIntent,
  updateDonationStatus,
} from '../services/donationService.js';
import { generateReceiptData, storeReceipt } from '../services/receiptService.js';
import Stripe from 'stripe';

// Stripe webhook handler
export const handleWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      throw new ValidationError('Missing Stripe signature');
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(req.body, signature);

    logger.info('Stripe webhook received:', {
      type: event.type,
      id: event.id,
    });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const { handleSubscriptionWebhook } = await import('../services/subscriptionService.js');
        await handleSubscriptionWebhook(event);
        break;
      }

      default:
        logger.info('Unhandled webhook event type:', { type: event.type });
    }

    // Acknowledge receipt
    res.json({ received: true });
});

const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
  try {
    const donation = await getDonationByPaymentIntent(paymentIntent.id);

    if (!donation) {
      logger.warn('Donation not found for payment intent:', { paymentIntentId: paymentIntent.id });
      return;
    }

    // Update donation status
    await updateDonationStatus(donation.id, 'succeeded');

    // CRITICAL FIX: Create transaction for transparency ledger
    try {
      const { createTransaction } = await import('../services/transactionService.js');
      const { getVendorByName, createVendor } = await import('../services/vendorService.js');
      const { 
        mapImpactToCategory, 
        getDefaultVendor, 
        getVendorCategory 
      } = await import('../utils/vendorAssignment.js');
      const { generateRecipientHash } = await import('../utils/crypto.js');

      const category = mapImpactToCategory(donation.impact_type);
      const vendorName = getDefaultVendor(donation.impact_type);

      // Get or create vendor
      let vendor = await getVendorByName(vendorName);
      if (!vendor) {
        vendor = await createVendor({
          name: vendorName,
          category: getVendorCategory(donation.impact_type),
        });
      }

      // Generate recipient hash (privacy-preserving identifier)
      const recipientHash = generateRecipientHash(donation.user_id, donation.id);

      // Create transaction
      await createTransaction({
        donationId: donation.id,
        category,
        amount: parseFloat(donation.amount.toString()),
        vendor: vendor.name,
        recipientHash,
      });

      logger.info('Transaction created for donation:', {
        donationId: donation.id,
        category,
        amount: donation.amount,
        vendor: vendor.name,
      });
    } catch (error) {
      logger.error('Failed to create transaction for donation:', error);
      // Don't fail the webhook if transaction creation fails, but log it
    }

    // Generate and store receipt
    try {
      const receiptData = await generateReceiptData(donation.id);
      
      // Send receipt email
      if (receiptData.donorEmail) {
        try {
          const { sendReceiptEmail } = await import('../services/emailService.js');
          await sendReceiptEmail(receiptData.donorEmail, {
            donationId: receiptData.donationId,
            amount: receiptData.amount,
            itemLabel: receiptData.itemLabel,
            timestamp: receiptData.timestamp,
          });
        } catch (error) {
          logger.error('Failed to send receipt email:', error);
          // Don't fail if email fails
        }
      }

      logger.info('Receipt generated for donation:', {
        donationId: donation.id,
        amount: receiptData.amount,
      });
    } catch (error) {
      logger.error('Failed to generate receipt:', error);
      // Don't fail the webhook if receipt generation fails
    }

    logger.info('Payment succeeded:', {
      donationId: donation.id,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
    });
  } catch (error) {
    logger.error('Failed to handle payment success:', error);
    throw error;
  }
};

const handlePaymentFailure = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
  try {
    const donation = await getDonationByPaymentIntent(paymentIntent.id);

    if (!donation) {
      logger.warn('Donation not found for payment intent:', { paymentIntentId: paymentIntent.id });
      return;
    }

    await updateDonationStatus(donation.id, 'failed');

    logger.info('Payment failed:', {
      donationId: donation.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    logger.error('Failed to handle payment failure:', error);
    throw error;
  }
};

const handleRefund = async (charge: Stripe.Charge): Promise<void> => {
  try {
    const paymentIntentId = charge.payment_intent as string;

    if (!paymentIntentId) {
      logger.warn('Charge missing payment_intent:', { chargeId: charge.id });
      return;
    }

    const donation = await getDonationByPaymentIntent(paymentIntentId);

    if (!donation) {
      logger.warn('Donation not found for refund:', { paymentIntentId });
      return;
    }

    await updateDonationStatus(donation.id, 'refunded');

    logger.info('Refund processed:', {
      donationId: donation.id,
      chargeId: charge.id,
      refundAmount: charge.amount_refunded / 100,
    });
  } catch (error) {
    logger.error('Failed to handle refund:', error);
    throw error;
  }
};
