-- SecondWind Database Initialization Script
-- Run this script to set up the initial database schema

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('donor', 'beneficiary', 'vendor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('draft', 'reviewing', 'qualified', 'needs_review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create migrations table to track schema changes
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- Users table (base table for all user types)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    profile JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Beneficiaries table
CREATE TABLE IF NOT EXISTS beneficiaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    days_sober INTEGER DEFAULT 0,
    medicaid_status VARCHAR(50) DEFAULT 'none',
    application_status application_status DEFAULT 'draft',
    qualification_score INTEGER DEFAULT 0,
    intake_completed BOOLEAN DEFAULT false,
    intake_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Donors table
CREATE TABLE IF NOT EXISTS donors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_donated NUMERIC(10, 2) DEFAULT 0.00,
    impact_preferences JSONB DEFAULT '{}',
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    vendor_type VARCHAR(50) NOT NULL,
    contact_info JSONB DEFAULT '{}',
    service_area JSONB DEFAULT '{}',
    pricing JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    stripe_account_id VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER REFERENCES donors(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    impact_type VARCHAR(50),
    stripe_charge_id VARCHAR(255) UNIQUE,
    status payment_status DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table (payment distributions)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    donation_id INTEGER REFERENCES donations(id) ON DELETE SET NULL,
    beneficiary_id INTEGER REFERENCES beneficiaries(id) ON DELETE SET NULL,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status payment_status DEFAULT 'pending',
    stripe_transfer_id VARCHAR(255) UNIQUE,
    vendor_name VARCHAR(255),
    recipient_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'INTAKE', 'COACH', 'GLOBAL'
    messages JSONB DEFAULT '[]',
    state JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table (HIPAA compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(255),
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(255),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Emergency access table
CREATE TABLE IF NOT EXISTS emergency_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    approved_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_donors_user_id ON donors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_donation_id ON transactions(donation_id);
CREATE INDEX IF NOT EXISTS idx_transactions_beneficiary_id ON transactions(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Insert initial migration record
INSERT INTO migrations (name) VALUES ('initial_schema')
ON CONFLICT (name) DO NOTHING;

-- Create a default admin user (for development)
-- Password hash for 'admin123' - CHANGE THIS IN PRODUCTION
INSERT INTO users (email, password_hash, role, profile)
VALUES (
    'admin@secondwind.org',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8Gq6G6J6W',
    'admin',
    '{"name": "System Administrator", "phone": null, "location": {"city": "Denver", "state": "CO"}}'
)
ON CONFLICT (email) DO NOTHING;

