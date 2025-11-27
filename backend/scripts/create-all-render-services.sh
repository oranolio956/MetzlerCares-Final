#!/bin/bash
set -euo pipefail

# Create all Render services using API
API_KEY=${RENDER_API_KEY:?"RENDER_API_KEY is required"}
OWNER_ID=${RENDER_OWNER_ID:?"RENDER_OWNER_ID is required"}
API_BASE="https://api.render.com/v1"

if ! command -v jq &> /dev/null; then
  echo "⚠️  jq not found. Install jq for formatted JSON output."
fi

echo "=== Creating Render Services ==="
echo ""

# Create PostgreSQL Database Service
echo "1. Creating PostgreSQL Database..."
DB_RESPONSE=$(curl -s -X POST "$API_BASE/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"web_service\",
    \"name\": \"secondwind-db-setup\",
    \"ownerId\": \"$OWNER_ID\",
    \"serviceDetails\": {
      \"env\": \"docker\",
      \"plan\": \"starter\",
      \"region\": \"oregon\"
    }
  }")

echo "Database service response: $DB_RESPONSE"
echo ""

# Note: Databases and Redis might need to be created via dashboard
# Let's create the web service instead
echo "2. Creating Web Service for Backend..."
WEB_RESPONSE=$(curl -s -X POST "$API_BASE/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"web_service\",
    \"name\": \"secondwind-backend\",
    \"ownerId\": \"$OWNER_ID\",
    \"repo\": \"https://github.com/oranolio956/MetzlerCares-Final\",
    \"branch\": \"main\",
    \"rootDir\": \"backend\",
    \"serviceDetails\": {
      \"env\": \"node\",
      \"buildCommand\": \"npm install && npm run build\",
      \"startCommand\": \"npm start\",
      \"plan\": \"starter\",
      \"region\": \"oregon\"
    }
  }")

echo "Web service response:"
echo "$WEB_RESPONSE" | jq '.' 2>/dev/null || echo "$WEB_RESPONSE"
echo ""

echo "=== Service Creation Complete ==="
echo ""
echo "Note: PostgreSQL and Redis need to be created via Render Dashboard"
echo "as they may not be available via API."
echo ""
echo "Next steps:"
echo "1. Create PostgreSQL: Dashboard → New + → PostgreSQL"
echo "2. Create Redis: Dashboard → New + → Redis"
echo "3. Link them to the web service created above"
echo "4. Set environment variables"
