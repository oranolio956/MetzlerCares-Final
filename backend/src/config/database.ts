import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export const getDatabasePool = (): pg.Pool => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected database pool error:', err);
    });

    // Test connection
    pool.query('SELECT NOW()')
      .then(() => {
        logger.info('Database connection established');
      })
      .catch((err) => {
        logger.error('Database connection failed:', err);
        process.exit(1);
      });
  }

  return pool;
};

export const closeDatabasePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
};

// Health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const dbPool = getDatabasePool();
    await dbPool.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};
