import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { getDatabasePool } from '../src/config/database.js';
import { getRedisClient } from '../src/config/redis.js';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-characters-long';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/secondwind_test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379/1';
process.env.API_VERSION = 'v1';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

// Clean up test database before each test
beforeEach(async () => {
  // Truncate all tables (in a transaction for speed)
  const pool = getDatabasePool();
  try {
    await pool.query('BEGIN');
    
    // Get all table names
    const tables = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT IN ('schema_migrations')
    `);
    
    // Truncate all tables
    for (const table of tables.rows) {
      await pool.query(`TRUNCATE TABLE ${table.tablename} CASCADE`);
    }
    
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    // Ignore errors if tables don't exist yet
  }
});

// Clean up Redis after each test
afterEach(async () => {
  const redis = getRedisClient();
  try {
    await redis.flushDb();
  } catch (error) {
    // Ignore Redis errors in tests
  }
});

// Global cleanup
afterAll(async () => {
  const pool = getDatabasePool();
  const redis = getRedisClient();
  
  try {
    await pool.end();
    await redis.quit();
  } catch (error) {
    // Ignore cleanup errors
  }
});
