import { createHash, randomBytes } from 'crypto';

/**
 * Generate a privacy-preserving recipient hash
 * This creates a deterministic but non-reversible identifier
 */
export const generateRecipientHash = (userId: string, donationId: string): string => {
  const hash = createHash('sha256')
    .update(`${userId}-${donationId}-${process.env.HASH_SALT || 'default-salt'}`)
    .digest('hex');
  
  return `0x${hash.substring(0, 16)}`;
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  return randomBytes(length).toString('hex');
};
