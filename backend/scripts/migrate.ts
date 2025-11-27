import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDatabasePool } from '../src/config/database.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrationsDir = join(__dirname, '..', 'migrations');

interface Migration {
  filename: string;
  version: number;
}

const getMigrations = (): Migration[] => {
  const files = readdirSync(migrationsDir)
    .filter((filename) => filename.endsWith('.sql'))
    .map((filename) => {
      const match = filename.match(/^(\d+)_/);
      return match
        ? { filename, version: parseInt(match[1], 10) }
        : null;
    })
    .filter((m): m is Migration => m !== null)
    .sort((a, b) => a.version - b.version);

  return files;
};

const createMigrationsTable = async (pool: any) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

const getAppliedMigrations = async (pool: any): Promise<number[]> => {
  const result = await pool.query('SELECT version FROM schema_migrations ORDER BY version');
  return result.rows.map((row: any) => row.version);
};

const applyMigration = async (pool: any, migration: Migration) => {
  const filePath = join(migrationsDir, migration.filename);
  const sql = readFileSync(filePath, 'utf-8');

  logger.info(`Applying migration ${migration.version}: ${migration.filename}`);

  // Execute migration in a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [migration.version]);
    await client.query('COMMIT');
    logger.info(`✓ Migration ${migration.version} applied successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`✗ Migration ${migration.version} failed:`, error);
    throw error;
  } finally {
    client.release();
  }
};

const runMigrations = async () => {
  try {
    const pool = getDatabasePool();
    await createMigrationsTable(pool);

    const migrations = getMigrations();
    const applied = await getAppliedMigrations(pool);

    const pending = migrations.filter((m) => !applied.includes(m.version));

    if (pending.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    logger.info(`Found ${pending.length} pending migration(s)`);

    for (const migration of pending) {
      await applyMigration(pool, migration);
    }

    logger.info('All migrations applied successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
