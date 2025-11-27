#!/bin/bash

# Render Service Creation Script
# This script helps create services via Render API

API_KEY="rnd_E6GGs6PzdUy5aLU4wfWpKTyJh0uE"
API_BASE="https://api.render.com/v1"

echo "=== Render Service Creation ==="
echo ""
echo "This script will help you create services on Render."
echo "Note: Some services may need to be created via the dashboard."
echo ""

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found. Install it for better JSON formatting: sudo apt-get install jq"
    JQ_CMD="cat"
else
    JQ_CMD="jq '.'"
fi

# List existing services
echo "📋 Existing services:"
curl -s -X GET "$API_BASE/services" \
  -H "Authorization: Bearer $API_KEY" | $JQ_CMD | head -20

echo ""
echo "=== Next Steps ==="
echo ""
echo "1. Create PostgreSQL Database:"
echo "   - Go to: https://dashboard.render.com"
echo "   - Click 'New +' → 'PostgreSQL'"
echo "   - Name: secondwind-db"
echo "   - Database: secondwind"
echo "   - User: secondwind_user"
echo "   - Region: Oregon"
echo "   - Plan: Starter"
echo ""
echo "2. Create Redis:"
echo "   - Go to: https://dashboard.render.com"
echo "   - Click 'New +' → 'Redis'"
echo "   - Name: secondwind-redis"
echo "   - Region: Oregon"
echo "   - Plan: Starter"
echo ""
echo "3. Create Web Service:"
echo "   - Go to: https://dashboard.render.com"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your Git repository"
echo "   - Root Directory: backend"
echo "   - Build: npm install && npm run build"
echo "   - Start: npm start"
echo ""
echo "4. Set Environment Variables:"
echo "   - See .render.env.example for all required variables"
echo "   - Copy values to Render Dashboard → Environment tab"
echo ""
echo "5. Link Services:"
echo "   - Link database to web service (DATABASE_URL auto-set)"
echo "   - Link Redis to web service (REDIS_URL auto-set)"
echo ""
echo "✅ Setup complete! See RENDER_SETUP.md for detailed instructions."
