import { getEnv } from '../config/env.js';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export const getRateLimitConfig = (type: 'api' | 'auth' | 'chat' | 'upload'): RateLimitConfig => {
  const env = getEnv();

  const configs: Record<string, RateLimitConfig> = {
    api: {
      windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
      max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
      message: 'Too many requests from this IP, please try again later.',
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: 'Too many authentication attempts, please try again later.',
    },
    chat: {
      windowMs: 60 * 1000, // 1 minute
      max: 20,
      message: 'Too many chat requests, please slow down.',
    },
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
      message: 'Too many file uploads, please try again later.',
    },
  };

  return configs[type] || configs.api;
};
