import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const parseOrigins = (value?: string): string[] | undefined => {
  if (!value) return undefined;
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const config = {
  port: Number(process.env.PORT) || 4000,
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
  allowOrigins: parseOrigins(process.env.CORS_ALLOWED_ORIGINS),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 30,
  logFormat: process.env.HTTP_LOG_FORMAT || 'combined',
  authEmail: process.env.AUTH_EMAIL,
  authPassword: process.env.AUTH_PASSWORD,
  authPasswordHash: process.env.AUTH_PASSWORD_HASH,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};
