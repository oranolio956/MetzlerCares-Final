import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

/**
 * Add request ID to all requests for tracing
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = randomBytes(8).toString('hex');
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
