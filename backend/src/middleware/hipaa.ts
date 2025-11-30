import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { pool } from '../database.js';

// Encryption configuration (should be in environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

// Types for HIPAA compliance
interface PHIField {
  path: string;
  reason: string;
  retention: number; // days
}

interface AuditEvent {
  userId: number | null;
  action: string;
  resourceType: string;
  resourceId?: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  justification?: string;
  oldValues?: any;
  newValues?: any;
}

// Fields containing Protected Health Information (PHI)
const PHI_FIELDS: PHIField[] = [
  { path: 'email', reason: 'Direct identifier', retention: 2555 }, // 7 years HIPAA
  { path: 'phone', reason: 'Contact for treatment', retention: 2555 },
  { path: 'medicaidId', reason: 'Health insurance identifier', retention: 2555 },
  { path: 'diagnosis', reason: 'Medical condition', retention: 2555 },
  { path: 'treatment', reason: 'Medical care information', retention: 2555 },
  { path: 'medication', reason: 'Prescription information', retention: 2555 },
  { path: 'days_sober', reason: 'Recovery progress', retention: 2555 },
  { path: 'medicaid_status', reason: 'Insurance status', retention: 2555 }
];

// Encryption utilities
export class PHIEncryption {
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM(ALGORITHM, ENCRYPTION_KEY);
    cipher.setIV(iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Return format: iv:encrypted:authTag
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
  }

  static decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, encrypted, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipherGCM(ALGORITHM, ENCRYPTION_KEY);
    decipher.setIV(iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static hashIdentifier(identifier: string): string {
    return crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 16);
  }
}

// HIPAA audit logging
export class HIPAAAudit {
  static async logEvent(event: AuditEvent): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO audit_logs (
          user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          event.userId,
          event.action,
          event.resourceType,
          event.resourceId || null,
          event.oldValues ? JSON.stringify(event.oldValues) : null,
          event.newValues ? JSON.stringify(event.newValues) : null,
          event.ipAddress,
          event.userAgent
        ]
      );
    } catch (error) {
      console.error('HIPAA audit logging failed:', error);
      // In production, this should trigger an alert
    }
  }

  static async logAccess(
    req: Request,
    userId: number | null,
    resourceType: string,
    resourceId?: string,
    justification?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: 'PHI_ACCESS',
      resourceType,
      resourceId,
      success: true,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      justification: justification || 'API access'
    });
  }

  static async logModification(
    req: Request,
    userId: number,
    resourceType: string,
    resourceId: string,
    oldValues: any,
    newValues: any
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: 'PHI_MODIFICATION',
      resourceType,
      resourceId,
      success: true,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      oldValues,
      newValues
    });
  }
}

// Data sanitization middleware
export const sanitizePHI = (req: Request, res: Response, next: NextFunction) => {
  // Store original response.json to intercept PHI
  const originalJson = res.json;
  res.json = function(data: any) {
    const sanitized = sanitizeObject(data);
    return originalJson.call(this, sanitized);
  };

  next();
};

// Recursively sanitize objects to remove/replace PHI
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isPHIField(key)) {
      // Replace PHI with hashed/anonymized version
      sanitized[key] = `[PROTECTED-${key.toUpperCase()}]`;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Check if a field contains PHI
function isPHIField(fieldName: string): boolean {
  const lowerField = fieldName.toLowerCase();
  return PHI_FIELDS.some(phi => lowerField.includes(phi.path.toLowerCase()));
}

// Access control middleware for PHI
export const requirePHIAccess = (justification?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required for PHI access' });
    }

    // Log PHI access
    await HIPAAAudit.logAccess(
      req,
      req.user.userId,
      req.route?.path || req.path,
      req.params.id,
      justification
    );

    // Check if user has permission to access PHI
    const allowedRoles = ['admin', 'beneficiary']; // Beneficiaries can access their own PHI
    if (!allowedRoles.includes(req.user.role)) {
      await HIPAAAudit.logEvent({
        userId: req.user.userId,
        action: 'PHI_ACCESS_DENIED',
        resourceType: req.route?.path || req.path,
        success: false,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      });

      return res.status(403).json({
        error: 'Insufficient permissions to access protected health information',
        code: 'HIPAA_ACCESS_DENIED'
      });
    }

    next();
  };
};

// Data retention enforcement
export const enforceDataRetention = async (): Promise<void> => {
  try {
    const retentionQueries = PHI_FIELDS.map(field => ({
      query: `DELETE FROM audit_logs WHERE action = 'PHI_ACCESS' AND timestamp < NOW() - INTERVAL '${field.retention} days'`,
      field: field.path
    }));

    for (const { query, field } of retentionQueries) {
      const result = await pool.query(query);
      if (result.rowCount && result.rowCount > 0) {
        console.log(`[HIPAA] Cleaned up ${result.rowCount} expired ${field} records`);
      }
    }

    console.log('[HIPAA] Data retention enforcement completed');
  } catch (error) {
    console.error('[HIPAA] Data retention enforcement failed:', error);
  }
};

// Automated compliance checks
export const runComplianceChecks = async (): Promise<{
  passed: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Check for unencrypted PHI in logs
    const logCheck = await pool.query(`
      SELECT COUNT(*) as count FROM audit_logs
      WHERE old_values::text LIKE '%email%' OR new_values::text LIKE '%email%'
    `);

    if (parseInt(logCheck.rows[0].count) > 0) {
      issues.push('PHI data found in audit logs - ensure proper encryption');
      recommendations.push('Implement PHI encryption in audit logging');
    }

    // Check for expired data retention
    const retentionCheck = await pool.query(`
      SELECT COUNT(*) as count FROM audit_logs
      WHERE timestamp < NOW() - INTERVAL '7 years'
    `);

    if (parseInt(retentionCheck.rows[0].count) > 0) {
      issues.push('Expired PHI data found in system');
      recommendations.push('Run data retention cleanup process');
    }

    // Check for unauthorized access patterns
    const accessCheck = await pool.query(`
      SELECT ip_address, COUNT(*) as attempts
      FROM audit_logs
      WHERE action = 'PHI_ACCESS_DENIED' AND timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY ip_address
      HAVING COUNT(*) > 10
    `);

    if (accessCheck.rows.length > 0) {
      issues.push('Suspicious access patterns detected');
      recommendations.push('Review access control policies');
    }

  } catch (error) {
    issues.push(`Compliance check failed: ${error.message}`);
  }

  return {
    passed: issues.length === 0,
    issues,
    recommendations
  };
};

// Business Associate Agreement compliance
export const validateBAACompliance = async (vendorData: any): Promise<{
  compliant: boolean;
  issues: string[];
}> => {
  const issues: string[] = [];

  // Check if vendor has signed BAA
  if (!vendorData.baaSigned) {
    issues.push('Business Associate Agreement not signed');
  }

  // Check BAA expiration
  if (vendorData.baaExpiry && new Date(vendorData.baaExpiry) < new Date()) {
    issues.push('Business Associate Agreement has expired');
  }

  // Check data handling compliance
  if (!vendorData.encryptionEnabled) {
    issues.push('Vendor does not have required encryption');
  }

  return {
    compliant: issues.length === 0,
    issues
  };
};

// Emergency access procedures
export const emergencyAccess = async (
  userId: number,
  justification: string,
  approvedBy: string
): Promise<string> => {
  // Generate temporary emergency access token
  const emergencyToken = crypto.randomBytes(32).toString('hex');

  await pool.query(
    'INSERT INTO audit_logs (user_id, action, resource_type, old_values) VALUES ($1, $2, $3, $4)',
    [
      userId,
      'EMERGENCY_ACCESS_GRANTED',
      'system',
      JSON.stringify({
        justification,
        approvedBy,
        token: emergencyToken.substring(0, 8) + '...' // Log partial token for audit
      })
    ]
  );

  // Store full token in Redis with expiration
  await pool.query(`
    INSERT INTO emergency_access (user_id, token_hash, expires_at, approved_by)
    VALUES ($1, $2, NOW() + INTERVAL '24 hours', $3)
  `, [
    userId,
    crypto.createHash('sha256').update(emergencyToken).digest('hex'),
    approvedBy
  ]);

  return emergencyToken;
};

// Audit logging function
export const logAuditEvent = async (
  userId: number | null,
  action: string,
  details: any,
  req: Request,
  resourceType?: string,
  resourceId?: number
) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        userId,
        action,
        resourceType || 'system',
        resourceId,
        details.oldValues ? JSON.stringify(details.oldValues) : null,
        details.newValues ? JSON.stringify(details.newValues) : null,
        req.ip || req.connection?.remoteAddress?.toString() || 'unknown',
        req.get('User-Agent') || 'unknown'
      ]
    );
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};
