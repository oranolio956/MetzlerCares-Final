import { Pool } from 'pg';
import { createClient } from 'redis';

// PostgreSQL connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection with enhanced configuration
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000,
    lazyConnect: true,
    keepAlive: 30000,
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 1000, 5000);
      console.warn(`Redis reconnection attempt ${retries}, delaying ${delay}ms`);
      return delay;
    }
  },
  commandsQueueMaxLength: 1000, // Prevent memory issues
});

// Redis event handlers for monitoring
redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('ready', () => console.log('✅ Redis ready'));
redis.on('error', (err) => console.error('❌ Redis error:', err));
redis.on('end', () => console.log('ℹ️ Redis connection ended'));
redis.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));

// Test connections on startup
export async function initializeDatabase() {
  try {
    // Test PostgreSQL connection
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');

    // Test Redis connection
    await redis.connect();
    console.log('✅ Redis connected');

    // Create tables if they don't exist
    await createTables();
    console.log('✅ Database schema initialized');

  } catch (error) {
    console.warn('⚠️ Database initialization failed, running in degraded mode:', error.message);
    console.warn('⚠️ Some features may not work properly without database connectivity');
    // Don't throw error - allow app to start in degraded mode
  }
}

// Database schema
async function createTables() {
  // First create migrations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const tables = [
    // Users table (extends current single-user auth)
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('donor', 'beneficiary', 'vendor', 'admin')),
      profile JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      last_login_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Beneficiaries table
    `CREATE TABLE IF NOT EXISTS beneficiaries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      days_sober INTEGER DEFAULT 0,
      medicaid_status VARCHAR(50) DEFAULT 'unknown',
      application_status VARCHAR(50) DEFAULT 'draft',
      intake_completed BOOLEAN DEFAULT false,
      qualification_score DECIMAL(3,2),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Donors table
    `CREATE TABLE IF NOT EXISTS donors (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      total_donated DECIMAL(10,2) DEFAULT 0,
      impact_preferences JSONB DEFAULT '[]',
      is_anonymous BOOLEAN DEFAULT false,
      notification_preferences JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Vendors table
    `CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      business_name VARCHAR(255) NOT NULL,
      vendor_type VARCHAR(50) NOT NULL CHECK (vendor_type IN ('housing', 'transport', 'tech')),
      stripe_account_id VARCHAR(255),
      verification_status VARCHAR(50) DEFAULT 'pending',
      service_area JSONB DEFAULT '[]',
      pricing JSONB DEFAULT '{}',
      rating DECIMAL(3,2) DEFAULT 0.0,
      total_transactions INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Donations table
    `CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      donor_id INTEGER REFERENCES users(id),
      amount DECIMAL(10,2) NOT NULL,
      impact_type VARCHAR(50) NOT NULL,
      stripe_payment_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending',
      is_anonymous BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Transactions table (the transparency ledger)
    `CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      donation_id INTEGER REFERENCES donations(id),
      beneficiary_id INTEGER REFERENCES beneficiaries(id),
      vendor_id INTEGER REFERENCES vendors(id),
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      vendor_name VARCHAR(255),
      recipient_hash VARCHAR(255), -- Anonymized beneficiary identifier
      stripe_transfer_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Chat sessions table (extends current in-memory sessions)
    `CREATE TABLE IF NOT EXISTS chat_sessions (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      session_type VARCHAR(50) DEFAULT 'intake',
      messages JSONB DEFAULT '[]',
      state JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Audit log table (HIPAA compliance)
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(50),
      resource_id VARCHAR(255),
      old_values JSONB,
      new_values JSONB,
      ip_address INET,
      user_agent TEXT,
      timestamp TIMESTAMP DEFAULT NOW()
    )`,

    // Emergency access table (HIPAA compliance)
    `CREATE TABLE IF NOT EXISTS emergency_access (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      approved_by VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  ];

  // Execute table creation
  for (const tableQuery of tables) {
    await pool.query(tableQuery);
  }

  // Create indexes for performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
    'CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_donors_user_id ON donors(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_donation_id ON transactions(donation_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_beneficiary_id ON transactions(beneficiary_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON transactions(vendor_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at)'
  ];

  for (const indexQuery of indexes) {
    await pool.query(indexQuery);
  }
}

// Graceful shutdown
export async function closeDatabase() {
  await pool.end();
  await redis.disconnect();
}

// Health check
export async function checkDatabaseHealth() {
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
}

// Database migration helpers
export async function runMigration(migrationName: string, up: () => Promise<void>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if migration already ran
    const result = await client.query(
      'SELECT id FROM migrations WHERE name = $1',
      [migrationName]
    );

    if (result.rows.length > 0) {
      console.log(`Migration ${migrationName} already applied`);
      return;
    }

    // Run migration
    await up();

    // Record migration
    await client.query(
      'INSERT INTO migrations (name, applied_at) VALUES ($1, NOW())',
      [migrationName]
    );

    await client.query('COMMIT');
    console.log(`Migration ${migrationName} applied successfully`);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}