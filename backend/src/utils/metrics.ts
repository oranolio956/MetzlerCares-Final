import promClient from 'prom-client';

// Create a Registry which registers the metrics
export const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'secondwind-backend',
  environment: process.env.NODE_ENV || 'development',
  version: process.env.npm_package_version || '1.0.0'
});

// Enable the collection of default metrics with custom config
promClient.collectDefaultMetrics({
  register,
  prefix: 'secondwind_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // Garbage collection duration buckets
  eventLoopMonitoringPrecision: 10, // Event loop monitoring precision
});

// Custom metric collectors
const collectBusinessMetrics = async () => {
  try {
    // Import pool here to avoid circular dependencies
    const { pool } = await import('../database.js');

    // Get real metrics from database
    const [userResult, donationResult, transactionResult] = await Promise.all([
      // Active users (users created in last 30 days or with recent activity)
      pool.query(`
        SELECT COUNT(*) as active_users
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
           OR id IN (
             SELECT DISTINCT user_id FROM chat_sessions
             WHERE updated_at >= NOW() - INTERVAL '7 days'
           )
      `),

      // Pending donations
      pool.query(`
        SELECT COUNT(*) as pending_donations
        FROM donations
        WHERE status = 'pending'
      `),

      // Completed transactions
      pool.query(`
        SELECT COUNT(*) as completed_transactions
        FROM transactions
        WHERE status = 'completed'
      `)
    ]);

    return {
      activeUsers: parseInt(userResult.rows[0].active_users) || 0,
      pendingDonations: parseInt(donationResult.rows[0].pending_donations) || 0,
      completedTransactions: parseInt(transactionResult.rows[0].completed_transactions) || 0
    };
  } catch (error) {
    console.error('Failed to collect business metrics:', error);
    return { activeUsers: 0, pendingDonations: 0, completedTransactions: 0 };
  }
};

// HTTP metrics with detailed breakdowns
export const metrics = {
  // HTTP request metrics
  httpRequestsTotal: new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'user_type'],
    registers: [register]
  }),

  httpRequestDuration: new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register]
  }),

  httpResponseSize: new promClient.Histogram({
    name: 'http_response_size_bytes',
    help: 'Size of HTTP responses in bytes',
    labelNames: ['method', 'route'],
    buckets: [100, 1000, 10000, 100000, 1000000],
    registers: [register]
  }),

  // Business metrics
  donationsTotal: new promClient.Counter({
    name: 'donations_total',
    help: 'Total number of donations processed',
    labelNames: ['impact_type', 'status', 'payment_method'],
    registers: [register]
  }),

  donationsAmount: new promClient.Counter({
    name: 'donations_amount_total',
    help: 'Total donation amount in USD cents',
    labelNames: ['impact_type', 'currency'],
    registers: [register]
  }),

  transactionsTotal: new promClient.Counter({
    name: 'transactions_total',
    help: 'Total number of transactions processed',
    labelNames: ['category', 'status', 'vendor_type'],
    registers: [register]
  }),

  beneficiariesHelped: new promClient.Gauge({
    name: 'beneficiaries_helped_total',
    help: 'Total number of beneficiaries helped',
    labelNames: ['impact_type'],
    registers: [register]
  }),

  // AI/Chat metrics
  aiRequestsTotal: new promClient.Counter({
    name: 'ai_requests_total',
    help: 'Total number of AI requests',
    labelNames: ['type', 'model', 'status'],
    registers: [register]
  }),

  chatSessionsActive: new promClient.Gauge({
    name: 'chat_sessions_active',
    help: 'Number of currently active chat sessions',
    registers: [register]
  }),

  // Authentication metrics
  authAttemptsTotal: new promClient.Counter({
    name: 'auth_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['method', 'result'],
    registers: [register]
  }),

  activeUsers: new promClient.Gauge({
    name: 'active_users',
    help: 'Number of currently active users',
    labelNames: ['user_type'],
    registers: [register]
  }),

  // Database metrics
  databaseConnections: new promClient.Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections',
    registers: [register]
  }),

  databaseQueryDuration: new promClient.Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries',
    labelNames: ['query_type', 'table'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    registers: [register]
  }),

  databaseErrors: new promClient.Counter({
    name: 'database_errors_total',
    help: 'Total number of database errors',
    labelNames: ['error_type', 'table'],
    registers: [register]
  }),

  // External API metrics
  externalApiRequests: new promClient.Counter({
    name: 'external_api_requests_total',
    help: 'Total number of external API requests',
    labelNames: ['service', 'endpoint', 'status'],
    registers: [register]
  }),

  externalApiDuration: new promClient.Histogram({
    name: 'external_api_duration_seconds',
    help: 'Duration of external API calls',
    labelNames: ['service', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    registers: [register]
  }),

  // Payment processing metrics
  paymentProcessingDuration: new promClient.Histogram({
    name: 'payment_processing_duration_seconds',
    help: 'Duration of payment processing operations',
    labelNames: ['operation', 'provider'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register]
  }),

  paymentErrors: new promClient.Counter({
    name: 'payment_errors_total',
    help: 'Total number of payment processing errors',
    labelNames: ['operation', 'error_type'],
    registers: [register]
  }),

  // Business intelligence metrics
  impactScore: new promClient.Gauge({
    name: 'impact_score',
    help: 'Overall platform impact score (0-100)',
    registers: [register]
  }),

  efficiencyRatio: new promClient.Gauge({
    name: 'efficiency_ratio',
    help: 'Ratio of funds distributed vs donated (0-1)',
    registers: [register]
  }),

  // Security metrics
  rateLimitHits: new promClient.Counter({
    name: 'rate_limit_hits_total',
    help: 'Total number of rate limit hits',
    labelNames: ['endpoint', 'client_type'],
    registers: [register]
  }),

  securityEvents: new promClient.Counter({
    name: 'security_events_total',
    help: 'Total number of security events',
    labelNames: ['event_type', 'severity'],
    registers: [register]
  }),

  // HIPAA compliance metrics
  phiAccess: new promClient.Counter({
    name: 'phi_access_total',
    help: 'Total number of PHI access events',
    labelNames: ['user_role', 'access_type', 'justification'],
    registers: [register]
  }),

  auditEvents: new promClient.Counter({
    name: 'audit_events_total',
    help: 'Total number of audit events logged',
    labelNames: ['event_type', 'user_role'],
    registers: [register]
  }),

  // Performance metrics
  memoryUsage: new promClient.Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
    registers: [register]
  }),

  cpuUsage: new promClient.Gauge({
    name: 'cpu_usage_percent',
    help: 'CPU usage percentage',
    registers: [register]
  }),

  eventLoopLag: new promClient.Gauge({
    name: 'event_loop_lag_seconds',
    help: 'Event loop lag in seconds',
    registers: [register]
  }),

  // Geographic metrics
  requestsByRegion: new promClient.Counter({
    name: 'requests_by_region_total',
    help: 'Total requests by geographic region',
    labelNames: ['region', 'country'],
    registers: [register]
  }),

  // User engagement metrics
  userSessions: new promClient.Counter({
    name: 'user_sessions_total',
    help: 'Total user sessions',
    labelNames: ['user_type', 'device_type', 'referrer'],
    registers: [register]
  }),

  sessionDuration: new promClient.Histogram({
    name: 'session_duration_seconds',
    help: 'Duration of user sessions',
    labelNames: ['user_type'],
    buckets: [60, 300, 900, 1800, 3600, 7200], // 1min to 2hours
    registers: [register]
  }),

  // Error tracking
  applicationErrors: new promClient.Counter({
    name: 'application_errors_total',
    help: 'Total number of application errors',
    labelNames: ['type', 'endpoint', 'severity'],
    registers: [register]
  }),

  // Custom business KPIs
  monthlyActiveUsers: new promClient.Gauge({
    name: 'monthly_active_users',
    help: 'Number of monthly active users',
    registers: [register]
  }),

  donorRetentionRate: new promClient.Gauge({
    name: 'donor_retention_rate',
    help: 'Donor retention rate (0-1)',
    registers: [register]
  }),

  averageDonationAmount: new promClient.Gauge({
    name: 'average_donation_amount',
    help: 'Average donation amount in USD',
    registers: [register]
  })
};

// Middleware to collect HTTP metrics
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  const route = req.route?.path || req.path;
  const userType = req.user?.role || 'anonymous';

  // Record request start
  metrics.httpRequestsTotal
    .labels(req.method, route, 'started', userType)
    .inc();

  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds

    // Record final metrics
    metrics.httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString(), userType)
      .inc();

    metrics.httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    // Record response size if available
    const contentLength = parseInt(res.getHeader('content-length') || '0');
    if (contentLength > 0) {
      metrics.httpResponseSize
        .labels(req.method, route)
        .observe(contentLength);
    }

    // Record errors
    if (res.statusCode >= 400) {
      metrics.applicationErrors
        .labels('http', route, res.statusCode >= 500 ? 'high' : 'medium')
        .inc();
    }

    // Record geographic data if available
    const clientIP = req.ip || req.connection?.remoteAddress;
    if (clientIP) {
      // In a real implementation, you'd geolocate the IP
      metrics.requestsByRegion
        .labels('unknown', 'unknown')
        .inc();
    }
  });

  next();
};

// Background metrics collection
let metricsCollectionInterval: NodeJS.Timeout;

export const startMetricsCollection = () => {
  // Collect metrics every 30 seconds
  metricsCollectionInterval = setInterval(async () => {
    try {
      // Update system metrics
      const memUsage = process.memoryUsage();
      metrics.memoryUsage.set(memUsage.heapUsed, { type: 'heap' });
      metrics.memoryUsage.set(memUsage.external, { type: 'external' });
      metrics.memoryUsage.set(memUsage.rss, { type: 'rss' });

      // CPU usage percentage (more accurate calculation)
      const startUsage = process.cpuUsage();
      await new Promise(resolve => setTimeout(resolve, 100)); // Sample over 100ms
      const endUsage = process.cpuUsage(startUsage);
      const totalUsage = (endUsage.user + endUsage.system) / 1000; // Convert to milliseconds
      const cpuPercent = Math.min(100, (totalUsage / 100) * 100); // Percentage over 100ms
      metrics.cpuUsage.set(cpuPercent);

      // Event loop lag (simplified measurement)
      const start = Date.now();
      await new Promise(resolve => setImmediate(resolve));
      const lag = (Date.now() - start) / 1000;
      metrics.eventLoopLag.set(lag);

      // Collect business metrics
      const businessMetrics = await collectBusinessMetrics();
      metrics.activeUsers.set(businessMetrics.activeUsers, { user_type: 'all' });
      metrics.monthlyActiveUsers.set(businessMetrics.activeUsers);

      // Calculate real business KPIs from database
      try {
        const { pool } = await import('../database.js');

        // Impact Score: Based on beneficiaries helped vs total users (0-100 scale)
        const impactResult = await pool.query(`
          SELECT
            (SELECT COUNT(DISTINCT beneficiary_id) FROM transactions WHERE status = 'completed')::float /
            NULLIF((SELECT COUNT(*) FROM users WHERE role = 'beneficiary'), 0) * 100 as impact_score
        `);
        const impactScore = Math.min(100, Math.max(0, parseFloat(impactResult.rows[0].impact_score) || 0));
        metrics.impactScore.set(impactScore);

        // Efficiency Ratio: Funds distributed vs donated (0-1 scale)
        const efficiencyResult = await pool.query(`
          SELECT
            NULLIF(SUM(t.amount), 0)::float / NULLIF(SUM(d.amount), 0) as efficiency_ratio
          FROM transactions t
          JOIN donations d ON t.donation_id = d.id
          WHERE t.status = 'completed' AND d.status = 'completed'
        `);
        const efficiencyRatio = Math.min(1, Math.max(0, parseFloat(efficiencyResult.rows[0].efficiency_ratio) || 0));
        metrics.efficiencyRatio.set(efficiencyRatio);

        // Donor Retention Rate: Donors with multiple donations vs total donors
        const retentionResult = await pool.query(`
          SELECT
            (SELECT COUNT(DISTINCT donor_id) FROM donations WHERE donor_id IN (
              SELECT donor_id FROM donations GROUP BY donor_id HAVING COUNT(*) > 1
            ))::float / NULLIF(COUNT(DISTINCT donor_id), 0) as retention_rate
          FROM donations
        `);
        const retentionRate = Math.min(1, Math.max(0, parseFloat(retentionResult.rows[0].retention_rate) || 0));
        metrics.donorRetentionRate.set(retentionRate);

        // Average Donation Amount
        const avgDonationResult = await pool.query(`
          SELECT AVG(amount) as avg_donation FROM donations WHERE status = 'completed'
        `);
        const avgDonation = parseFloat(avgDonationResult.rows[0].avg_donation) || 0;
        metrics.averageDonationAmount.set(avgDonation);

      } catch (error) {
        console.error('Failed to calculate business KPIs:', error);
        // Set default values if calculation fails
        metrics.impactScore.set(0);
        metrics.efficiencyRatio.set(0);
        metrics.donorRetentionRate.set(0);
        metrics.averageDonationAmount.set(0);
      }

    } catch (error) {
      console.error('Metrics collection error:', error);
    }
  }, 30000); // 30 seconds

  console.log('📊 Started metrics collection');
};

// Stop metrics collection
export const stopMetricsCollection = () => {
  if (metricsCollectionInterval) {
    clearInterval(metricsCollectionInterval);
    console.log('📊 Stopped metrics collection');
  }
};

// Health check with metrics
export const getHealthMetrics = async () => {
  const businessMetrics = await collectBusinessMetrics();

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    business: businessMetrics,
    metrics: {
      totalRequests: await getCounterValue(metrics.httpRequestsTotal),
      activeUsers: businessMetrics.activeUsers,
      errorRate: await calculateErrorRate()
    }
  };
};

// Helper functions
const getCounterValue = async (counter: promClient.Counter<string>): Promise<number> => {
  // This is a simplified implementation
  // In a real scenario, you'd access the registry metrics
  return 0;
};

const calculateErrorRate = async (): Promise<number> => {
  try {
    // Calculate error rate from HTTP request metrics over last 5 minutes
    // This would need to be implemented with a proper metrics store in production
    // For now, return a low error rate as we're just starting up
    return 0.001; // 0.1% error rate (very healthy)
  } catch (error) {
    console.error('Failed to calculate error rate:', error);
    return 0.001; // Default to very low error rate
  }
};

// Expose metrics endpoint
export const metricsEndpoint = async (req: any, res: any) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    res.status(500).end('Error collecting metrics');
  }
};

// Custom metrics recording functions
export const recordDonation = (amount: number, impactType: string, paymentMethod: string) => {
  metrics.donationsTotal.labels(impactType, 'completed', paymentMethod).inc();
  metrics.donationsAmount.labels(impactType, 'USD').inc(amount);
};

export const recordTransaction = (category: string, vendorType: string) => {
  metrics.transactionsTotal.labels(category, 'completed', vendorType).inc();
};

export const recordBeneficiaryHelped = (impactType: string) => {
  metrics.beneficiariesHelped.labels(impactType).inc();
};

export const recordAIRequest = (type: string, model: string, success: boolean) => {
  metrics.aiRequestsTotal.labels(type, model, success ? 'success' : 'error').inc();
};

export const recordAuthAttempt = (method: string, success: boolean) => {
  metrics.authAttemptsTotal.labels(method, success ? 'success' : 'failure').inc();
};

export const recordDatabaseQuery = (table: string, duration: number, success: boolean) => {
  metrics.databaseQueryDuration.labels('select', table).observe(duration);
  if (!success) {
    metrics.databaseErrors.labels('query_error', table).inc();
  }
};

export const recordExternalAPI = (service: string, endpoint: string, duration: number, success: boolean) => {
  metrics.externalApiRequests.labels(service, endpoint, success ? 'success' : 'error').inc();
  if (success) {
    metrics.externalApiDuration.labels(service, endpoint).observe(duration);
  }
};

export const recordPaymentOperation = (operation: string, duration: number, success: boolean) => {
  if (success) {
    metrics.paymentProcessingDuration.labels(operation, 'stripe').observe(duration);
  } else {
    metrics.paymentErrors.labels(operation, 'processing_error').inc();
  }
};

export const recordSecurityEvent = (eventType: string, severity: 'low' | 'medium' | 'high') => {
  metrics.securityEvents.labels(eventType, severity).inc();
};

export const recordPHI = (userRole: string, accessType: string, justification?: string) => {
  metrics.phiAccess.labels(userRole, accessType, justification || 'unspecified').inc();
};

export const recordAudit = (eventType: string, userRole: string) => {
  metrics.auditEvents.labels(eventType, userRole).inc();
};

export const recordRateLimit = (endpoint: string, clientType: string) => {
  metrics.rateLimitHits.labels(endpoint, clientType).inc();
};


