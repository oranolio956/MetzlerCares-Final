import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, hashSensitiveData } from '../../../src/utils/encryption.js';

describe('Encryption Utilities', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', async () => {
      const originalText = 'sensitive-data-123';
      const encrypted = await encrypt(originalText);
      const decrypted = await decrypt(encrypted);

      expect(encrypted).not.toBe(originalText);
      expect(encrypted).toContain(':');
      expect(decrypted).toBe(originalText);
    });

    it('should produce different encrypted values for same input', async () => {
      const text = 'same-text';
      const encrypted1 = await encrypt(text);
      const encrypted2 = await encrypt(text);

      // Should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to same value
      expect(await decrypt(encrypted1)).toBe(text);
      expect(await decrypt(encrypted2)).toBe(text);
    });

    it('should handle empty string', async () => {
      const encrypted = await encrypt('');
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toBe('');
    });

    it('should handle long text', async () => {
      const longText = 'a'.repeat(10000);
      const encrypted = await encrypt(longText);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toBe(longText);
    });

    it('should throw error for invalid encrypted format', async () => {
      await expect(decrypt('invalid-format')).rejects.toThrow();
    });
  });

  describe('hashSensitiveData', () => {
    it('should hash sensitive data', async () => {
      const data = 'sensitive-ssn-123-45-6789';
      const hash = await hashSensitiveData(data);

      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(64); // SHA-256 hex string
      expect(hash).not.toBe(data);
    });

    it('should produce same hash for same input', async () => {
      const data = 'same-data';
      const hash1 = await hashSensitiveData(data);
      const hash2 = await hashSensitiveData(data);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', async () => {
      const hash1 = await hashSensitiveData('data1');
      const hash2 = await hashSensitiveData('data2');

      expect(hash1).not.toBe(hash2);
    });
  });
});
