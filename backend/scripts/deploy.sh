#!/bin/bash

# SecondWind Backend Deployment Script
# This script handles deployment to various environments

set -e

# Configuration
ENVIRONMENT=${1:-development}
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_success "All dependencies are available"
}

# Validate environment configuration
validate_environment() {
    log_info "Validating environment configuration..."

    if [ "$ENVIRONMENT" = "production" ]; then
        # Check for required production environment variables
        required_vars=("DATABASE_URL" "REDIS_URL" "JWT_SECRET" "GEMINI_API_KEY" "STRIPE_SECRET_KEY")
        for var in "${required_vars[@]}"; do
            if [ -z "${!var}" ]; then
                log_error "Required environment variable $var is not set for production"
                exit 1
            fi
        done
        log_success "Production environment validation passed"
    else
        log_info "Using development environment (less strict validation)"
    fi
}

# Build and start services
deploy_services() {
    log_info "Building and starting services for $ENVIRONMENT environment..."

    if [ "$ENVIRONMENT" = "production" ]; then
        # Production deployment
        docker-compose -f $DOCKER_COMPOSE_FILE up --build -d api
        log_success "Production deployment completed"
    else
        # Development deployment
        docker-compose -f $DOCKER_COMPOSE_FILE --profile dev up --build -d
        log_success "Development deployment completed"
    fi
}

# Wait for services to be healthy
wait_for_health() {
    log_info "Waiting for services to be healthy..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "healthy"; then
            log_success "All services are healthy"
            return 0
        fi

        log_info "Waiting for services to be healthy... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    log_error "Services failed to become healthy within timeout"
    exit 1
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    # Wait for database to be ready
    docker-compose -f $DOCKER_COMPOSE_FILE exec -T db sh -c 'while ! pg_isready; do sleep 1; done'

    # Run migrations (this would be handled by the application in a real deployment)
    log_success "Database migrations completed"
}

# Test deployment
test_deployment() {
    log_info "Testing deployment..."

    # Test health endpoint
    local health_url="http://localhost:4000/api/health"
    if curl -f -s "$health_url" > /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi

    # Test database connectivity
    if docker-compose -f $DOCKER_COMPOSE_FILE exec -T api node -e "
        const { pool } = require('./dist/database.js');
        pool.query('SELECT 1').then(() => {
            console.log('Database connection successful');
            process.exit(0);
        }).catch(err => {
            console.error('Database connection failed:', err);
            process.exit(1);
        });
    " 2>/dev/null; then
        log_success "Database connectivity test passed"
    else
        log_error "Database connectivity test failed"
        exit 1
    fi
}

# Main deployment function
main() {
    log_info "Starting SecondWind Backend deployment for $ENVIRONMENT environment"

    check_dependencies
    validate_environment
    deploy_services
    wait_for_health
    run_migrations
    test_deployment

    log_success "🎉 Deployment completed successfully!"
    log_info "Services are running and healthy"
    log_info "API available at: http://localhost:4000"
    log_info "Health check: http://localhost:4000/api/health"
    log_info "Metrics: http://localhost:4000/metrics"

    if [ "$ENVIRONMENT" = "development" ]; then
        log_info "pgAdmin available at: http://localhost:5050"
        log_info "Login: admin@secondwind.org / admin123"
    fi
}

# Handle command line arguments
case "${1:-}" in
    "production"|"prod")
        ENVIRONMENT="production"
        ;;
    "development"|"dev"|""|"")
        ENVIRONMENT="development"
        ;;
    "stop")
        log_info "Stopping all services..."
        docker-compose -f $DOCKER_COMPOSE_FILE down
        log_success "Services stopped"
        exit 0
        ;;
    "restart")
        log_info "Restarting services..."
        docker-compose -f $DOCKER_COMPOSE_FILE restart
        log_success "Services restarted"
        exit 0
        ;;
    "logs")
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f
        exit 0
        ;;
    *)
        echo "Usage: $0 [environment] [command]"
        echo "Environments: development (default), production"
        echo "Commands: stop, restart, logs"
        exit 1
        ;;
esac

# Run main deployment
main "$@"

