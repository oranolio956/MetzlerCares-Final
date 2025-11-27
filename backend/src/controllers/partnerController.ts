import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticationError, ValidationError, NotFoundError, DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import {
  createPartner,
  getPartnerById,
  updatePartner,
  getAllPartners,
} from '../services/partnerService.js';
import { createSubscription, CreateSubscriptionInput } from '../services/subscriptionService.js';
import { getDatabasePool } from '../config/database.js';

// Submit partner application
export const submitApplication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Partner applications don't require authentication (public application)
    // But we could add optional email for notifications

    const {
      name,
      address,
      ein,
      type,
      bedCount,
      monthlyRent,
      acceptsMat,
      hasNaloxone,
      hasInsurance,
      isRraMember,
      customerEmail,
      customerName,
    } = req.body;

    // Create partner application
    const partner = await createPartner({
      name,
      address,
      ein,
      type,
      bedCount,
      monthlyRent,
      acceptsMat: acceptsMat || false,
      hasNaloxone: hasNaloxone || false,
      hasInsurance: hasInsurance || false,
      isRraMember: isRraMember || false,
    });

    // If customer email provided, create subscription
    let subscription = null;
    if (customerEmail && customerName) {
      try {
        const subscriptionInput: CreateSubscriptionInput = {
          partnerId: partner.id,
          customerEmail,
          customerName,
        };
        subscription = await createSubscription(subscriptionInput);
      } catch (error) {
        logger.warn('Failed to create subscription during application:', error);
        // Don't fail the application if subscription creation fails
      }
    }

    res.status(201).json({
      partner: {
        id: partner.id,
        name: partner.name,
        ein: partner.ein,
        complianceStatus: partner.compliance_status,
        createdAt: partner.created_at,
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
      } : null,
      message: 'Application submitted successfully. Our compliance officer will contact you within 48 hours.',
    });
});

// Get partner dashboard (requires authentication and partner ownership)
export const getPartnerDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // In a real implementation, you'd link partners to users
    // For now, we'll use a query parameter or header
    const { partnerId } = req.params;

    if (!partnerId) {
      throw new ValidationError('partnerId is required');
    }

    const partner = await getPartnerById(partnerId);

    if (!partner) {
      throw new NotFoundError('Partner');
    }

    // Get subscription status if exists
    let subscriptionStatus = null;
    if (partner.stripe_subscription_id) {
      try {
        const { getSubscription } = await import('../services/subscriptionService.js');
        const subscription = await getSubscription(partner.stripe_subscription_id);
        subscriptionStatus = {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
        };
      } catch (error) {
        logger.warn('Failed to get subscription status:', error);
      }
    }

    // Get application statistics
    const pool = getDatabasePool();
    const statsResult = await pool.query(
      `SELECT COUNT(*) as total_applications
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.status IN ('approved', 'funded')
       LIMIT 1`
    );

    res.json({
      partner: {
        id: partner.id,
        name: partner.name,
        ein: partner.ein,
        address: partner.address,
        type: partner.type,
        bedCount: partner.bed_count,
        monthlyRent: partner.monthly_rent,
        complianceStatus: partner.compliance_status,
        acceptsMat: partner.accepts_mat,
        hasNaloxone: partner.has_naloxone,
        hasInsurance: partner.has_insurance,
        isRraMember: partner.is_rra_member,
        createdAt: partner.created_at,
      },
      subscription: subscriptionStatus,
      stats: {
        totalApplications: parseInt(statsResult.rows[0]?.total_applications || '0', 10),
      },
    });
});

// Get partner payment history
export const getPaymentHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { partnerId } = req.params;

    if (!partnerId) {
      throw new ValidationError('partnerId is required');
    }

    const partner = await getPartnerById(partnerId);

    if (!partner) {
      throw new NotFoundError('Partner');
    }

    if (!partner.stripe_subscription_id) {
      res.json({
        payments: [],
        message: 'No subscription found',
      });
      return;
    }

    try {
      const stripe = await import('../config/stripe.js').then(m => m.getStripeClient());
      const invoices = await stripe.invoices.list({
        subscription: partner.stripe_subscription_id,
        limit: 12, // Last 12 months
      });

      res.json({
        payments: invoices.data.map((invoice) => ({
          id: invoice.id,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          status: invoice.status,
          date: new Date(invoice.created * 1000).toISOString(),
          invoiceUrl: invoice.hosted_invoice_url,
        })),
      });
    } catch (error) {
      logger.error('Failed to get payment history:', error);
      throw new DatabaseError('Failed to fetch payment history');
    }
});
