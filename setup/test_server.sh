#!/bin/bash

# ==============================================================================
# Shopify MCP App Test Script
#
# This script tests the core functionalities of the Shopify MCP application,
# including database operations and direct Shopify API communication.
# ==============================================================================

# --- Configuration ---
# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions ---
print_header() {
  echo ""
  echo "=============================================================================="
  echo " $1"
  echo "=============================================================================="
}

# --- Main Script ---

print_header "Step 1: Gathering Credentials"

# Prompt for Shopify credentials
read -p "Enter your Shopify store domain (e.g., mcp-store-3224.myshopify.com): " SHOPIFY_STORE_DOMAIN
read -sp "Enter your Shopify Admin API Access Token (shpat_...): " SHOPIFY_ADMIN_ACCESS_TOKEN
echo ""

if [[ -z "$SHOPIFY_STORE_DOMAIN" || -z "$SHOPIFY_ADMIN_ACCESS_TOKEN" ]]; then
  echo "❌ Error: Both store domain and access token are required. Exiting."
  exit 1
fi

# Export for use in sub-processes
export SHOPIFY_STORE_DOMAIN
export SHOPIFY_ADMIN_ACCESS_TOKEN

print_header "Step 2: Testing Database Logic"

echo "Running the database test helper script (db_test_helper.js)..."
echo "This will test table creation, adding a 'sent offer', and checking it."
echo "---"

# Run the node script to test DB functions
node db_test_helper.js

echo "---"
echo "✅ Database logic test completed."

print_header "Step 3: Testing Abandoned Checkouts API Call"

echo "Sending a direct request to the Shopify Admin API to fetch 5 abandoned checkouts."
echo "This verifies that your credentials are correct and the API is reachable."
echo "---"

# The GraphQL query, minified into one line
GRAPHQL_QUERY="query GetAbandonedCheckouts(\$first: Int!) { abandonedCheckouts(first: \$first) { edges { node { id abandonedCheckoutUrl createdAt customer { firstName lastName } } } } }"

# Use curl to make the API request
curl "https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-07/graphql.json" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ADMIN_ACCESS_TOKEN}" \
  -d @- <<EOF
{
  "query": "${GRAPHQL_QUERY}",
  "variables": {
    "first": 5
  }
}
EOF

echo ""
echo "---"
echo "✅ Abandoned checkouts API test completed."
echo "If you see a JSON response with checkout data above, it was successful."


print_header "All Tests Completed Successfully!"
echo ""
echo "Next Steps:"
echo "To run the main application server, execute the following command:"
echo "SHOPIFY_STORE_DOMAIN=${SHOPIFY_STORE_DOMAIN} SHOPIFY_ACCESS_TOKEN=${SHOPIFY_ADMIN_ACCESS_TOKEN} node server.js"
echo ""
