import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt.js';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted
    try {
      const redis = getRedisClient();
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new AuthenticationError('Token has been revoked');
      }
    } catch (error) {
      // If Redis fails, continue (graceful degradation)
      logger.warn('Redis check failed during authentication, continuing:', error);
    }

    // Verify token
    const payload = verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error) {
    next(error); // Pass to error handler
  }
};

export const requireUserType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedTypes.includes(req.user.userType)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};
