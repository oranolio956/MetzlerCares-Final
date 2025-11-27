#!/bin/bash
set -euo pipefail

# Render API Setup Script
API_KEY=${RENDER_API_KEY:?"RENDER_API_KEY is required"}
API_BASE="https://api.render.com/v1"

if ! command -v jq &> /dev/null; then
  echo "⚠️  jq not found. Install jq for formatted JSON output."
fi

echo "=== Render Backend Setup ==="
echo ""

# Generate secrets
echo "Generating secrets..."
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
ENCRYPTION_SALT=$(openssl rand -hex 32)

echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo "ENCRYPTION_SALT=$ENCRYPTION_SALT"
echo ""

# Create PostgreSQL Database
if [[ -z "${SKIP_POSTGRES:-}" ]]; then
  echo "Creating PostgreSQL database..."
  DB_RESPONSE=$(curl -s -X POST "$API_BASE/databases" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "secondwind-db",
      "databaseName": "secondwind",
      "user": "secondwind_user",
      "plan": "starter",
      "region": "oregon",
      "postgresMajorVersion": 15
    }')

  echo "Database creation response:"
  echo "$DB_RESPONSE" | jq '.' 2>/dev/null || echo "$DB_RESPONSE"
  echo ""
else
  echo "Skipping PostgreSQL creation (SKIP_POSTGRES set)"
fi

# Create Redis
if [[ -z "${SKIP_REDIS:-}" ]]; then
  echo "Creating Redis instance..."
  REDIS_RESPONSE=$(curl -s -X POST "$API_BASE/redis" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "secondwind-redis",
      "plan": "starter",
      "region": "oregon",
      "maxmemoryPolicy": "allkeys-lru"
    }')

  echo "Redis creation response:"
  echo "$REDIS_RESPONSE" | jq '.' 2>/dev/null || echo "$REDIS_RESPONSE"
  echo ""
else
  echo "Skipping Redis creation (SKIP_REDIS set)"
fi

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Note the database connection string from the response above"
echo "2. Note the Redis connection string from the response above"
echo "3. Create web service via Render dashboard or render.yaml"
echo "4. Set environment variables in Render dashboard"
