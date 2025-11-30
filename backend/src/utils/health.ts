import { pool, redis } from './database.js';
import { checkTracingHealth } from './tracing.js';
import { config } from '../config.js';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: Record<string, ServiceHealth>;
  metrics?: Record<string, any>;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

// Comprehensive health check function
export async function performHealthCheck(includeMetrics = false): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const services: Record<string, ServiceHealth> = {};

  // Check database health
  services.database = await checkDatabaseHealth();

  // Check Redis health
  services.redis = await checkRedisHealth();

  // Check external services
  services.gemini = await checkGeminiHealth();

  // Check Stripe connectivity (if configured)
  if (config.stripeSecretKey) {
    services.stripe = await checkStripeHealth();
  }

  // Check tracing health
  services.tracing = await checkTracingHealth();

  // Calculate overall status
  const hasUnhealthy = Object.values(services).some(s => s.status === 'unhealthy');
  const hasDegraded = Object.values(services).some(s => s.status === 'degraded');

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (hasUnhealthy) overallStatus = 'unhealthy';
  else if (hasDegraded) overallStatus = 'degraded';

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services
  };

  // Include basic metrics if requested
  if (includeMetrics) {
    result.metrics = await getBasicMetrics();
  }

  const totalTime = Date.now() - startTime;
  console.log(`🏥 Health check completed in ${totalTime}ms - Status: ${overallStatus}`);

  return result;
}

// Individual service health checks
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    // Test basic connectivity
    await pool.query('SELECT 1 as health_check');

    // Test a more complex query
    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    const userCount = parseInt(result.rows[0].user_count);

    // Check connection pool stats
    const poolStats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };

    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        userCount,
        poolStats,
        connectionString: maskConnectionString(config.databaseUrl)
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error.message,
      details: { connectionString: maskConnectionString(config.databaseUrl) }
    };
  }
}

async function checkRedisHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    // Test basic connectivity
    await redis.ping();

    // Test set/get operation
    const testKey = `health_check_${Date.now()}`;
    await redis.set(testKey, 'ok');
    const value = await redis.get(testKey);
    await redis.del(testKey);

    if (value !== 'ok') {
      throw new Error('Redis set/get test failed');
    }

    // Get Redis info
    const info = await redis.info();
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];

    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        version: version || 'unknown',
        connectedClients: info.match(/connected_clients:(\d+)/)?.[1],
        usedMemory: info.match(/used_memory_human:([^\r\n]+)/)?.[1]
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

async function checkGeminiHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    // Test API key configuration
    if (!config.geminiApiKey) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: 'Gemini API key not configured'
      };
    }

    // Note: We don't make actual API calls in health checks to avoid rate limiting
    // In production, you might want to test with a simple cached response

    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        apiConfigured: true,
        endpoint: 'generativelanguage.googleapis.com'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

async function checkStripeHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    // Test API key configuration
    if (!config.stripeSecretKey) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: 'Stripe API key not configured'
      };
    }

    // Note: We don't make actual API calls in health checks
    // In production, you might want to test with a simple account retrieval

    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        apiConfigured: true,
        mode: config.stripeSecretKey.startsWith('sk_test_') ? 'test' : 'live'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

// Kubernetes-style health endpoints
export async function readinessCheck(): Promise<boolean> {
  try {
    const health = await performHealthCheck();
    // Readiness requires database and Redis to be healthy
    const criticalServices = ['database', 'redis'];
    return criticalServices.every(service =>
      health.services[service]?.status === 'healthy'
    );
  } catch (error) {
    console.error('Readiness check error:', error);
    return false;
  }
}

export async function livenessCheck(): Promise<boolean> {
  try {
    // Liveness checks if the process is responding and not deadlocked
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;

    // Check memory usage (1GB limit)
    if (memUsageMB > 1000) {
      console.error(`Memory usage too high: ${memUsageMB.toFixed(2)}MB`);
      return false;
    }

    // Check event loop responsiveness
    const start = Date.now();
    await new Promise(resolve => setImmediate(resolve));
    const delay = Date.now() - start;

    if (delay > 1000) { // 1 second delay indicates blocked event loop
      console.error(`Event loop blocked for ${delay}ms`);
      return false;
    }

    // Check if we can allocate memory (basic heap check)
    try {
      Buffer.alloc(1024); // Small allocation test
    } catch (error) {
      console.error('Memory allocation test failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Liveness check error:', error);
    return false;
  }
}

// Get basic metrics for health endpoint
async function getBasicMetrics(): Promise<Record<string, any>> {
  try {
    // Get database metrics
    const dbResult = await pool.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as users_24h,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as users_7d
      FROM users
    `);

    const donationResult = await pool.query(`
      SELECT
        COUNT(*) as total_donations,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as donations_24h
      FROM donations WHERE status = 'completed'
    `);

    const transactionResult = await pool.query(`
      SELECT
        COUNT(*) as total_transactions,
        COUNT(DISTINCT beneficiary_id) as unique_beneficiaries,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as transactions_24h
      FROM transactions WHERE status = 'completed'
    `);

    return {
      database: {
        users: {
          total: parseInt(dbResult.rows[0].total_users),
          last24h: parseInt(dbResult.rows[0].users_24h),
          last7d: parseInt(dbResult.rows[0].users_7d)
        },
        donations: {
          total: parseInt(donationResult.rows[0].total_donations),
          totalAmount: parseFloat(donationResult.rows[0].total_amount) || 0,
          last24h: parseInt(donationResult.rows[0].donations_24h)
        },
        transactions: {
          total: parseInt(transactionResult.rows[0].total_transactions),
          uniqueBeneficiaries: parseInt(transactionResult.rows[0].unique_beneficiaries),
          last24h: parseInt(transactionResult.rows[0].transactions_24h)
        }
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    };
  } catch (error) {
    console.error('Metrics collection error:', error);
    return { error: 'Failed to collect metrics' };
  }
}

// Utility functions
function maskConnectionString(url?: string): string {
  if (!url) return 'not configured';

  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port}/${urlObj.pathname}`;
  } catch {
    return 'invalid format';
  }
}

// Dependency health check for startup
export async function checkDependencies(): Promise<{
  allHealthy: boolean;
  issues: string[];
}> => {
  const issues: string[] = [];

  console.log('🔍 Checking service dependencies...');

  // Check database
  const dbHealth = await checkDatabaseHealth();
  if (dbHealth.status !== 'healthy') {
    issues.push(`Database: ${dbHealth.error || 'unhealthy'}`);
  }

  // Check Redis
  const redisHealth = await checkRedisHealth();
  if (redisHealth.status !== 'healthy') {
    issues.push(`Redis: ${redisHealth.error || 'unhealthy'}`);
  }

  // Check Gemini
  const geminiHealth = await checkGeminiHealth();
  if (geminiHealth.status !== 'healthy') {
    issues.push(`Gemini AI: ${geminiHealth.error || 'unhealthy'}`);
  }

  // Check Stripe (if configured)
  if (config.stripeSecretKey) {
    const stripeHealth = await checkStripeHealth();
    if (stripeHealth.status !== 'healthy') {
      issues.push(`Stripe: ${stripeHealth.error || 'unhealthy'}`);
    }
  }

  const allHealthy = issues.length === 0;

  if (allHealthy) {
    console.log('✅ All service dependencies are healthy');
  } else {
    console.error('❌ Service dependency issues found:', issues);
  }

  return { allHealthy, issues };
}

// Graceful shutdown health check
export async function preShutdownHealthCheck(): Promise<boolean> {
  try {
    console.log('🛑 Performing pre-shutdown health check...');

    // Quick check of critical services
    const [dbHealth, redisHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth()
    ]);

    const healthy = dbHealth.status === 'healthy' && redisHealth.status === 'healthy';

    if (healthy) {
      console.log('✅ Pre-shutdown health check passed');
    } else {
      console.log('⚠️ Pre-shutdown health check failed, but proceeding with shutdown');
    }

    return healthy;
  } catch (error) {
    console.error('Pre-shutdown health check error:', error);
    return false;
  }
}


