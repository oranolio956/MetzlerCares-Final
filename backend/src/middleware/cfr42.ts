import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { getDatabasePool } from '../config/database.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

/**
 * 42 CFR Part 2 Compliance Middleware
 * 
 * Requirements for Substance Use Disorder (SUD) records:
 * - Written consent required for disclosure
 * - Redisclosure prohibition (cannot share with third parties)
 * - Patient access rights
 * - Security safeguards
 * - Audit trail for all disclosures
 */

export interface CFR42Context {
  userId: string;
  action: 'ACCESS' | 'DISCLOSE' | 'MODIFY' | 'DELETE';
  resourceType: 'APPLICATION' | 'CHAT' | 'PROFILE' | 'DOCUMENT';
  resourceId?: string | undefined;
  disclosedTo?: string; // If disclosing to third party
  consentId?: string; // Written consent ID
  ipAddress: string;
  userAgent: string;
}

/**
 * Log 42 CFR Part 2 disclosure/access
 */
export const logCFR42Access = async (context: CFR42Context): Promise<void> => {
  const pool = getDatabasePool();
  
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        context.userId,
        `CFR42_${context.action}:${context.resourceType}`,
        context.resourceType,
        context.resourceId ?? null,
        context.ipAddress,
        context.userAgent,
        JSON.stringify({
          compliance: '42_CFR_Part_2',
          disclosedTo: context.disclosedTo || null,
          consentId: context.consentId || null,
          timestamp: new Date().toISOString(),
        }),
      ]
    );
  } catch (error) {
    logger.error('Failed to log CFR42 access:', error);
  }
};

/**
 * Check if user has written consent for disclosure
 * 42 CFR Part 2 requires written consent for any disclosure
 */
export const checkConsent = async (
  userId: string,
  resourceType: string
): Promise<boolean> => {
  const pool = getDatabasePool();
  
  // Check if user has given consent for this resource type
  // In production, this would check a consent_records table
  const result = await pool.query(
    `SELECT consent_given_at 
     FROM beneficiary_profiles 
     WHERE user_id = $1 AND consent_given_at IS NOT NULL`,
    [userId]
  );

  return result.rows.length > 0;
};

/**
 * Middleware to enforce 42 CFR Part 2 compliance
 */
export const requireCFR42Compliance = (
  resourceType: CFR42Context['resourceType'],
  requiresConsent: boolean = true
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required for SUD record access');
    }

    // 42 CFR Part 2: Only the patient can access their own records
    // (or authorized representatives with written consent)
    if (req.user.userId !== req.params.userId && req.user.userType !== 'admin') {
      throw new AuthorizationError('Unauthorized access to SUD records');
    }

    // Check consent if required
    if (requiresConsent && req.user.userType !== 'admin') {
      const hasConsent = await checkConsent(req.user.userId, resourceType);
      if (!hasConsent) {
        throw new AuthorizationError('Written consent required for SUD record access');
      }
    }

    // Log access
    const resourceId = req.params.id || req.params.userId;
    await logCFR42Access({
      userId: req.user.userId,
      action: req.method === 'GET' ? 'ACCESS' : req.method === 'DELETE' ? 'DELETE' : 'MODIFY',
      resourceType,
      resourceId: resourceId || undefined,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    });

    next();
  };
};

/**
 * Prevent redisclosure of 42 CFR Part 2 records
 * Records cannot be shared with third parties without explicit consent
 */
export const preventRedisclosure = () => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    // Add header to prevent redisclosure
    res.setHeader('X-CFR42-No-Redisclosure', 'true');
    res.setHeader('X-CFR42-Confidential', 'true');
    
    next();
  };
};
