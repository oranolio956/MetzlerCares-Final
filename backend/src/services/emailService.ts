import { logger } from '../utils/logger.js';
import { getEnv } from '../config/env.js';

const env = getEnv();

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Email service placeholder
 * In production, integrate with SendGrid, AWS SES, or similar
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // In production, this would:
  // 1. Use SendGrid API or AWS SES
  // 2. Handle bounces and errors
  // 3. Track email delivery
  // 4. Handle rate limiting

  logger.info('Email would be sent:', {
    to: options.to,
    subject: options.subject,
    // Don't log full content for privacy
  });

  // Placeholder: In production, implement actual email sending
  if (process.env.NODE_ENV === 'development') {
    logger.info('Email service not configured. In production, this would send:', {
      to: options.to,
      subject: options.subject,
    });
  }
};

export const sendReceiptEmail = async (
  email: string,
  receiptData: {
    donationId: string;
    amount: number;
    itemLabel: string;
    timestamp: Date;
  }
): Promise<void> => {
  const subject = 'Your SecondWind Donation Receipt';
  const text = `
Thank you for your donation to SecondWind!

Receipt Number: ${receiptData.donationId.substring(0, 8).toUpperCase()}
Amount: $${receiptData.amount.toFixed(2)}
Item: ${receiptData.itemLabel}
Date: ${receiptData.timestamp.toLocaleDateString()}

This donation is tax-deductible to the extent allowed by law.
SecondWind is a 501(c)(3) non-profit organization.

Thank you for your support!
  `.trim();

  await sendEmail({
    to: email,
    subject,
    text,
  });
};

export const sendApplicationStatusEmail = async (
  email: string,
  application: {
    type: string;
    status: string;
    note?: string;
  }
): Promise<void> => {
  const subject = `Your SecondWind Application: ${application.status}`;
  const text = `
Your application status has been updated.

Application Type: ${application.type}
Status: ${application.status}
${application.note ? `Note: ${application.note}` : ''}

You can view your application status in your dashboard.
  `.trim();

  await sendEmail({
    to: email,
    subject,
    text,
  });
};
