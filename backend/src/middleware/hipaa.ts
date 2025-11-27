import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { getDatabasePool } from '../config/database.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

/**
 * HIPAA Compliance Middleware
 * 
 * Requirements:
 * - Access controls (only authorized users can access PHI)
 * - Audit logging (all PHI access must be logged)
 * - Minimum necessary (users can only access what they need)
 * - Encryption (PHI must be encrypted at rest and in transit)
 */

export interface HIPAAContext {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Log PHI access for HIPAA compliance
 */
export const logPHIAccess = async (context: HIPAAContext): Promise<void> => {
  const pool = getDatabasePool();
  
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        context.userId,
        `PHI_ACCESS:${context.action}`,
        context.resourceType,
        context.resourceId || null,
        context.ipAddress,
        context.userAgent,
        JSON.stringify({
          compliance: 'HIPAA',
          timestamp: new Date().toISOString(),
        }),
      ]
    );
  } catch (error) {
    logger.error('Failed to log PHI access:', error);
    // Don't fail the request if logging fails, but log the error
  }
};

/**
 * Middleware to enforce HIPAA access controls
 * Ensures only authorized users can access PHI
 */
export const requireHIPAAAccess = (
  resourceType: string,
  checkOwnership: (req: Request) => boolean = (req) => {
    // Default: user can only access their own data
    return req.user?.userId === req.params.userId;
  }
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required for PHI access');
    }

    // Check ownership or authorization
    if (!checkOwnership(req)) {
      throw new AuthorizationError('Unauthorized access to PHI');
    }

    // Log PHI access
    await logPHIAccess({
      userId: req.user.userId,
      action: `${req.method} ${req.path}`,
      resourceType,
      resourceId: req.params.id || req.params.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
    });

    next();
  };
};

/**
 * Check if user has minimum necessary access
 * HIPAA requires users to only access the minimum PHI necessary
 */
export const enforceMinimumNecessary = (
  allowedFields: string[]
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Filter response to only include allowed fields
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      if (Array.isArray(data)) {
        data = data.map(item => filterFields(item, allowedFields));
      } else if (typeof data === 'object' && data !== null) {
        data = filterFields(data, allowedFields);
      }
      return originalJson(data);
    };
    next();
  };
};

const filterFields = (obj: any, allowedFields: string[]): any => {
  const filtered: any = {};
  for (const field of allowedFields) {
    if (obj[field] !== undefined) {
      filtered[field] = obj[field];
    }
  }
  return filtered;
};
