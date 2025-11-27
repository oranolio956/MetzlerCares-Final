import { cleanupExpiredChatSessions } from './chatService.js';
import { logger } from '../utils/logger.js';

// Run cleanup every 6 hours
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

let cleanupInterval: NodeJS.Timeout | null = null;

export const startChatCleanup = (): void => {
  if (cleanupInterval) {
    logger.warn('Chat cleanup already started');
    return;
  }

  const runCleanup = async () => {
    try {
      const count = await cleanupExpiredChatSessions();
      if (count > 0) {
        logger.info(`Cleaned up ${count} expired chat sessions`);
      }
    } catch (error) {
      logger.error('Chat cleanup failed:', error);
    }
  };

  // Run immediately on start
  runCleanup();

  // Then run on interval
  cleanupInterval = setInterval(runCleanup, CLEANUP_INTERVAL_MS);
  logger.info('Chat cleanup job started');
};

export const stopChatCleanup = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Chat cleanup job stopped');
  }
};
