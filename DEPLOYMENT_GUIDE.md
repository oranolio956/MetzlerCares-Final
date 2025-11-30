# SecondWind Backend - Deployment Guide

## 🎯 Deployment Overview

This guide covers the complete deployment process for the SecondWind backend, from development setup to production launch.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.0 or higher
- **PostgreSQL**: 15.0 or higher
- **Redis**: 7.0 or higher
- **Docker**: 20.10 or higher (optional but recommended)
- **Docker Compose**: 2.0 or higher (optional but recommended)

### Required Accounts & Services
- **PostgreSQL Database** (local or cloud)
- **Redis Instance** (local or cloud)
- **Gemini AI API Key** (Google AI Studio)
- **Stripe Account** (for payment processing)
- **Domain & SSL Certificate** (for production)

## 🚀 Quick Start Deployment

### Option 1: Docker Compose (Recommended)

1. **Clone and navigate to backend:**
   ```bash
   cd MetzlerCares-final/backend
   ```

2. **Configure environment:**
   ```bash
   cp .env.template .env
   # Edit .env with your API keys and database URLs
   ```

3. **Deploy with one command:**
   ```bash
   ./scripts/deploy.sh development
   ```

4. **Verify deployment:**
   ```bash
   curl http://localhost:4000/api/health
   ```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL:**
   ```bash
   createdb secondwind
   psql secondwind < scripts/init.sql
   ```

3. **Configure environment:**
   ```bash
   cp .env.template .env
   # Edit with your configuration
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## 🔧 Environment Configuration

### Required Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/secondwind
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-32-character-secure-random-key
AUTH_EMAIL=admin@secondwind.org
AUTH_PASSWORD=secure-admin-password

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Optional: Payment Processing
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Optional: Server Configuration
PORT=4000
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different secrets** for each environment
3. **Rotate JWT secrets** regularly
4. **Use strong passwords** and secure key generation
5. **Enable SSL/TLS** in production

## 🐳 Docker Deployment

### Development Environment

```bash
# Start all services
docker-compose --profile dev up --build

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Production Environment

```bash
# Set production environment
export NODE_ENV=production
export DATABASE_URL="postgresql://prod-db-url"
export REDIS_URL="redis://prod-redis-url"

# Deploy
./scripts/deploy.sh production

# Check health
curl https://yourdomain.com/api/health
```

### Docker Services

- **api**: SecondWind backend (port 4000)
- **db**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **pgadmin**: Database admin interface (port 5050, dev only)

## 🏥 Health Checks & Monitoring

### Health Endpoints

- **`/api/health`** - Complete system health with metrics
- **`/api/health/ready`** - Database connectivity (Kubernetes readiness)
- **`/api/health/live`** - Process health (Kubernetes liveness)
- **`/api/health/compliance`** - HIPAA compliance status
- **`/api/health/tracing`** - OpenTelemetry health

### Monitoring Setup

1. **Prometheus Metrics:**
   ```
   GET /metrics
   ```

2. **Grafana Dashboard:**
   - Import Prometheus data source
   - Create dashboards for business KPIs

3. **Distributed Tracing:**
   - Jaeger UI: `http://localhost:16686`
   - Zipkin UI: Configure endpoint in environment

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Obtain SSL certificate** (Let's Encrypt recommended)
2. **Configure reverse proxy** (nginx/Caddy)
3. **Update CORS origins** for production domain

### HIPAA Compliance

- PHI data is automatically encrypted
- Audit logs track all data access
- Data retention policies are enforced
- Emergency access mechanisms available

## 📊 Database Setup

### Schema Initialization

The database schema is automatically created when the application starts. The `scripts/init.sql` file includes:

- User management tables
- Beneficiary qualification tracking
- Donation and transaction records
- Audit logging tables
- Performance indexes

### Backup Strategy

```bash
# Automated backup (add to cron)
pg_dump secondwind > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql secondwind < backup_file.sql
```

## 🔄 API Testing

### Basic Health Check

```bash
curl http://localhost:4000/api/health
```

### Authentication Test

```bash
# Register a user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"donor"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Business Logic Test

```bash
# Get donor dashboard (requires auth token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:4000/api/dashboards/donor
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```
   Solution: Ensure PostgreSQL is running and credentials are correct

2. **Redis Connection Failed**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:6379
   ```
   Solution: Start Redis service or check Redis URL

3. **JWT Secret Not Set**
   ```
   Error: JWT_SECRET must be set
   ```
   Solution: Set a secure JWT secret in environment variables

4. **Port Already in Use**
   ```
   Error: listen EADDRINUSE: address already in use :::4000
   ```
   Solution: Change PORT environment variable or free the port

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

### Logs Access

```bash
# Docker logs
docker-compose logs -f api

# Application logs (if not using Docker)
tail -f logs/app.log
```

## 📈 Scaling & Performance

### Horizontal Scaling

1. **Load Balancer**: Place nginx/Caddy in front of multiple instances
2. **Session Storage**: Ensure Redis is shared across instances
3. **Database**: Use connection pooling and read replicas
4. **File Storage**: Use cloud storage (AWS S3, Cloudflare R2) for uploads

### Performance Monitoring

- Response times < 200ms target
- Database queries < 50ms
- Memory usage < 512MB per instance
- Error rate < 1%

## 🌐 Production Deployment Checklist

### Infrastructure
- [ ] Domain and SSL certificate configured
- [ ] Load balancer or reverse proxy set up
- [ ] Database backups automated
- [ ] Monitoring and alerting configured
- [ ] CDN for static assets (if applicable)

### Security
- [ ] SSL/TLS enabled (A+ rating)
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Environment variables secured
- [ ] Access controls implemented

### Monitoring
- [ ] Health checks passing
- [ ] Metrics collection active
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Log aggregation set up

### Business Logic
- [ ] Payment processing tested
- [ ] User registration/login working
- [ ] Dashboard data accurate
- [ ] Qualification algorithm functioning
- [ ] Transparency ledger updating

## 🎯 Go-Live Process

### Pre-Launch (1 week before)
1. Full end-to-end testing
2. Load testing with realistic traffic
3. Security audit and penetration testing
4. Performance optimization
5. Documentation updates

### Launch Day
1. Deploy to staging environment
2. Run final integration tests
3. Deploy to production
4. Monitor closely for 24 hours
5. Gradual traffic ramp-up

### Post-Launch (First week)
1. Monitor error rates and performance
2. User feedback collection
3. Bug fixes and hotfixes as needed
4. Performance optimizations
5. Feature usage analytics

## 📞 Support & Maintenance

### Regular Maintenance
- **Daily**: Monitor health checks and error rates
- **Weekly**: Review audit logs and compliance status
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Performance reviews and scaling assessments

### Emergency Contacts
- Database issues: Check connection strings and credentials
- Payment failures: Verify Stripe webhook configuration
- Performance issues: Review metrics and scaling needs
- Security incidents: Follow HIPAA breach notification procedures

---

**Ready to deploy SecondWind and start making an impact! 🚀**

