# SecondWind Backend Dockerfile
FROM node:18-alpine AS base

# Install system dependencies for native modules
RUN apk add --no-cache postgresql-client redis dumb-init ca-certificates tzdata

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# ==========================================
# Development stage
# ==========================================
FROM base AS development

# Install all dependencies for development
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Expose port
EXPOSE 4000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start development server
CMD ["npm", "run", "dev"]

# ==========================================
# Build stage
# ==========================================
FROM base AS build

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# ==========================================
# Production stage
# ==========================================
FROM base AS production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S secondwind -u 1001 && \
    chown -R secondwind:nodejs /app

# Switch to non-root user
USER secondwind

# Expose port
EXPOSE 4000

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 4000,
      path: '/api/health/live',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        process.exit(0);
      } else {
        console.error('Health check failed with status:', res.statusCode);
        process.exit(1);
      }
    });

    req.on('error', (err) => {
      console.error('Health check request failed:', err.message);
      process.exit(1);
    });

    req.on('timeout', () => {
      console.error('Health check timed out');
      req.destroy();
      process.exit(1);
    });

    req.end();
  "

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
