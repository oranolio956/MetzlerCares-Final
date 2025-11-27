import { cleanupExpiredSessions } from './sessionService.js';
import { logger } from '../utils/logger.js';

// Run cleanup every hour
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

let cleanupInterval: NodeJS.Timeout | null = null;

export const startSessionCleanup = (): void => {
  if (cleanupInterval) {
    logger.warn('Session cleanup already started');
    return;
  }

  const runCleanup = async () => {
    try {
      const count = await cleanupExpiredSessions();
      if (count > 0) {
        logger.info(`Cleaned up ${count} expired sessions`);
      }
    } catch (error) {
      logger.error('Session cleanup failed:', error);
    }
  };

  // Run immediately on start
  runCleanup();

  // Then run on interval
  cleanupInterval = setInterval(runCleanup, CLEANUP_INTERVAL_MS);
  logger.info('Session cleanup job started');
};

export const stopSessionCleanup = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Session cleanup job stopped');
  }
};
