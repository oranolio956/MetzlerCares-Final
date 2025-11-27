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
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Rate limiting
import { apiRateLimiter } from './middleware/rateLimit.js';
app.use(`/api/${env.API_VERSION}`, apiRateLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const redisHealth = await checkRedisHealth();

  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth ? 'healthy' : 'unhealthy',
      redis: redisHealth ? 'healthy' : 'unhealthy',
    },
  };

  const isHealthy = dbHealth && redisHealth;
  res.status(isHealthy ? 200 : 503).json(status);
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

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Initialize database and Redis connections
const initializeConnections = async () => {
  try {
    getDatabasePool();
    getRedisClient();
  } catch (error) {
    logger.error('Failed to initialize connections:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
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
