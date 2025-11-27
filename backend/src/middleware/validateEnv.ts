import { Request, Response, NextFunction } from 'express';
import { getEnv } from '../config/env.js';

/**
 * Middleware to check if required environment variables are set
 * This prevents the server from running with missing critical config
 */
export const validateEnvironment = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const env = getEnv();
  const missing: string[] = [];

  // Critical variables that must be set
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    missing.push('JWT_SECRET (must be at least 32 characters)');
  }

  if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET.length < 32) {
    missing.push('JWT_REFRESH_SECRET (must be at least 32 characters)');
  }

  // Database is critical
  if (!env.DATABASE_URL && (!env.DB_HOST || !env.DB_NAME)) {
    missing.push('DATABASE_URL or DB_HOST/DB_NAME');
  }

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Configuration Error',
      message: 'Missing required environment variables',
      missing,
    });
    return;
  }

  next();
};
