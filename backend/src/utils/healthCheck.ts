import { checkDatabaseHealth } from '../config/database.js';
import { checkRedisHealth } from '../config/redis.js';
import { getEnv } from '../config/env.js';
import { logger } from './logger.js';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
  };
  version: string;
  uptime: number;
}

export const performHealthCheck = async (): Promise<HealthStatus> => {
  const startTime = Date.now();
  const env = getEnv();

  const [dbHealth, redisHealth] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  const services = {
    database: dbHealth ? 'healthy' as const : 'unhealthy' as const,
    redis: redisHealth ? 'healthy' as const : 'unhealthy' as const,
  };

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (dbHealth && redisHealth) {
    status = 'healthy';
  } else if (dbHealth || redisHealth) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  const uptime = Math.floor((Date.now() - startTime) / 1000);

  return {
    status,
    timestamp: new Date().toISOString(),
    services,
    version: env.API_VERSION,
    uptime: process.uptime(),
  };
};
