import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { getEnv } from '../config/env.js';
import { logger } from './logger.js';

const env = getEnv();
const scryptAsync = promisify(scrypt);

// Encryption key derivation
const getEncryptionKey = async (): Promise<Buffer> => {
  const salt = env.ENCRYPTION_SALT || 'default-salt-change-in-production';
  const key = (await scryptAsync(env.JWT_SECRET, salt, 32)) as Buffer;
  return key;
};

/**
 * Encrypt sensitive data (e.g., SSN, medical records)
 * Uses AES-256-GCM for authenticated encryption
 */
export const encrypt = async (text: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 */
export const decrypt = async (encryptedText: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash sensitive data (one-way, for searching)
 * Use for PII that needs to be searchable but not readable
 */
export const hashSensitiveData = async (text: string): Promise<string> => {
  const { createHash } = await import('crypto');
  const salt = env.ENCRYPTION_SALT || 'default-salt';
  return createHash('sha256')
    .update(text + salt)
    .digest('hex');
};
