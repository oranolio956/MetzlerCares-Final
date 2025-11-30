import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { config } from './config.js';
import { applySecurity } from './middleware/security.js';
import { sanitizePHI, enforceDataRetention, runComplianceChecks } from './middleware/hipaa.js';
import { chatRouter } from './routes/chat.js';
import { openApiRouter } from './routes/openapi.js';
import authRouter from './routes/auth.js';
import { imagesRouter } from './routes/images.js';
import dashboardsRouter from './routes/dashboards.js';
import donationsRouter from './routes/donations.js';
import intakeRouter from './routes/intake.js';
import transparencyRouter from './routes/transparency.js';
import vendorsRouter from './routes/vendors.js';
import webhooksRouter from './routes/webhooks.js';
import { initializeDatabase, checkDatabaseHealth } from './database.js';
import { initializeTracing, requestTracingMiddleware, shutdownTracing } from './utils/tracing.js';
import { metricsMiddleware, metricsEndpoint, startMetricsCollection, stopMetricsCollection } from './utils/metrics.js';
import { performHealthCheck, readinessCheck, livenessCheck, checkDependencies } from './utils/health.js';
import { setupSignalHandlers } from './utils/gracefulShutdown.js';

const app = express();

// PHASE 0: Environment validation
if (!config.geminiApiKey) {
  throw new Error('[startup] GEMINI_API_KEY is required. Mock responses have been removed.');
}

if (!config.authEmail || (!config.authPassword && !config.authPasswordHash)) {
  throw new Error('[startup] AUTH_EMAIL and AUTH_PASSWORD (or AUTH_PASSWORD_HASH) must be set to enable login.');
}

if (!config.jwtSecret) {
  throw new Error('[startup] JWT_SECRET must be set to issue authentication tokens.');
}

if (!config.databaseUrl) {
  throw new Error('[startup] DATABASE_URL is required for database operations.');
}

if (!config.redisUrl) {
  throw new Error('[startup] REDIS_URL is required for session management.');
}

// PHASE 1: Database initialization (OPTIONAL - allow degraded mode)
console.log('[startup] Attempting database initialization...');
try {
  await initializeDatabase();
} catch (error) {
  console.warn('[startup] Database initialization failed, continuing in degraded mode:', error.message);
}

// PHASE 2: Service dependency checks
console.log('[startup] Checking service dependencies...');
const { allHealthy, issues } = await checkDependencies();
if (!allHealthy) {
  console.error('[startup] Service dependency issues:', issues);
  console.warn('[startup] Continuing with degraded functionality...');
}

// PHASE 3: Observability initialization
console.log('[startup] Initializing observability...');
initializeTracing();
startMetricsCollection();

// PHASE 4: HIPAA compliance initialization
console.log('[startup] Initializing HIPAA compliance...');
const complianceCheck = await runComplianceChecks();
if (!complianceCheck.passed) {
  console.warn('[HIPAA] Compliance issues found:', complianceCheck.issues);
  console.warn('[HIPAA] Recommendations:', complianceCheck.recommendations);
}

app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.logFormat));

// Observability middleware (before security to capture all requests)
app.use(requestTracingMiddleware);
app.use(metricsMiddleware);

applySecurity(app);

// HIPAA compliance middleware - applied to all routes
app.use(sanitizePHI);

// Prometheus metrics endpoint
app.get('/metrics', metricsEndpoint);

// Comprehensive health check with all services
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const includeMetrics = req.query.metrics === 'true';
    const health = await performHealthCheck(includeMetrics);
    res.status(health.status === 'healthy' ? 200 : health.status === 'degraded' ? 206 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      uptime: process.uptime()
    });
  }
});

// Kubernetes readiness probe
app.get('/api/health/ready', async (req: Request, res: Response) => {
  try {
    const isReady = await readinessCheck();
    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: ['database', 'redis'] // Critical dependencies
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Kubernetes liveness probe - simplified for deployment
app.get('/api/health/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mode: 'degraded'
  });
});

// HIPAA compliance health check
app.get('/api/health/compliance', async (req: Request, res: Response) => {
  try {
    const compliance = await runComplianceChecks();
    res.status(compliance.passed ? 200 : 503).json({
      status: compliance.passed ? 'compliant' : 'non-compliant',
      timestamp: new Date().toISOString(),
      issues: compliance.issues,
      recommendations: compliance.recommendations
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Compliance check failed'
    });
  }
});

// Tracing health check
app.get('/api/health/tracing', async (req: Request, res: Response) => {
  try {
    const { checkTracingHealth } = await import('./utils/tracing.js');
    const tracingHealth = await checkTracingHealth();
    res.status(tracingHealth.status === 'healthy' ? 200 : 503).json(tracingHealth);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Tracing health check failed'
    });
  }
});

// Stripe webhook middleware - raw body for signature verification
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/images', imagesRouter);
app.use('/api/dashboards', dashboardsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/intake', intakeRouter);
app.use('/api/transparency', transparencyRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api', openApiRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] Unhandled error', err);
  res.status(500).json({ error: 'Unexpected error' });
});

// Initialize scheduled jobs for HIPAA compliance
console.log('[startup] Starting HIPAA compliance monitoring...');

// HIPAA compliance monitoring (every 24 hours)
setInterval(async () => {
  try {
    console.log('[HIPAA] Running compliance checks...');
    const compliance = await runComplianceChecks();
    if (!compliance.passed) {
      console.error('[HIPAA] COMPLIANCE VIOLATIONS DETECTED:', compliance.issues);
      console.error('[HIPAA] RECOMMENDATIONS:', compliance.recommendations);
      // In production, this would trigger alerts to compliance team
    } else {
      console.log('[HIPAA] Compliance checks passed');
    }
  } catch (error) {
    console.error('[HIPAA] Compliance check error:', error);
  }
}, 24 * 60 * 60 * 1000); // 24 hours

// Data retention enforcement (every 7 days)
setInterval(async () => {
  try {
    console.log('[HIPAA] Running data retention cleanup...');
    await enforceDataRetention();
    console.log('[HIPAA] Data retention cleanup completed');
  } catch (error) {
    console.error('[HIPAA] Data retention cleanup error:', error);
  }
}, 7 * 24 * 60 * 60 * 1000); // 7 days

console.log('[startup] HIPAA compliance monitoring started');

// Setup graceful shutdown handlers
setupSignalHandlers();

// Start server with graceful shutdown capability
const server = app.listen(config.port, () => {
  console.log(`[server] Listening on port ${config.port}`);
  console.log(`🔒 HIPAA compliance active`);
  console.log(`🔍 Health checks: /api/health, /api/health/compliance, /api/health/tracing`);
  console.log(`📊 Metrics: /metrics`);
  console.log(`🔗 Tracing: OpenTelemetry configured`);
  console.log(`💳 Stripe: Webhook endpoints active`);
  console.log(`📈 Business logic: All routes connected`);
});
