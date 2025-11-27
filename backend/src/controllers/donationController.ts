import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/errors.js';
import {
  getUserDonations,
  getDonationById,
  getDonationStats,
} from '../services/donationService.js';
import { generateReceiptData, generateReceiptText } from '../services/receiptService.js';

// Get user's donations
export const getDonations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    if (limit > 100) {
      throw new ValidationError('limit cannot exceed 100');
    }

    const { donations, total } = await getUserDonations(req.user.userId, limit, offset);

    res.json({
      donations: donations.map((donation) => ({
        id: donation.id,
        amount: parseFloat(donation.amount.toString()),
        impactType: donation.impact_type,
        itemLabel: donation.item_label,
        status: donation.status,
        createdAt: donation.created_at,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
});

// Get donation by ID
export const getDonation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { donationId } = req.params;

    const donation = await getDonationById(donationId);

    if (!donation) {
      throw new NotFoundError('Donation');
    }

    // Verify ownership
    if (donation.user_id !== req.user.userId) {
      throw new AuthenticationError('Donation does not belong to user');
    }

    res.json({
      donation: {
        id: donation.id,
        amount: parseFloat(donation.amount.toString()),
        impactType: donation.impact_type,
        itemLabel: donation.item_label,
        status: donation.status,
        stripePaymentIntentId: donation.stripe_payment_intent_id,
        createdAt: donation.created_at,
      },
    });
});

// Get donation receipt
export const getReceipt = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { donationId } = req.params;

    const donation = await getDonationById(donationId);

    if (!donation) {
      throw new NotFoundError('Donation');
    }

    // Verify ownership
    if (donation.user_id !== req.user.userId) {
      throw new AuthenticationError('Donation does not belong to user');
    }

    // Only generate receipt for succeeded donations
    if (donation.status !== 'succeeded') {
      throw new ValidationError('Receipt can only be generated for completed donations');
    }

    const receiptData = await generateReceiptData(donationId);
    const receiptText = generateReceiptText(receiptData);

    res.json({
      receipt: {
        donationId: receiptData.donationId,
        amount: receiptData.amount,
        itemLabel: receiptData.itemLabel,
        impactType: receiptData.impactType,
        timestamp: receiptData.timestamp,
        transactionId: receiptData.transactionId,
        text: receiptText,
      },
    });
});

// Get donation statistics
export const getStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const stats = await getDonationStats(req.user.userId);

    res.json({
      stats: {
        totalDonated: stats.totalDonated,
        totalDonations: stats.totalDonations,
        byImpactType: stats.byImpactType,
      },
    });
});
