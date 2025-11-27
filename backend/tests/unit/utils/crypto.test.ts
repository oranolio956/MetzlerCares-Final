import { describe, it, expect } from 'vitest';
import { generateRecipientHash, generateSecureToken } from '../../../src/utils/crypto.js';

describe('Crypto Utilities', () => {
  describe('generateRecipientHash', () => {
    it('should generate a recipient hash', () => {
      const userId = 'user-123';
      const donationId = 'donation-456';
      const hash = generateRecipientHash(userId, donationId);

      expect(hash).toBeTruthy();
      expect(hash).toMatch(/^0x[a-f0-9]{16}$/);
    });

    it('should generate same hash for same inputs', () => {
      const userId = 'user-123';
      const donationId = 'donation-456';
      const hash1 = generateRecipientHash(userId, donationId);
      const hash2 = generateRecipientHash(userId, donationId);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different inputs', () => {
      const hash1 = generateRecipientHash('user-1', 'donation-1');
      const hash2 = generateRecipientHash('user-2', 'donation-2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a secure token', () => {
      const token = generateSecureToken();
      
      expect(token).toBeTruthy();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
    });

    it('should generate different tokens each time', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate token of specified length', () => {
      const token = generateSecureToken(16);
      
      expect(token).toHaveLength(32); // 16 bytes = 32 hex characters
    });
  });
});
