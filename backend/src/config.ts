import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const parseOrigins = (value?: string): string[] | undefined => {
  if (!value) return undefined;
  try {
    const origins = value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    // Validate URL format for each origin
    origins.forEach(origin => {
      if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
        console.warn(`Invalid CORS origin format: ${origin}`);
      }
    });

    return origins;
  } catch (error) {
    console.error('Failed to parse CORS origins:', error);
    return undefined;
  }
};

// Validation helpers
const validatePort = (port: number): number => {
  if (isNaN(port) || port < 1 || port > 65535) {
    console.warn(`Invalid port number: ${port}, using default 4000`);
    return 4000;
  }
  return port;
};

const validateRateLimit = (value: number, defaultValue: number, field: string): number => {
  if (isNaN(value) || value < 1) {
    console.warn(`Invalid ${field}: ${value}, using default ${defaultValue}`);
    return defaultValue;
  }
  return value;
};

const validateJwtSecret = (secret?: string): string | undefined => {
  if (!secret) return undefined;
  if (secret.length < 32) {
    console.warn('JWT secret is shorter than recommended 32 characters');
  }
  return secret;
};

export const config = {
  port: validatePort(Number(process.env.PORT) || 4000),
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
  allowOrigins: parseOrigins(process.env.CORS_ALLOWED_ORIGINS),
  rateLimitWindowMs: validateRateLimit(Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000, 60_000, 'rate limit window'),
  rateLimitMax: validateRateLimit(Number(process.env.RATE_LIMIT_MAX) || 30, 30, 'rate limit max'),
  logFormat: process.env.HTTP_LOG_FORMAT || 'combined',
  authEmail: process.env.AUTH_EMAIL,
  authPassword: process.env.AUTH_PASSWORD,
  authPasswordHash: process.env.AUTH_PASSWORD_HASH,
  jwtSecret: validateJwtSecret(process.env.JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  // Stripe configuration
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // Database configuration
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
};
