import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { loadEnv } from './config/env.js';
import { logger } from './utils/logger.js';
import { getDatabasePool, closeDatabasePool, checkDatabaseHealth } from './config/database.js';
import { getRedisClient, closeRedisClient, checkRedisHealth } from './config/redis.js';

// Load environment variables
loadEnv();
const env = loadEnv();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
import { getCorsOptions } from './config/cors.js';
app.use(cors(getCorsOptions()));

// Environment validation middleware
import { validateEnvironment } from './middleware/validateEnv.js';
app.use(validateEnvironment);

// Raw body middleware for Stripe webhooks (must be before json parser)
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware
import { requestId } from './middleware/requestId.js';
app.use(requestId);

// Request logging middleware (with response time)
import { requestLogger } from './middleware/requestLogger.js';
app.use(requestLogger);

// Rate limiting
import { apiRateLimiter } from './middleware/rateLimit.js';
app.use(`/api/${env.API_VERSION}`, apiRateLimiter);

// Health check endpoint
import { performHealthCheck } from './utils/healthCheck.js';
app.get('/health', async (req, res) => {
  try {
    const health = await performHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// API routes
import routes from './routes/index.js';
app.use(routes);

// Status endpoint
app.get(`/api/${env.API_VERSION}/status`, (req, res) => {
  res.json({
    status: 'ok',
    version: env.API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware (must be last)
import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);

// Initialize database and Redis connections
const initializeConnections = async () => {
  try {
    // Try to initialize database (non-blocking in development)
    try {
      getDatabasePool();
      logger.info('Database pool initialized');
    } catch (error) {
      logger.warn('Database initialization failed (continuing in development):', error);
      if (env.NODE_ENV === 'production') {
        throw error;
      }
    }

    // Try to initialize Redis (non-blocking in development)
    try {
      getRedisClient();
      logger.info('Redis client initialized');
    } catch (error) {
      logger.warn('Redis initialization failed (continuing in development):', error);
      if (env.NODE_ENV === 'production') {
        throw error;
      }
    }
    
    // Start background jobs (they handle their own errors)
    try {
      const { startSessionCleanup } = await import('./services/sessionCleanup.js');
      const { startChatCleanup } = await import('./services/chatCleanup.js');
      const { startDataRetentionCleanup } = await import('./services/dataRetention.js');
      startSessionCleanup();
      startChatCleanup();
      startDataRetentionCleanup();
    } catch (error) {
      logger.warn('Failed to start some background jobs:', error);
      // Don't fail server startup if background jobs fail
    }
  } catch (error) {
    logger.error('Failed to initialize connections:', error);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('Continuing in development mode despite connection errors');
    }
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    // Stop background jobs
    const { stopSessionCleanup } = await import('./services/sessionCleanup.js');
    const { stopChatCleanup } = await import('./services/chatCleanup.js');
    const { stopDataRetentionCleanup } = await import('./services/dataRetention.js');
    stopSessionCleanup();
    stopChatCleanup();
    stopDataRetentionCleanup();
    
    await closeDatabasePool();
    await closeRedisClient();
    logger.info('All connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const PORT = parseInt(env.PORT, 10);

const startServer = async () => {
  await initializeConnections();

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${env.NODE_ENV}`);
    logger.info(`🔗 API Version: ${env.API_VERSION}`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
