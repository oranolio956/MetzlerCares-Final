import { Request, Response, NextFunction } from 'express';
import { getDatabasePool } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const auditLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Only log authenticated requests
  if (!req.user) {
    next();
    return;
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    // Log after response is sent
    setImmediate(async () => {
      try {
        const pool = getDatabasePool();
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            req.user?.userId || null,
            `${req.method} ${req.path}`,
            req.params.resourceType || null,
            req.params.id || null,
            req.ip,
            req.get('user-agent') || null,
            JSON.stringify({
              requestId: req.id,
              method: req.method,
              path: req.path,
              query: req.query,
              statusCode: res.statusCode,
            }),
          ]
        );
      } catch (error) {
        // Don't fail the request if audit logging fails
        logger.error('Audit log failed:', error);
      }
    });

    return originalSend.call(this, body);
  };

  next();
};
