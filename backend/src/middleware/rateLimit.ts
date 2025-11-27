import rateLimit from 'express-rate-limit';
import { getRateLimitConfig } from '../utils/rateLimitConfig.js';

// General API rate limiter
export const apiRateLimiter = rateLimit({
  ...getRateLimitConfig('api'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/v1/status';
  },
});

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  ...getRateLimitConfig('auth'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for AI chat endpoints
export const chatRateLimiter = rateLimit({
  ...getRateLimitConfig('chat'),
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  ...getRateLimitConfig('upload'),
  standardHeaders: true,
  legacyHeaders: false,
});
