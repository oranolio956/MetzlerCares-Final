import { getEnv } from './env.js';
import { CorsOptions } from 'cors';

export const getCorsOptions = (): CorsOptions => {
  const env = getEnv();
  
  // Parse CORS_ORIGIN - can be comma-separated for multiple origins
  const origins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (origins.includes(origin) || origins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 86400, // 24 hours
  };
};
