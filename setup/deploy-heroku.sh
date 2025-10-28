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
    # Capture the output and extract app name
    CREATE_OUTPUT=$(heroku create 2>&1)
    echo "$CREATE_OUTPUT"
    HEROKU_APP=$(echo "$CREATE_OUTPUT" | grep -oE "https://[a-z0-9-]+\.herokuapp\.com" | head -n 1 | sed 's/https:\/\///' | sed 's/\.herokuapp\.com//')
else
    echo -e "${BLUE}Creating Heroku app: $APP_NAME${NC}"
    CREATE_OUTPUT=$(heroku create "$APP_NAME" 2>&1)
    echo "$CREATE_OUTPUT"
    HEROKU_APP="$APP_NAME"
fi

echo ""

# Verify app name was captured
if [ -z "$HEROKU_APP" ]; then
    echo -e "${RED}❌ Failed to capture Heroku app name${NC}"
    echo -e "${YELLOW}Trying to detect from git remote...${NC}"
    HEROKU_APP=$(git remote -v | grep heroku | grep fetch | sed 's/.*heroku\.com\///' | sed 's/\.git.*//' | head -n 1)
fi

if [ -z "$HEROKU_APP" ]; then
    echo -e "${RED}❌ Could not determine Heroku app name${NC}"
    echo -e "${YELLOW}Please run: heroku apps${NC}"
    echo -e "${YELLOW}Then re-run this script${NC}"
    exit 1
fi

echo -e "${GREEN}✅ App created: $HEROKU_APP${NC}"
echo ""

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

# TODO Validating JSON Web Token everytime the ApiKey expired
# Creating an ApiKey Criteria for expiration date, minute, clientId, clientSecret, etc.
# Checking other mechanism to validate ApiKey which is going to use in the future
# JsonWebToken, JWT => https://www.jwt.io/

# Prompt for Shopify credentials
echo "Enter your Shopify credentials:"
read -p "Shopify Store Domain (e.g., your-store.myshopify.com): " SHOPIFY_DOMAIN
read -p "Shopify Admin Access Token: " SHOPIFY_TOKEN

# Validate inputs
echo ""
echo "Validating inputs..."
if [ -z "$SHOPIFY_DOMAIN" ]; then
    echo -e "${RED}❌ Shopify Store Domain cannot be empty${NC}"
    exit 1
fi

if [ -z "$SHOPIFY_TOKEN" ]; then
    echo -e "${RED}❌ Shopify Admin Access Token cannot be empty${NC}"
    exit 1
fi

if [ -z "$HEROKU_APP" ]; then
    echo -e "${RED}❌ Heroku app name is not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All inputs validated${NC}"

# Set config vars
echo ""
echo "Setting Heroku config vars for app: ${HEROKU_APP}..."
echo ""

# Set config vars one by one for better error handling
heroku config:set NODE_ENV=production --app "$HEROKU_APP" || { echo -e "${RED}Failed to set NODE_ENV${NC}"; exit 1; }
heroku config:set SHOPIFY_STORE_DOMAIN="$SHOPIFY_DOMAIN" --app "$HEROKU_APP" || { echo -e "${RED}Failed to set SHOPIFY_STORE_DOMAIN${NC}"; exit 1; }
heroku config:set SHOPIFY_ADMIN_ACCESS_TOKEN="$SHOPIFY_TOKEN" --app "$HEROKU_APP" || { echo -e "${RED}Failed to set SHOPIFY_ADMIN_ACCESS_TOKEN${NC}"; exit 1; }
heroku config:set MCP_API_KEY="$MCP_API_KEY" --app "$HEROKU_APP" || { echo -e "${RED}Failed to set MCP_API_KEY${NC}"; exit 1; }

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
