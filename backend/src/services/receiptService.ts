import { getDatabasePool } from '../config/database.js';
// import { Donation } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, DatabaseError } from '../utils/errors.js';

export interface ReceiptData {
  donationId: string;
  amount: number;
  itemLabel: string;
  impactType: string;
  timestamp: Date;
  transactionId: string;
  donorName?: string;
  donorEmail?: string;
}

export const generateReceiptData = async (donationId: string): Promise<ReceiptData> => {
  const pool = getDatabasePool();

  const result = await pool.query(
    `SELECT 
       d.id,
       d.amount,
       d.item_label,
       d.impact_type,
       d.created_at,
       d.stripe_payment_intent_id,
       u.name as donor_name,
       u.email as donor_email
     FROM donations d
     JOIN users u ON d.user_id = u.id
     WHERE d.id = $1 AND d.status = 'succeeded'`,
    [donationId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Donation');
  }

  const donation = result.rows[0];

  return {
    donationId: donation.id,
    amount: parseFloat(donation.amount),
    itemLabel: donation.item_label,
    impactType: donation.impact_type,
    timestamp: donation.created_at,
    transactionId: donation.stripe_payment_intent_id,
    donorName: donation.donor_name,
    donorEmail: donation.donor_email,
  };
};

export const storeReceipt = async (
  donationId: string,
  receiptUrl: string
): Promise<void> => {
  const pool = getDatabasePool();

  try {
    // Store receipt URL in metadata (could also create a receipts table)
    await pool.query(
      `UPDATE donations 
       SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('receipt_url', $1)
       WHERE id = $2`,
      [receiptUrl, donationId]
    );

    logger.info('Receipt stored:', { donationId, receiptUrl });
  } catch (error) {
    logger.error('Failed to store receipt:', error);
    throw new DatabaseError('Failed to store receipt');
  }
};

// Generate receipt text (for email or PDF)
export const generateReceiptText = (data: ReceiptData): string => {
  const date = new Date(data.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
SECONDWIND RECOVERY PLATFORM
Tax-Deductible Donation Receipt

Receipt Number: ${data.donationId.substring(0, 8).toUpperCase()}
Date: ${date}
Transaction ID: ${data.transactionId}

Donor Information:
${data.donorName ? `Name: ${data.donorName}` : ''}
${data.donorEmail ? `Email: ${data.donorEmail}` : ''}

Donation Details:
Item: ${data.itemLabel}
Impact Type: ${data.impactType}
Amount: $${data.amount.toFixed(2)}

This donation is tax-deductible to the extent allowed by law.
SecondWind is a 501(c)(3) non-profit organization.

Thank you for your support!
  `.trim();
};
