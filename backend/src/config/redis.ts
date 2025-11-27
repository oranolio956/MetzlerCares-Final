import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = () => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 
      `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('disconnect', () => {
      logger.warn('Redis client disconnected');
    });

    redisClient.connect().catch((err) => {
      logger.error('Failed to connect to Redis:', err);
    });
  }

  return redisClient;
};

export const closeRedisClient = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis client closed');
  }
};

// Health check function
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};
