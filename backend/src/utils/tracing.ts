import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, Span, SpanStatusCode } from '@opentelemetry/api';

// Configure resource attributes
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'secondwind-backend',
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'secondwind',
  'environment': process.env.NODE_ENV || 'development',
  'team': 'platform',
  'component': 'api'
});

// Create tracer provider
let tracerProvider: NodeTracerProvider | null = null;

// Initialize OpenTelemetry
export const initializeTracing = () => {
  if (tracerProvider) {
    console.log('Tracing already initialized');
    return tracerProvider;
  }

  tracerProvider = new NodeTracerProvider({
    resource,
    // Sampler configuration - adjust based on load
    sampler: {
      shouldSample: (context, traceId, spanName, spanKind, attributes) => {
        // Sample 100% of errors and high-value operations
        const hasError = attributes?.['error'] === true;
        const isPaymentOperation = spanName.includes('donation') || spanName.includes('payment');
        const isAuthOperation = spanName.includes('auth') || spanName.includes('login');

        if (hasError || isPaymentOperation || isAuthOperation) {
          return { decision: 1 }; // Always sample
        }

        // Sample based on environment
        const sampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 0.5;
        return { decision: Math.random() < sampleRate ? 1 : 0 };
      }
    }
  });

  // Configure exporters based on environment
  const exporters = [];

  // Jaeger exporter (for development and staging)
  if (process.env.JAEGER_ENDPOINT || process.env.NODE_ENV !== 'production') {
    exporters.push(new JaegerExporter({
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    }));
  }

  // Zipkin exporter (for production)
  if (process.env.ZIPKIN_ENDPOINT && process.env.NODE_ENV === 'production') {
    exporters.push(new ZipkinExporter({
      url: process.env.ZIPKIN_ENDPOINT,
    }));
  }

  // Add span processors for each exporter
  exporters.forEach(exporter => {
    tracerProvider!.addSpanProcessor(new SimpleSpanProcessor(exporter));
  });

  // Register the provider
  tracerProvider.register();

  console.log('✅ Distributed tracing initialized with OpenTelemetry');
  console.log(`📊 Tracing exporters: ${exporters.length}`);
  console.log(`🔍 Service: ${resource.attributes['service.name']}`);

  return tracerProvider;
};

// Get tracer instance
export const tracer = trace.getTracer('secondwind-backend', '1.0.0');

// Create custom spans for business logic
export const createSpan = (name: string, attributes?: Record<string, any>): Span => {
  const span = tracer.startSpan(name);

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }

  return span;
};

// Execute function with automatic span creation
export const withSpan = <T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> => {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  });
};

// Business-specific tracing helpers
export const traceDatabaseOperation = (operation: string, table: string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return withSpan(
        `db.${operation}`,
        async (span) => {
          span.setAttributes({
            'db.operation': operation,
            'db.table': table,
            'db.instance': process.env.NODE_ENV
          });
          return method.apply(this, args);
        },
        {
          'db.operation': operation,
          'db.table': table
        }
      );
    };
  };
};

export const traceExternalAPI = (service: string, operation: string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return withSpan(
        `external.${service}.${operation}`,
        async (span) => {
          span.setAttributes({
            'external.service': service,
            'external.operation': operation,
            'external.endpoint': `${service}.${operation}`
          });
          return method.apply(this, args);
        }
      );
    };
  };
};

export const traceBusinessOperation = (operation: string, category: string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return withSpan(
        `business.${category}.${operation}`,
        async (span) => {
          span.setAttributes({
            'business.operation': operation,
            'business.category': category,
            'business.user_type': args[0]?.userType || 'unknown'
          });
          return method.apply(this, args);
        }
      );
    };
  };
};

// Performance monitoring helpers
export const measureExecutionTime = (label: string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const span = createSpan(`perf.${label}`);
      const startTime = Date.now();

      try {
        span.setAttribute('perf.start_time', startTime);
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;

        span.setAttribute('perf.duration_ms', duration);
        span.setAttribute('perf.success', true);

        // Log slow operations
        if (duration > 1000) {
          console.warn(`🐌 Slow operation: ${label} took ${duration}ms`);
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        span.setAttribute('perf.duration_ms', duration);
        span.setAttribute('perf.success', false);
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    };
  };
};

// Request tracing middleware
export const requestTracingMiddleware = (req: any, res: any, next: any) => {
  const span = createSpan(`http.${req.method}`, {
    'http.method': req.method,
    'http.url': req.url,
    'http.user_agent': req.get('User-Agent'),
    'http.remote_ip': req.ip,
    'request.id': req.requestId // From requestId middleware
  });

  // Add span to request for use in route handlers
  req.span = span;

  // End span when response finishes
  res.on('finish', () => {
    span.setAttributes({
      'http.status_code': res.statusCode,
      'http.response_time': Date.now() - span.startTime[0] * 1000
    });

    if (res.statusCode >= 400) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `HTTP ${res.statusCode}`
      });
    }

    span.end();
  });

  next();
};

// Error tracing helper
export const traceError = (error: Error, span?: Span, additionalAttributes?: Record<string, any>) => {
  const activeSpan = span || trace.getActiveSpan();

  if (activeSpan) {
    activeSpan.recordException(error);
    activeSpan.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });

    if (additionalAttributes) {
      Object.entries(additionalAttributes).forEach(([key, value]) => {
        activeSpan.setAttribute(key, value);
      });
    }
  }

  // Also log to console for immediate visibility
  console.error('Traced error:', {
    message: error.message,
    stack: error.stack,
    spanId: activeSpan?.spanContext().spanId,
    traceId: activeSpan?.spanContext().traceId,
    ...additionalAttributes
  });
};

// Health check for tracing
export const checkTracingHealth = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: any;
}> => {
  try {
    // Check if tracer provider is initialized
    if (!tracerProvider) {
      return {
        status: 'unhealthy',
        details: { error: 'Tracing not initialized' }
      };
    }

    // Create a test span
    const testSpan = createSpan('health.check.tracing');
    testSpan.setAttribute('test', true);
    testSpan.end();

    return {
      status: 'healthy',
      details: {
        provider: 'initialized',
        exporters: tracerProvider.getActiveSpanProcessor()?.constructor.name || 'unknown'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: { error: error.message }
    };
  }
};

// Shutdown tracing
export const shutdownTracing = async (): Promise<void> => {
  if (tracerProvider) {
    await tracerProvider.shutdown();
    tracerProvider = null;
    console.log('✅ Tracing shutdown completed');
  }
};


