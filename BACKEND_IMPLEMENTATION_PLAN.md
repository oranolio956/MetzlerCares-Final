# SecondWind Backend Implementation Plan
## Comprehensive Architecture & Migration Strategy

**Status:** Planning Phase - No Code Changes Yet  
**Goal:** Transform frontend-only application into enterprise-grade, secure, production-ready backend system

---

## Executive Summary

This document outlines a phased approach to implementing a complete backend infrastructure for SecondWind, a Colorado-based recovery assistance platform. The plan addresses security, compliance (HIPAA, 42 CFR Part 2), scalability, and robustness following industry best practices.

---

## Current State Analysis

### Technology Stack (Frontend)
- **Framework:** React 18.2.0 with TypeScript
- **Build Tool:** Vite 5.1.4
- **Styling:** TailwindCSS 3.4.1
- **State Management:** React Context API
- **AI Integration:** Google Gemini SDK (direct client-side calls - SECURITY RISK)
- **Deployment:** Vercel (static site)

### Mock Implementations Inventory

#### 1. Authentication System
**Location:** `context/StoreContext.tsx` (lines 139-152)
- **Current:** Mock JWT tokens, no real authentication
- **Mock Functions:** `login()`, `logout()`
- **Missing:** Real OAuth (Google/Apple), JWT generation, session management, refresh tokens, MFA

#### 2. Payment Processing
**Location:** `components/PaymentModal.tsx` (lines 16-237)
- **Current:** Simulated payment flow, no real Stripe integration
- **Mock Functions:** Card validation, payment execution
- **Missing:** Stripe API integration, webhook handling, payment intent creation, refund processing, PCI compliance

#### 3. AI Chat Services
**Location:** `services/geminiService.ts` (lines 63-103)
- **Current:** Direct client-side API calls (SECURITY RISK), fallback mock responses
- **Mock Functions:** `sendMessageToGemini()`, `mockBackendResponse()`
- **Missing:** Backend proxy, rate limiting, conversation history storage, session management, cost tracking

#### 4. Voice/Audio Processing
**Location:** `hooks/useGeminiLive.ts` (lines 42-228)
- **Current:** Direct client-side Gemini Live API calls
- **Mock Functions:** None (uses real API but unsafely)
- **Missing:** Backend WebSocket proxy, audio stream encryption, session management

#### 5. Data Persistence
**Location:** `context/StoreContext.tsx` (entire file)
- **Current:** In-memory state only, no persistence
- **Mock Functions:** All state management functions
- **Missing:** Database integration, user profiles, application history, donation records, audit logs

#### 6. Donation Flow
**Location:** `components/DonationFlow.tsx`, `components/DonationModal.tsx`
- **Current:** Client-side state only
- **Mock Functions:** `addDonation()`, transaction ID generation
- **Missing:** Database storage, payment processing, receipt generation, tax document generation

#### 7. Beneficiary Dashboard
**Location:** `components/BeneficiaryDashboard.tsx`
- **Current:** Hardcoded mock data (`DEFAULT_BENEFICIARY`)
- **Mock Functions:** `submitIntakeRequest()`, `verifyInsurance()`
- **Missing:** Real application submission, status tracking, document upload, insurance verification API

#### 8. Donor Dashboard
**Location:** `components/DonorDashboard.tsx`
- **Current:** Mock stats and impact stories
- **Mock Functions:** All data fetching
- **Missing:** Real donation history, impact tracking, portfolio analytics

#### 9. Transparency Ledger
**Location:** `components/TransparencyLedger.tsx`
- **Current:** Hardcoded `MOCK_LEDGER` array
- **Mock Functions:** All transaction data
- **Missing:** Real transaction database, blockchain integration (optional), audit trail, CSV export

#### 10. Partner Flow
**Location:** `components/PartnerFlow.tsx`
- **Current:** Client-side form only, no submission
- **Mock Functions:** `handleSubmit()` with setTimeout
- **Missing:** Application storage, EIN verification, compliance checking, payment processing ($99/mo)

#### 11. Vision Board Image Generation
**Location:** `services/geminiService.ts` (lines 105-114)
- **Current:** Returns placeholder Unsplash image
- **Mock Functions:** `generateVisionImage()`
- **Missing:** Real image generation API, storage, CDN delivery

#### 12. File Uploads
**Location:** `components/BeneficiaryDashboard.tsx` (line 138)
- **Current:** UI only, no actual upload
- **Mock Functions:** None
- **Missing:** File storage (S3/CloudFlare R2), virus scanning, document processing

---

## Security Gaps Identified

### Critical (Must Fix Immediately)
1. **API Keys Exposed:** Gemini API key in client-side code (`process.env.API_KEY`)
2. **No Authentication:** Mock tokens provide no real security
3. **No Input Validation:** Client-side only, easily bypassed
4. **No Rate Limiting:** Vulnerable to abuse
5. **No CORS Protection:** Open to cross-origin attacks
6. **No Data Encryption:** Sensitive data in transit/at rest

### High Priority
7. **No Audit Logging:** Cannot track who did what
8. **No Session Management:** No secure session handling
9. **No CSRF Protection:** Vulnerable to cross-site request forgery
10. **No SQL Injection Protection:** (Will be needed for database)

### Medium Priority
11. **No DDoS Protection:** No rate limiting or throttling
12. **No Content Security Policy:** Missing CSP headers
13. **No Security Headers:** Missing HSTS, X-Frame-Options, etc.

---

## Compliance Requirements

### HIPAA Compliance
- **Requirement:** Encrypt PHI in transit and at rest
- **Current State:** No encryption, no PHI handling infrastructure
- **Needed:** Encryption at rest (database), TLS 1.3, access controls, audit logs

### 42 CFR Part 2 (Substance Use Disorder Records)
- **Requirement:** Strict confidentiality of SUD patient records
- **Current State:** No record keeping system
- **Needed:** Separate encrypted database, access logging, consent management

### PCI-DSS (Payment Card Industry)
- **Requirement:** Secure payment processing
- **Current State:** Mock payment system
- **Needed:** Stripe integration, no card data storage, secure tokenization

### Tax Compliance (501(c)(3))
- **Requirement:** Receipt generation for tax-deductible donations
- **Current State:** Mock receipts
- **Needed:** Automated receipt generation, IRS-compliant format, email delivery

---

## Backend Architecture Plan

### Recommended Tech Stack

#### Backend Framework
- **Primary:** Node.js with Express.js or Fastify
- **Alternative:** Python with FastAPI (better for AI/ML workloads)
- **Recommendation:** Node.js for consistency with frontend team

#### Database
- **Primary:** PostgreSQL 15+ (ACID compliance, JSON support)
- **Caching:** Redis (sessions, rate limiting, real-time data)
- **Search:** PostgreSQL Full-Text Search or Elasticsearch (for partner directory)

#### Authentication
- **OAuth:** Passport.js with Google/Apple strategies
- **JWT:** jsonwebtoken library
- **Session:** Redis-backed sessions

#### Payment Processing
- **Stripe:** Official Stripe Node.js SDK
- **Webhooks:** Stripe webhook signature verification

#### AI Services
- **Proxy:** Express middleware to proxy Gemini API calls
- **Rate Limiting:** express-rate-limit
- **Cost Tracking:** Database logging of API usage

#### File Storage
- **Primary:** AWS S3 or CloudFlare R2
- **CDN:** CloudFlare or AWS CloudFront
- **Virus Scanning:** ClamAV or AWS GuardDuty

#### Monitoring & Logging
- **APM:** Sentry or DataDog
- **Logging:** Winston with structured logging
- **Metrics:** Prometheus + Grafana

#### Infrastructure
- **Hosting:** AWS ECS/Fargate or Railway/Render
- **Database:** AWS RDS PostgreSQL or Supabase
- **CI/CD:** GitHub Actions

---

## Implementation Phases

### Phase 0: Foundation & Setup (Week 1)
**Goal:** Establish development environment and project structure

#### Tasks:
1. **0.1** Initialize backend project structure
   - Create `backend/` directory
   - Set up Node.js/TypeScript project
   - Configure ESLint, Prettier
   - Set up environment variable management (.env.example)

2. **0.2** Database Schema Design
   - Design PostgreSQL schema
   - Create migration system (TypeORM or Prisma)
   - Design tables: users, applications, donations, transactions, partners, sessions

3. **0.3** Development Environment
   - Set up Docker Compose (PostgreSQL, Redis)
   - Configure local development scripts
   - Set up hot-reload development server

4. **0.4** CI/CD Pipeline
   - GitHub Actions workflow
   - Automated testing on PR
   - Deployment pipeline (staging/production)

**Deliverables:**
- Backend project structure
- Database schema documentation
- Local development environment
- CI/CD pipeline

---

### Phase 1: Core Infrastructure (Week 2-3)
**Goal:** Build foundational backend services

#### Phase 1.1: Database Setup (Week 2, Days 1-2)
1. **1.1.1** Database Connection
   - PostgreSQL connection pool
   - Connection retry logic
   - Health check endpoint

2. **1.1.2** User Schema
   - Users table (id, email, name, user_type, created_at, updated_at)
   - Indexes on email, user_type
   - Soft delete support

3. **1.1.3** Session Schema
   - Sessions table (id, user_id, token, expires_at, created_at)
   - Indexes on token, user_id
   - Automatic cleanup job

**Deliverables:**
- Database connection established
- User and session tables created
- Migration scripts

#### Phase 1.2: Authentication Foundation (Week 2, Days 3-5)
1. **1.2.1** OAuth Integration
   - Google OAuth 2.0 setup
   - Apple Sign-In setup
   - OAuth callback handlers
   - User creation on first login

2. **1.2.2** JWT Implementation
   - JWT token generation (access + refresh)
   - Token validation middleware
   - Refresh token rotation
   - Token blacklist (Redis)

3. **1.2.3** Session Management
   - Redis session storage
   - Session middleware
   - Logout endpoint (invalidate tokens)

4. **1.2.4** Security Middleware
   - CORS configuration
   - Helmet.js (security headers)
   - Rate limiting (express-rate-limit)
   - Request validation (express-validator)

**Deliverables:**
- OAuth login working
- JWT authentication flow
- Secure session management
- Security headers configured

#### Phase 1.3: API Structure (Week 3, Days 1-3)
1. **1.3.1** Express App Setup
   - Route structure (/api/v1/*)
   - Error handling middleware
   - Request logging middleware
   - Response formatting

2. **1.3.2** Health & Status Endpoints
   - GET /health (database, Redis, external APIs)
   - GET /status (version, uptime)
   - GET /metrics (for monitoring)

3. **1.3.3** User Endpoints
   - GET /api/v1/users/me (current user)
   - PATCH /api/v1/users/me (update profile)
   - GET /api/v1/users/me/sessions (list active sessions)

**Deliverables:**
- RESTful API structure
- Health monitoring
- User profile endpoints

#### Phase 1.4: Logging & Monitoring (Week 3, Days 4-5)
1. **1.4.1** Structured Logging
   - Winston logger setup
   - Log levels (error, warn, info, debug)
   - Request/response logging
   - Error stack traces

2. **1.4.2** Error Tracking
   - Sentry integration
   - Error reporting middleware
   - Alert configuration

3. **1.4.3** Audit Logging
   - Audit log table
   - Middleware to log all authenticated actions
   - User, action, timestamp, IP address

**Deliverables:**
- Comprehensive logging system
- Error tracking configured
- Audit trail foundation

---

### Phase 2: AI Services Proxy (Week 4-5)
**Goal:** Secure AI API calls through backend

#### Phase 2.1: Gemini Service Proxy (Week 4)
1. **2.1.1** Backend Gemini Client
   - Server-side Gemini SDK setup
   - Environment variable for API key
   - Error handling and retries

2. **2.1.2** Chat Endpoints
   - POST /api/v1/chat/intake (intake chat)
   - POST /api/v1/chat/coach (coach chat)
   - Conversation history storage
   - Session management

3. **2.1.3** Rate Limiting
   - Per-user rate limits
   - Per-IP rate limits
   - Cost tracking per request

4. **2.1.4** Conversation Storage
   - Messages table (id, session_id, role, content, created_at)
   - Ephemeral storage (auto-delete after 30 days for intake)
   - Permanent storage for coach sessions (with consent)

**Deliverables:**
- Secure AI proxy endpoints
- Rate limiting active
- Conversation history stored

#### Phase 2.2: Voice/Audio Proxy (Week 5)
1. **2.2.1** WebSocket Server
   - WebSocket server setup (Socket.io or ws)
   - Authentication for WebSocket connections
   - Room/session management

2. **2.2.2** Audio Stream Proxy
   - Proxy audio to Gemini Live API
   - Stream encryption
   - Session tracking

3. **2.2.3** Audio Storage (Optional)
   - Store audio transcripts (not raw audio)
   - Privacy-compliant storage

**Deliverables:**
- WebSocket server for voice
- Secure audio proxy
- Session management

---

### Phase 3: Payment Processing (Week 6-7)
**Goal:** Real payment processing with Stripe

#### Phase 3.1: Stripe Integration (Week 6)
1. **3.1.1** Stripe Setup
   - Stripe SDK integration
   - Webhook endpoint setup
   - Webhook signature verification

2. **3.1.2** Payment Intent Creation
   - POST /api/v1/payments/create-intent
   - Calculate amounts (donation + fees)
   - Store payment intent in database

3. **3.1.3** Payment Confirmation
   - Webhook handler for payment.succeeded
   - Update donation status
   - Generate receipt

4. **3.1.4** Donation Schema
   - Donations table (id, user_id, amount, impact_type, status, stripe_payment_intent_id, created_at)
   - Transactions table (id, donation_id, amount, vendor, status, created_at)

**Deliverables:**
- Stripe integration complete
- Payment processing working
- Webhook handling

#### Phase 3.2: Receipt & Tax Documents (Week 7)
1. **3.2.1** Receipt Generation
   - PDF generation (PDFKit or Puppeteer)
   - Email delivery (SendGrid or AWS SES)
   - Receipt storage (S3)

2. **3.2.2** Tax Document Generation
   - Annual tax summary (end of year)
   - IRS-compliant format
   - Email delivery

3. **3.2.3** Donation History
   - GET /api/v1/donations (user's donations)
   - GET /api/v1/donations/:id/receipt (download receipt)

**Deliverables:**
- Automated receipt generation
- Tax document system
- Donation history API

---

### Phase 4: Application Management (Week 8-9)
**Goal:** Real application submission and tracking

#### Phase 4.1: Application Schema (Week 8, Days 1-2)
1. **4.1.1** Applications Table
   - Applications table (id, user_id, type, status, details, created_at, updated_at)
   - Application status enum (reviewing, approved, action_needed, funded, rejected)

2. **4.1.2** Application Submission
   - POST /api/v1/applications
   - Validation (required fields, format)
   - Status tracking

3. **4.1.3** Application Updates
   - PATCH /api/v1/applications/:id
   - Status change notifications
   - Admin endpoints for status updates

**Deliverables:**
- Application database schema
- Submission endpoint
- Status tracking

#### Phase 4.2: Document Upload (Week 8, Days 3-5)
1. **4.2.1** File Storage Setup
   - S3 bucket configuration
   - Pre-signed URL generation
   - File upload endpoint

2. **4.2.2** Document Processing
   - Virus scanning (ClamAV or AWS GuardDuty)
   - File type validation
   - Size limits

3. **4.2.3** Document Association
   - Documents table (id, application_id, file_url, file_name, file_type, created_at)
   - Link documents to applications

**Deliverables:**
- File upload working
- Document storage
- Virus scanning

#### Phase 4.3: Insurance Verification (Week 9)
1. **4.3.1** Insurance Status
   - Insurance verification table
   - Status enum (pending, verified, rejected)
   - Verification date tracking

2. **4.3.2** Medicaid API Integration (if available)
   - Research Colorado Medicaid API
   - Integration or manual verification workflow
   - Status update endpoint

3. **4.3.3** Beneficiary Dashboard Data
   - GET /api/v1/beneficiaries/me/dashboard
   - Aggregate application status, days sober, insurance status

**Deliverables:**
- Insurance verification system
- Beneficiary dashboard API
- Status tracking

---

### Phase 5: Transparency Ledger (Week 10)
**Goal:** Real transaction tracking and public ledger

#### Phase 5.1: Transaction System (Week 10, Days 1-3)
1. **5.1.1** Transactions Table
   - Transactions table (id, donation_id, category, amount, vendor, recipient_hash, status, created_at)
   - Indexes on category, status, created_at

2. **5.1.2** Transaction Creation
   - Auto-create transaction on payment success
   - Vendor assignment logic
   - Status tracking (PENDING, CLEARED)

3. **5.1.3** Public Ledger API
   - GET /api/v1/ledger (public, paginated)
   - Filtering by category, date range
   - CSV export endpoint

**Deliverables:**
- Transaction database
- Public ledger API
- CSV export

#### Phase 5.2: Vendor Management (Week 10, Days 4-5)
1. **5.2.1** Vendors Table
   - Vendors table (id, name, category, verified, created_at)
   - Vendor verification workflow

2. **5.2.2** Vendor Assignment
   - Logic to assign vendors to transactions
   - Vendor verification status

**Deliverables:**
- Vendor management system
- Vendor assignment logic

---

### Phase 6: Partner Network (Week 11-12)
**Goal:** Partner application and management system

#### Phase 6.1: Partner Application (Week 11)
1. **6.1.1** Partners Table
   - Partners table (id, name, address, ein, type, bed_count, monthly_rent, compliance_status, created_at)
   - Compliance fields (accepts_mat, has_naloxone, has_insurance, is_rra_member)

2. **6.1.2** Partner Application Endpoint
   - POST /api/v1/partners/apply
   - Multi-step form data storage
   - EIN validation

3. **6.1.3** Compliance Verification
   - Compliance checklist validation
   - Admin review workflow
   - Status tracking (pending, approved, rejected)

**Deliverables:**
- Partner application system
- Compliance tracking
- Application workflow

#### Phase 6.2: Partner Payments (Week 12)
1. **6.2.1** Subscription Management
   - Stripe subscription creation ($99/mo)
   - Subscription status tracking
   - Webhook handling for subscription events

2. **6.2.2** Partner Portal
   - GET /api/v1/partners/me (partner dashboard)
   - Application statistics
   - Payment history

**Deliverables:**
- Subscription system
- Partner portal API

---

### Phase 7: Advanced Features (Week 13-14)
**Goal:** Image generation, analytics, notifications

#### Phase 7.1: Vision Board (Week 13, Days 1-3)
1. **7.1.1** Image Generation Proxy
   - POST /api/v1/vision/generate
   - Proxy to Gemini image generation
   - Rate limiting

2. **7.1.2** Image Storage
   - Store generated images (S3)
   - CDN delivery
   - User's image history

**Deliverables:**
- Image generation API
- Image storage and delivery

#### Phase 7.2: Analytics & Reporting (Week 13, Days 4-5)
1. **7.2.1** Donor Analytics
   - GET /api/v1/donors/me/analytics
   - Total invested, lives impacted, ROI calculations
   - Impact stories aggregation

2. **7.2.2** Admin Analytics
   - Platform-wide statistics
   - User growth, donation trends
   - Application success rates

**Deliverables:**
- Analytics endpoints
- Reporting system

#### Phase 7.3: Notifications (Week 14)
1. **7.3.1** Notification System
   - Notifications table (id, user_id, type, message, read, created_at)
   - Real-time notifications (WebSocket or Server-Sent Events)

2. **7.3.2** Email Notifications
   - Application status updates
   - Payment confirmations
   - Important announcements

**Deliverables:**
- Notification system
- Email notifications

---

### Phase 8: Security Hardening (Week 15)
**Goal:** Comprehensive security audit and hardening

#### Phase 8.1: Security Audit (Week 15, Days 1-2)
1. **8.1.1** Dependency Scanning
   - npm audit
   - Snyk or Dependabot integration
   - Regular updates

2. **8.1.2** Security Headers
   - Helmet.js configuration
   - CSP headers
   - HSTS, X-Frame-Options, etc.

3. **8.1.3** Input Validation
   - All endpoints validated
   - SQL injection prevention
   - XSS prevention

**Deliverables:**
- Security audit report
- All vulnerabilities addressed
- Security headers configured

#### Phase 8.2: Encryption & Compliance (Week 15, Days 3-5)
1. **8.2.1** Data Encryption
   - Encrypt sensitive fields at rest (application details, insurance info)
   - TLS 1.3 for all connections
   - Key management (AWS KMS or similar)

2. **8.2.2** HIPAA Compliance
   - Access controls
   - Audit logging for PHI access
   - Data retention policies

3. **8.2.3** 42 CFR Part 2 Compliance
   - Separate encrypted storage for SUD records
   - Consent management
   - Access restrictions

**Deliverables:**
- Encryption implemented
- Compliance measures in place
- Audit logging active

---

### Phase 9: Testing & Quality Assurance (Week 16)
**Goal:** Comprehensive testing suite

#### Phase 9.1: Unit Tests (Week 16, Days 1-2)
1. **9.1.1** Test Framework Setup
   - Jest or Vitest
   - Test database setup
   - Mock services

2. **9.1.2** Core Function Tests
   - Authentication tests
   - Payment processing tests
   - API endpoint tests

**Deliverables:**
- Unit test suite
- >80% code coverage

#### Phase 9.2: Integration Tests (Week 16, Days 3-4)
1. **9.2.1** API Integration Tests
   - Full request/response cycles
   - Database state validation
   - Error handling tests

2. **9.2.2** End-to-End Tests
   - Critical user flows
   - Payment flow
   - Application submission

**Deliverables:**
- Integration test suite
- E2E test coverage

#### Phase 9.3: Performance Testing (Week 16, Day 5)
1. **9.3.1** Load Testing
   - k6 or Artillery
   - Identify bottlenecks
   - Optimize slow queries

**Deliverables:**
- Performance test results
- Optimization recommendations

---

### Phase 10: Deployment & Monitoring (Week 17)
**Goal:** Production deployment and monitoring

#### Phase 10.1: Production Setup (Week 17, Days 1-3)
1. **10.1.1** Infrastructure
   - Production database (AWS RDS)
   - Redis cluster
   - S3 buckets
   - CDN configuration

2. **10.1.2** Environment Configuration
   - Production environment variables
   - Secrets management (AWS Secrets Manager)
   - Database backups

3. **10.1.3** Deployment
   - Production deployment pipeline
   - Blue-green deployment strategy
   - Rollback procedures

**Deliverables:**
- Production infrastructure
- Deployment pipeline
- Backup system

#### Phase 10.2: Monitoring & Alerts (Week 17, Days 4-5)
1. **10.2.1** Application Monitoring
   - APM setup (Sentry/DataDog)
   - Error tracking
   - Performance monitoring

2. **10.2.2** Infrastructure Monitoring
   - Database monitoring
   - Server health checks
   - Uptime monitoring

3. **10.2.3** Alerting
   - Error rate alerts
   - Performance degradation alerts
   - Security incident alerts

**Deliverables:**
- Monitoring dashboard
- Alert configuration
- Runbook documentation

---

## Database Schema Design

### Core Tables

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('donor', 'beneficiary')),
    oauth_provider VARCHAR(20),
    oauth_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('reviewing', 'approved', 'action_needed', 'funded', 'rejected')),
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Donations
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    impact_type VARCHAR(20) NOT NULL,
    item_label VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions (Ledger)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES donations(id),
    category VARCHAR(20) NOT NULL CHECK (category IN ('RENT', 'TRANSPORT', 'TECH')),
    amount DECIMAL(10,2) NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    recipient_hash VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'CLEARED')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Partners
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    ein VARCHAR(20) UNIQUE,
    type VARCHAR(50),
    bed_count INTEGER,
    monthly_rent DECIMAL(10,2),
    accepts_mat BOOLEAN DEFAULT FALSE,
    has_naloxone BOOLEAN DEFAULT FALSE,
    has_insurance BOOLEAN DEFAULT FALSE,
    is_rra_member BOOLEAN DEFAULT FALSE,
    compliance_status VARCHAR(20) CHECK (compliance_status IN ('pending', 'approved', 'rejected')),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('INTAKE', 'COACH')),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id),
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('success', 'info', 'error')),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoint Specification

### Authentication
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/apple` - Apple Sign-In
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout (invalidate tokens)

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update profile

### Chat
- `POST /api/v1/chat/intake` - Send intake chat message
- `POST /api/v1/chat/coach` - Send coach chat message
- `GET /api/v1/chat/sessions/:id` - Get conversation history
- `DELETE /api/v1/chat/sessions/:id` - Delete session (ephemeral)

### Payments
- `POST /api/v1/payments/create-intent` - Create Stripe payment intent
- `POST /api/v1/payments/webhook` - Stripe webhook handler
- `GET /api/v1/donations` - Get user's donations
- `GET /api/v1/donations/:id/receipt` - Download receipt

### Applications
- `POST /api/v1/applications` - Submit application
- `GET /api/v1/applications` - List user's applications
- `GET /api/v1/applications/:id` - Get application details
- `PATCH /api/v1/applications/:id` - Update application
- `POST /api/v1/applications/:id/documents` - Upload document

### Beneficiaries
- `GET /api/v1/beneficiaries/me/dashboard` - Dashboard data
- `POST /api/v1/beneficiaries/me/insurance/verify` - Verify insurance

### Donors
- `GET /api/v1/donors/me/analytics` - Donor analytics
- `GET /api/v1/donors/me/portfolio` - Impact portfolio

### Partners
- `POST /api/v1/partners/apply` - Submit partner application
- `GET /api/v1/partners/me` - Get partner dashboard
- `GET /api/v1/partners/me/payments` - Payment history

### Ledger
- `GET /api/v1/ledger` - Public transparency ledger (paginated)
- `GET /api/v1/ledger/export` - CSV export

### Vision
- `POST /api/v1/vision/generate` - Generate vision board image
- `GET /api/v1/vision/history` - Get user's generated images

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read

---

## Security Checklist

### Authentication & Authorization
- [ ] OAuth 2.0 implementation (Google, Apple)
- [ ] JWT token generation and validation
- [ ] Refresh token rotation
- [ ] Token blacklist (Redis)
- [ ] Role-based access control (RBAC)
- [ ] Session management
- [ ] Password reset flow (if needed)

### Data Protection
- [ ] TLS 1.3 for all connections
- [ ] Encryption at rest (database)
- [ ] Field-level encryption for sensitive data
- [ ] Key management (AWS KMS)
- [ ] Secure secrets management
- [ ] No sensitive data in logs

### Input Validation
- [ ] All inputs validated and sanitized
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] File upload validation
- [ ] Rate limiting on all endpoints

### Infrastructure Security
- [ ] Security headers (Helmet.js)
- [ ] CORS configuration
- [ ] DDoS protection
- [ ] WAF (Web Application Firewall)
- [ ] Regular security updates
- [ ] Dependency scanning

### Compliance
- [ ] HIPAA compliance measures
- [ ] 42 CFR Part 2 compliance
- [ ] PCI-DSS compliance (via Stripe)
- [ ] Audit logging
- [ ] Data retention policies
- [ ] Privacy policy implementation

---

## Risk Assessment

### High Risk Areas
1. **Payment Processing:** Financial transactions require highest security
2. **PHI Handling:** HIPAA violations carry severe penalties
3. **Authentication:** Compromised auth = full system access
4. **API Keys:** Exposed keys = unauthorized usage and costs

### Mitigation Strategies
1. **Payment:** Use Stripe (PCI-DSS compliant), never store card data
2. **PHI:** Encrypt all health-related data, strict access controls
3. **Authentication:** Multi-factor authentication (future phase)
4. **API Keys:** Server-side only, rotate regularly, use secrets manager

---

## Success Metrics

### Technical Metrics
- API response time < 200ms (p95)
- Uptime > 99.9%
- Zero security incidents
- < 0.1% error rate

### Business Metrics
- Successful payment processing rate > 99%
- Application submission success rate > 95%
- User authentication success rate > 99%

---

## Timeline Summary

- **Weeks 1-3:** Foundation & Core Infrastructure
- **Weeks 4-5:** AI Services Proxy
- **Weeks 6-7:** Payment Processing
- **Weeks 8-9:** Application Management
- **Week 10:** Transparency Ledger
- **Weeks 11-12:** Partner Network
- **Weeks 13-14:** Advanced Features
- **Week 15:** Security Hardening
- **Week 16:** Testing & QA
- **Week 17:** Deployment & Monitoring

**Total Estimated Time:** 17 weeks (4.25 months)

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize phases** based on business needs
3. **Set up development environment** (Phase 0)
4. **Begin Phase 1** (Core Infrastructure)
5. **Regular progress reviews** (weekly)

---

## Notes

- This plan assumes a single developer working full-time
- Adjust timeline based on team size
- Some phases can run in parallel with different developers
- Consider hiring specialists for security audit (Phase 8)
- Regular code reviews required for security-critical code

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Planning Complete - Ready for Implementation
