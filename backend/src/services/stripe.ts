import Stripe from 'stripe';
import { pool } from '../database.js';
import { config } from '../config.js';

// Validate Stripe configuration
if (!config.stripeSecretKey) {
  throw new Error('[startup] STRIPE_SECRET_KEY is required for payment processing');
}

// Initialize Stripe with secret key
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2024-06-20' });

// Extend config to include Stripe settings
declare module '../config.js' {
  interface Config {
    stripeSecretKey?: string;
    stripePublishableKey?: string;
    stripeWebhookSecret?: string;
  }
}

// Types for Stripe operations
export interface VendorOnboardingData {
  businessName: string;
  businessType: 'individual' | 'company';
  taxId?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  email: string;
}

export interface DonationData {
  amount: number; // in cents
  donorId: number;
  impactType: 'shelter' | 'mobility' | 'tech' | 'wellness';
  isAnonymous: boolean;
  paymentMethodId: string;
  metadata?: Record<string, any>;
}

export interface VendorPayoutData {
  vendorId: number;
  amount: number; // in cents
  beneficiaryId: number;
  transactionId: number;
  description: string;
}

export class StripeService {
  /**
   * Create a Stripe Connect Express account for a vendor
   */
  static async createVendorAccount(vendorData: VendorOnboardingData): Promise<{
    accountId: string;
    onboardingUrl: string;
  }> {
    try {
      // Create Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: vendorData.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: vendorData.businessType,
        metadata: {
          vendor_type: 'recovery_housing',
          platform: 'secondwind'
        }
      });

      // Create account onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/vendor/onboarding/refresh`,
        return_url: `${process.env.FRONTEND_URL}/vendor/dashboard`,
        type: 'account_onboarding',
      });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url
      };
    } catch (error) {
      console.error('Stripe vendor account creation error:', error);
      throw new Error(`Failed to create vendor account: ${error.message}`);
    }
  }

  /**
   * Get vendor account status
   */
  static async getVendorAccountStatus(accountId: string) {
    try {
      const account = await stripe.accounts.retrieve(accountId);

      return {
        accountId: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
        capabilities: account.capabilities
      };
    } catch (error) {
      console.error('Stripe account status check error:', error);
      throw new Error(`Failed to check account status: ${error.message}`);
    }
  }

  /**
   * Process a donation payment
   */
  static async processDonation(donationData: DonationData): Promise<{
    paymentIntentId: string;
    clientSecret: string;
    status: string;
  }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create donation record
      const donationResult = await client.query(
        `INSERT INTO donations (
          donor_id, amount, impact_type, status, is_anonymous, created_at
        ) VALUES ($1, $2, $3, 'processing', $4, NOW())
        RETURNING id`,
        [
          donationData.donorId,
          donationData.amount / 100, // Convert cents to dollars for storage
          donationData.impactType,
          donationData.isAnonymous
        ]
      );

      const donationId = donationResult.rows[0].id;

      // Create PaymentIntent for client-side confirmation
      const paymentIntent = await stripe.paymentIntents.create({
        amount: donationData.amount,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          donation_id: donationId.toString(),
          donor_id: donationData.donorId.toString(),
          impact_type: donationData.impactType,
          platform: 'secondwind'
        },
        statement_descriptor: 'SecondWind Recovery Fund',
        description: `Donation for ${donationData.impactType} recovery support`
      });

      // Update donation with payment info
      await client.query(
        'UPDATE donations SET stripe_payment_id = $1, status = $2 WHERE id = $3',
        [paymentIntent.id, 'completed', donationId]
      );

      await client.query('COMMIT');

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Stripe donation processing error:', error);

      // Update donation status to failed
      if (client) {
        try {
          await client.query(
            'UPDATE donations SET status = $1 WHERE id = (SELECT currval(\'donations_id_seq\'))',
            ['failed']
          );
          await client.query('COMMIT');
        } catch (rollbackError) {
          console.error('Failed to update donation status on error:', rollbackError);
        }
      }

      throw new Error(`Donation processing failed: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Distribute funds to vendors (create transfers)
   */
  static async createVendorTransfer(transferData: VendorPayoutData): Promise<{
    transferId: string;
    status: string;
  }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get vendor's Stripe account ID
      const vendorResult = await client.query(
        'SELECT stripe_account_id FROM vendors WHERE id = $1',
        [transferData.vendorId]
      );

      if (vendorResult.rows.length === 0) {
        throw new Error('Vendor not found');
      }

      const stripeAccountId = vendorResult.rows[0].stripe_account_id;

      if (!stripeAccountId) {
        throw new Error('Vendor Stripe account not configured');
      }

      // Create transfer to vendor
      const transfer = await stripe.transfers.create({
        amount: transferData.amount,
        currency: 'usd',
        destination: stripeAccountId,
        metadata: {
          transaction_id: transferData.transactionId.toString(),
          beneficiary_id: transferData.beneficiaryId.toString(),
          vendor_id: transferData.vendorId.toString(),
          platform: 'secondwind'
        },
        description: transferData.description
      });

      // Update transaction status
      await client.query(
        'UPDATE transactions SET stripe_transfer_id = $1, status = $2 WHERE id = $3',
        [transfer.id, 'completed', transferData.transactionId]
      );

      await client.query('COMMIT');

      return {
        transferId: transfer.id,
        status: transfer.status
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Stripe vendor transfer error:', error);
      throw new Error(`Vendor transfer failed: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(rawBody: Buffer, signature: string): Promise<{ received: boolean }> {
    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripeWebhookSecret!
      );

      console.log(`Processing Stripe webhook: ${event.type}`);

      switch (event.type) {
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'transfer.created':
          await this.handleTransferCreated(event.data.object);
          break;

        case 'transfer.failed':
          await this.handleTransferFailed(event.data.object);
          break;

        case 'payout.paid':
          await this.handlePayoutPaid(event.data.object);
          break;

        default:
          console.log(`Unhandled webhook event: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }

  // Webhook event handlers
  private static async handleAccountUpdated(account: any) {
    try {
      // Update vendor verification status
      const verificationStatus = account.details_submitted ? 'verified' : 'pending';

      await pool.query(
        'UPDATE vendors SET verification_status = $1, updated_at = NOW() WHERE stripe_account_id = $2',
        [verificationStatus, account.id]
      );

      console.log(`✅ Vendor account ${account.id} verification status updated to ${verificationStatus}`);
    } catch (error) {
      console.error('Account update handler error:', error);
    }
  }

  private static async handlePaymentIntentSucceeded(paymentIntent: any) {
    try {
      // Update donation status
      await pool.query(
        'UPDATE donations SET status = $1, updated_at = NOW() WHERE stripe_payment_id = $2',
        ['completed', paymentIntent.id]
      );

      // Trigger fund distribution (this would be handled by a queue in production)
      const donationId = paymentIntent.metadata.donation_id;
      await this.distributeFundsToBeneficiaries(donationId);

      console.log(`✅ Payment ${paymentIntent.id} succeeded, funds distributed`);
    } catch (error) {
      console.error('Payment success handler error:', error);
    }
  }

  private static async handlePaymentIntentFailed(paymentIntent: any) {
    try {
      // Update donation status
      await pool.query(
        'UPDATE donations SET status = $1, updated_at = NOW() WHERE stripe_payment_id = $2',
        ['failed', paymentIntent.id]
      );

      console.log(`❌ Payment ${paymentIntent.id} failed: ${paymentIntent.last_payment_error?.message}`);
    } catch (error) {
      console.error('Payment failure handler error:', error);
    }
  }

  private static async handleTransferCreated(transfer: any) {
    try {
      console.log(`💸 Transfer ${transfer.id} created for $${transfer.amount / 100} to ${transfer.destination}`);
    } catch (error) {
      console.error('Transfer created handler error:', error);
    }
  }

  private static async handleTransferFailed(transfer: any) {
    try {
      // Update transaction status
      await pool.query(
        'UPDATE transactions SET status = $1, updated_at = NOW() WHERE stripe_transfer_id = $2',
        ['failed', transfer.id]
      );

      console.log(`❌ Transfer ${transfer.id} failed`);
    } catch (error) {
      console.error('Transfer failed handler error:', error);
    }
  }

  private static async handlePayoutPaid(payout: any) {
    try {
      console.log(`💰 Payout ${payout.id} paid to vendor account ${payout.destination} for $${payout.amount / 100}`);
    } catch (error) {
      console.error('Payout paid handler error:', error);
    }
  }

  /**
   * Distribute donation funds to qualified beneficiaries
   * This implements the core SecondWind matching algorithm
   */
  private static async distributeFundsToBeneficiaries(donationId: string) {
    try {
      // Get donation details
      const donationResult = await pool.query(
        'SELECT amount, impact_type FROM donations WHERE id = $1',
        [donationId]
      );

      if (donationResult.rows.length === 0) return;

      const { amount, impact_type } = donationResult.rows[0];
      const categoryMap = {
        'shelter': 'RENT',
        'mobility': 'TRANSPORT',
        'tech': 'TECH',
        'wellness': 'RENT'
      };

      const category = categoryMap[impact_type as keyof typeof categoryMap];

      // Find qualified beneficiaries for this impact type
      const qualifiedBeneficiaries = await pool.query(
        `SELECT b.id, b.user_id
         FROM beneficiaries b
         WHERE b.application_status = 'qualified'
         AND b.medicaid_status IN ('verified', 'approved')
         AND NOT EXISTS (
           SELECT 1 FROM transactions t
           WHERE t.beneficiary_id = b.id
           AND t.category = $1
           AND t.created_at > NOW() - INTERVAL '30 days'
         )
         ORDER BY b.created_at ASC
         LIMIT 10`, // Process up to 10 beneficiaries per donation
        [category]
      );

      // Calculate distribution amount per beneficiary (standard amounts)
      const standardAmounts = {
        'RENT': 15000,      // $150
        'TRANSPORT': 4500,  // $45
        'TECH': 10000       // $100
      };

      const amountPerBeneficiary = standardAmounts[category as keyof typeof standardAmounts] || 5000;
      const maxBeneficiaries = Math.min(
        qualifiedBeneficiaries.rows.length,
        Math.floor((amount * 100) / amountPerBeneficiary) // Convert dollars to cents
      );

      // Create transactions for matched beneficiaries
      for (let i = 0; i < maxBeneficiaries; i++) {
        const beneficiary = qualifiedBeneficiaries.rows[i];

        // Find available vendor for this category and location
        const vendorResult = await pool.query(
          `SELECT v.id, v.business_name, v.stripe_account_id
           FROM vendors v
           WHERE v.verification_status = 'verified'
           AND v.vendor_type = $1
           ORDER BY RANDOM()
           LIMIT 1`,
          [impact_type === 'shelter' ? 'housing' : impact_type === 'mobility' ? 'transport' : 'tech']
        );

        if (vendorResult.rows.length > 0) {
          const vendor = vendorResult.rows[0];

          // Create transaction record
          const transactionResult = await pool.query(
            `INSERT INTO transactions (
              donation_id, beneficiary_id, vendor_id, amount, category,
              vendor_name, recipient_hash, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
            RETURNING id`,
            [
              donationId,
              beneficiary.id,
              vendor.id,
              amountPerBeneficiary / 100, // Convert cents to dollars
              category,
              vendor.business_name,
              `anon_${beneficiary.id}_${Date.now()}`, // Anonymized hash
              'pending'
            ]
          );

          const transactionId = transactionResult.rows[0].id;

          // Create Stripe transfer
          try {
            await this.createVendorTransfer({
              vendorId: vendor.id,
              amount: amountPerBeneficiary,
              beneficiaryId: beneficiary.id,
              transactionId,
              description: `${category} support payment - SecondWind Recovery Fund`
            });
          } catch (transferError) {
            console.error(`Transfer failed for beneficiary ${beneficiary.id}:`, transferError);
            // Transaction remains in 'pending' status for manual review
          }
        }
      }

      console.log(`✅ Distributed funds from donation ${donationId} to ${maxBeneficiaries} beneficiaries`);

    } catch (error) {
      console.error('Fund distribution error:', error);
      // In production, this would trigger an alert for manual intervention
    }
  }

  /**
   * Create setup intent for saving payment methods
   */
  static async createSetupIntent(customerId?: string) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        metadata: {
          platform: 'secondwind'
        }
      });

      return {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id
      };
    } catch (error) {
      console.error('Setup intent creation error:', error);
      throw new Error(`Failed to create payment setup: ${error.message}`);
    }
  }

  /**
   * Get payment methods for a customer
   */
  static async getPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw new Error(`Failed to retrieve payment methods: ${error.message}`);
    }
  }
}
