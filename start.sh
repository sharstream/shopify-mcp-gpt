#!/bin/bash

# Shopify Webhook MCP Server Startup Script
# This script demonstrates how to run the MCP server with proper environment variables

echo "🚀 Starting Shopify Webhook MCP Server"
echo "========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating example..."
    cat > .env << EOF
# Shopify Store Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-admin-api-access-token
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

# Webhook Handler Configuration
PORT=3000

# Optional: For production deployments
NODE_ENV=development

# Optional: For enhanced logging
DEBUG=shopify:*
EOF
    echo "📝 Created .env file. Please edit it with your Shopify credentials."
    echo "📖 Check the README.md for setup instructions."
    exit 1
fi

# Source environment variables
source .env

# Validate required environment variables
if [ -z "$SHOPIFY_STORE_DOMAIN" ] || [ -z "$SHOPIFY_ACCESS_TOKEN" ]; then
    echo "❌ Missing required environment variables:"
    echo "   - SHOPIFY_STORE_DOMAIN"
    echo "   - SHOPIFY_ACCESS_TOKEN"
    echo ""
    echo "💡 Please edit the .env file with your Shopify app credentials."
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🏪 Store Domain: $SHOPIFY_STORE_DOMAIN"
echo "🔑 Access Token: ${SHOPIFY_ACCESS_TOKEN:0:10}..."
echo ""

# Start the MCP server
echo "🎯 Starting MCP Server..."
node server.js
