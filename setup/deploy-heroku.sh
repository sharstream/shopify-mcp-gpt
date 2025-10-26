#!/bin/bash

# Shopify MCP Server - Heroku Deployment Script
# This script automates the deployment process to Heroku

set -e  # Exit on error

echo "🚀 Shopify MCP Server - Heroku Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure we're running from the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}Script location: $SCRIPT_DIR${NC}"
echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"
echo -e "${GREEN}✅ Working from project root${NC}"
echo ""

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI is not installed${NC}"
    echo "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo -e "${GREEN}✅ Heroku CLI found${NC}"

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Heroku${NC}"
    echo "Logging in..."
    heroku login
fi

echo -e "${GREEN}✅ Logged in to Heroku${NC}"
echo ""

# Ask for app name
read -p "Enter your Heroku app name (or press Enter for auto-generated): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo -e "${BLUE}Creating Heroku app with auto-generated name...${NC}"
    heroku create
else
    echo -e "${BLUE}Creating Heroku app: $APP_NAME${NC}"
    heroku create "$APP_NAME"
fi

echo ""
echo -e "${GREEN}✅ App created${NC}"
echo ""

# Get Heroku app info
HEROKU_APP=$(heroku apps:info --json | grep -o '"name":"[^"]*' | cut -d'"' -f4 | head -n 1)
HEROKU_URL="https://${HEROKU_APP}.herokuapp.com"

echo -e "${BLUE}📝 Your app URL: ${YELLOW}$HEROKU_URL${NC}"
echo ""

# Set environment variables
echo -e "${BLUE}🔑 Setting environment variables...${NC}"
echo ""

# Generate MCP API Key
echo "Generating MCP API Key..."
MCP_API_KEY=$(openssl rand -hex 32)
echo -e "${GREEN}Generated: $MCP_API_KEY${NC}"
echo ""

# Prompt for Shopify credentials
echo "Enter your Shopify credentials:"
read -p "Shopify Store Domain (e.g., your-store.myshopify.com): " SHOPIFY_DOMAIN
read -p "Shopify Admin Access Token: " SHOPIFY_TOKEN

# Set config vars
echo ""
echo "Setting Heroku config vars..."
heroku config:set \
  NODE_ENV=production \
  SHOPIFY_STORE_DOMAIN="$SHOPIFY_DOMAIN" \
  SHOPIFY_ADMIN_ACCESS_TOKEN="$SHOPIFY_TOKEN" \
  MCP_API_KEY="$MCP_API_KEY" \
  --app "$HEROKU_APP"

echo ""
echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Deploy to Heroku
echo -e "${BLUE}📤 Deploying to Heroku...${NC}"
echo ""

# Check if git repo exists
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for Heroku deployment"
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Add Heroku remote if not exists
if ! git remote get-url heroku &> /dev/null; then
    heroku git:remote -a "$HEROKU_APP"
fi

# Push to Heroku
echo "Pushing to Heroku..."
git push heroku "$CURRENT_BRANCH:main" --force

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Display summary
echo "=========================================="
echo -e "${BLUE}📋 Deployment Summary${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}App Name:${NC} $HEROKU_APP"
echo -e "${YELLOW}App URL:${NC} $HEROKU_URL"
echo -e "${YELLOW}SSE Endpoint (Recommended):${NC} ${HEROKU_URL}/sse"
echo -e "${YELLOW}HTTP Endpoint (Legacy):${NC} ${HEROKU_URL}/api/mcp"
echo -e "${YELLOW}MCP API Key:${NC} $MCP_API_KEY"
echo ""
echo "=========================================="
echo -e "${BLUE}🔗 Claude Code Configuration${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}Option 1: SSE Transport (Recommended)${NC}"
echo ""
cat << 'EOF'
{
  "mcpServers": {
    "shopify-mcp-remote": {
      "url": "${HEROKU_URL}/sse",
      "transport": {
        "type": "sse"
      },
      "headers": {
        "Authorization": "Bearer ${MCP_API_KEY}"
      }
    }
  }
}
EOF
echo ""
echo "Replace YOUR_HEROKU_URL with: ${GREEN}${HEROKU_URL}${NC}"
echo "Replace YOUR_MCP_API_KEY with: ${GREEN}${MCP_API_KEY}${NC}"
echo ""
echo -e "${YELLOW}Option 2: HTTP Transport (Legacy)${NC}"
echo ""
cat << 'EOF'
{
  "mcpServers": {
    "shopify-mcp-remote": {
      "url": "${HEROKU_URL}/api/mcp",
      "transport": {
        "type": "http"
      },
      "headers": {
        "Authorization": "Bearer ${MCP_API_KEY}",
        "Content-Type": "application/json"
      }
    }
  }
}
EOF
echo ""
echo "Replace YOUR_HEROKU_URL with: ${GREEN}${HEROKU_URL}${NC}"
echo "Replace YOUR_MCP_API_KEY with: ${GREEN}${MCP_API_KEY}${NC}"
echo ""
echo "=========================================="
echo -e "${BLUE}🔧 Useful Commands${NC}"
echo "=========================================="
echo ""
echo "View logs:        heroku logs --tail --app $HEROKU_APP"
echo "Restart app:      heroku restart --app $HEROKU_APP"
echo "Open app:         heroku open --app $HEROKU_APP"
echo "Check status:     heroku ps --app $HEROKU_APP"
echo "Update config:    heroku config --app $HEROKU_APP"
echo ""
echo -e "${GREEN}✅ Save your MCP_API_KEY in a secure location!${NC}"
echo ""
echo -e "${BLUE}🧪 Test your deployment:${NC}"
echo ""
echo "# Test health endpoint (no auth required)"
echo "curl ${HEROKU_URL}/health"
echo ""
echo "# Test server info (no auth required)"
echo "curl ${HEROKU_URL}/api/mcp/info"
echo ""
echo "# Test HTTP/JSON-RPC endpoint"
echo "curl -X POST ${HEROKU_URL}/api/mcp \\"
echo "  -H \"Authorization: Bearer ${MCP_API_KEY}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}'"
echo ""
echo "# Test SSE endpoint (will stream events)"
echo "curl -N -H \"Authorization: Bearer ${MCP_API_KEY}\" ${HEROKU_URL}/sse"
echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
