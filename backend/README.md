# SecondWind Backend

A comprehensive, enterprise-grade backend platform for SecondWind, a social impact application connecting donors with recovery support services. Features HIPAA-compliant healthcare data handling, secure payment processing, and full observability.

## 🚀 Features

- **🔐 Authentication & Authorization**: Multi-user system with role-based access (Donor, Beneficiary, Vendor, Admin)
- **💳 Payment Processing**: Stripe Connect integration for secure donations and vendor payouts
- **🏥 HIPAA Compliance**: Protected Health Information handling with audit trails
- **📊 Business Logic**: Beneficiary qualification algorithm, impact tracking, transparency ledger
- **🔍 Observability**: OpenTelemetry tracing, Prometheus metrics, comprehensive health checks
- **💾 Database**: PostgreSQL with Redis caching and connection pooling
- **🛡️ Security**: Rate limiting, CORS, helmet security headers, input validation
- **📱 API**: RESTful endpoints with OpenAPI documentation

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   EXPRESS APP   │────│  MIDDLEWARE      │────│   ROUTES        │
│                 │    │  • Observability │    │  • Auth         │
│ • Health Checks │    │  • HIPAA         │    │  • Dashboards   │
│ • Metrics       │    │  • Security      │    │  • Payments     │
│ • Graceful Shut │    │  • Tracing       │    │  • Intake       │
└─────────────────┘    └──────────────────┘    │  • Transparency │
                                               │  • Vendors      │
┌─────────────────┐    ┌──────────────────┐    │  • Webhooks     │
│  DATABASE       │────│  BUSINESS LOGIC  │────│  • Chat         │
│ • PostgreSQL    │    │  • Qualification  │    │  • Images       │
│ • Redis         │    │  • Impact Calc    │    │                 │
│ • Migrations    │    │  • Audit Logging  │    └─────────────────┘
└─────────────────┘    └──────────────────┘
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional, for containerized deployment)

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment template and configure:

```bash
cp .env.template .env
# Edit .env with your configuration
```

Required environment variables:
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/secondwind
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
AUTH_EMAIL=admin@secondwind.org
AUTH_PASSWORD=secure-admin-password

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Payments (optional)
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### 3. Database Setup

Using Docker Compose (recommended):
```bash
docker-compose up -d db redis
npm run db:init  # Initialize schema
```

Or manually:
```bash
createdb secondwind
psql secondwind < scripts/init.sql
```

### 4. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## 🐳 Docker Deployment

### Development with Docker Compose
```bash
# Start all services
docker-compose --profile dev up --build

# Or use the deployment script
./scripts/deploy.sh development
```

### Production Deployment
```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://..."
export REDIS_URL="redis://..."

# Deploy
./scripts/deploy.sh production
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - Get user profile

### Business Logic
- `GET /api/dashboards/donor` - Donor dashboard
- `GET /api/dashboards/beneficiary` - Beneficiary dashboard
- `GET /api/dashboards/vendor` - Vendor dashboard
- `GET /api/dashboards/admin` - Admin dashboard
- `POST /api/intake/qualify` - Beneficiary qualification
- `GET /api/transparency/ledger` - Public transaction ledger

### Payments
- `POST /api/donations` - Create donation
- `POST /api/donations/confirm` - Confirm payment
- `POST /api/vendors/onboard` - Stripe Connect onboarding
- `POST /api/webhooks/stripe` - Stripe webhooks

### AI Services
- `POST /api/chat` - AI-powered chat
- `POST /api/images` - Vision board generation

### Monitoring
- `GET /api/health` - Comprehensive health check
- `GET /api/health/ready` - Kubernetes readiness
- `GET /api/health/live` - Kubernetes liveness
- `GET /api/health/compliance` - HIPAA compliance status
- `GET /api/health/tracing` - Tracing health
- `GET /metrics` - Prometheus metrics

### Documentation
- `GET /api/openapi.json` - OpenAPI specification

## 🔍 Health Checks & Monitoring

### Health Endpoints
- **`/api/health`** - Overall system health with metrics
- **`/api/health/ready`** - Database and Redis connectivity
- **`/api/health/live`** - Process health and memory usage
- **`/api/health/compliance`** - HIPAA compliance status
- **`/api/health/tracing`** - OpenTelemetry health

### Metrics
- **`/metrics`** - Prometheus-compatible metrics
- Business KPIs (donor retention, impact efficiency)
- HTTP request metrics and performance
- Database query performance
- Error rates and tracing

### Logging
- Structured logging with request IDs
- HIPAA-compliant audit trails
- Error tracking with context
- Performance monitoring

## 🏥 HIPAA Compliance

### Data Protection
- PHI encryption at rest and in transit
- Data sanitization on all responses
- Comprehensive audit logging
- Data retention policies

### Security Features
- Emergency access mechanisms
- Compliance monitoring and alerts
- Breach notification procedures
- Regular security assessments

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚀 Production Deployment

### Environment Setup
1. Configure production database and Redis
2. Set secure JWT secrets and API keys
3. Configure SSL/TLS certificates
4. Set up monitoring and alerting
5. Configure backup and disaster recovery

### Scaling Considerations
- Horizontal scaling with load balancer
- Database read replicas
- Redis clustering
- CDN for static assets
- Monitoring and alerting

## 📊 Business Logic

### Beneficiary Qualification Algorithm
- Residency verification (Colorado focus)
- Safety assessment
- Sobriety tracking
- Legal compliance
- Medicaid status
- Income planning

### Impact Tracking
- Real-time donation impact
- Beneficiary success stories
- Geographic distribution
- Service utilization metrics

### Transparency Features
- Public transaction ledger
- Impact calculators
- Success metrics
- Service verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Ensure HIPAA compliance
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**SecondWind Backend** - Building transparent, impactful recovery support through technology.
