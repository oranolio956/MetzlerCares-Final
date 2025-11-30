import { pool, redis } from '../database.js';
import { shutdownTracing } from './tracing.js';
import { stopMetricsCollection } from './metrics.js';
import { preShutdownHealthCheck } from './health.js';

/**
 * Graceful shutdown utility for the SecondWind backend
 * Ensures all connections and resources are properly closed
 */

export interface ShutdownOptions {
  timeout?: number;
  force?: boolean;
  healthCheck?: boolean;
}

export class GracefulShutdown {
  private static instance: GracefulShutdown;
  private isShuttingDown = false;
  private shutdownTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): GracefulShutdown {
    if (!GracefulShutdown.instance) {
      GracefulShutdown.instance = new GracefulShutdown();
    }
    return GracefulShutdown.instance;
  }

  async shutdown(signal: string, options: ShutdownOptions = {}): Promise<void> {
    if (this.isShuttingDown) {
      console.log('Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    const timeout = options.timeout || 30000; // 30 seconds default

    console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);

    try {
      // Set force shutdown timer
      this.shutdownTimeout = setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, timeout);

      // Optional pre-shutdown health check
      if (options.healthCheck !== false) {
        console.log('🏥 Running pre-shutdown health checks...');
        const healthOk = await preShutdownHealthCheck();
        if (!healthOk && !options.force) {
          console.warn('⚠️ Pre-shutdown health check failed, but proceeding with force flag');
        }
      }

      // Shutdown observability first (tracing, metrics)
      console.log('📊 Shutting down observability...');
      await shutdownTracing();
      stopMetricsCollection();

      // Close database connections
      console.log('💾 Closing database connections...');
      await Promise.all([
        pool.end(),
        redis.disconnect()
      ]);

      // Clear shutdown timeout
      if (this.shutdownTimeout) {
        clearTimeout(this.shutdownTimeout);
        this.shutdownTimeout = null;
      }

      console.log('✅ Graceful shutdown completed successfully');
      process.exit(0);

    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);

      // Clear shutdown timeout
      if (this.shutdownTimeout) {
        clearTimeout(this.shutdownTimeout);
        this.shutdownTimeout = null;
      }

      process.exit(1);
    }
  }

  isCurrentlyShuttingDown(): boolean {
    return this.isShuttingDown;
  }
}

// Convenience function for direct use
export async function gracefulShutdown(signal: string, options?: ShutdownOptions): Promise<void> {
  const shutdownManager = GracefulShutdown.getInstance();
  return shutdownManager.shutdown(signal, options);
}

// Setup common signal handlers
export function setupSignalHandlers(): void {
  const shutdownManager = GracefulShutdown.getInstance();

  // Handle common termination signals
  ['SIGTERM', 'SIGINT'].forEach(signal => {
    process.on(signal, () => {
      if (!shutdownManager.isCurrentlyShuttingDown()) {
        gracefulShutdown(signal);
      }
    });
  });

  // Handle uncaught exceptions and rejections
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    if (!shutdownManager.isCurrentlyShuttingDown()) {
      gracefulShutdown('uncaughtException', { force: true });
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    if (!shutdownManager.isCurrentlyShuttingDown()) {
      gracefulShutdown('unhandledRejection', { force: true });
    }
  });
}


