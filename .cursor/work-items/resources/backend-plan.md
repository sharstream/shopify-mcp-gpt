# Backend Plan for Shopify MCP Connector

This document outlines the plan for building the Node.js server that will power our MCP connector.

## 1. Technology Stack

-   **Runtime:** Node.js (v18 or higher)
-   **Server Framework:** Express.js (for handling HTTP requests and routing)
-   **API Client:** `node-fetch` (for making GraphQL requests to the Shopify Admin API)
-   **Configuration:** `dotenv` (for managing environment variables like API keys securely)

## 2. Project Structure

```
/shopify-mcp-connector
|-- /src
|   |-- server.js           # Main Express server setup
|   |-- mcp_handler.js      # Logic to handle incoming JSON-RPC requests
|   |-- shopify_client.js   # Module for all interactions with Shopify's API
|   `-- tools.js            # Implementation of our custom tools (e.g., get_abandoned_checkouts)
|-- .env                    # (To be created manually) Stores Shopify credentials
|-- .gitignore
`-- package.json
```

## 3. Core Logic: `shopify_client.js`

This will be the heart of the integration.

-   It will contain a function, `fetchFromShopify(query)`, that takes a GraphQL query string.
-   This function will be responsible for:
    -   Reading the `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_ACCESS_TOKEN` from the environment variables.
    -   Constructing the correct Shopify GraphQL endpoint URL.
    -   Adding the necessary `X-Shopify-Access-Token` header.
    -   Executing the POST request using `node-fetch`.
    -   Returning the JSON response from Shopify.
-   Error handling will be implemented to gracefully manage API errors, rate limits, and network issues.

## 4. MCP Request Handling: `mcp_handler.js`

-   This module will receive the raw JSON body from an Express route.
-   It will validate that the request is a valid JSON-RPC call for a tool.
-   It will parse the `params.name` to identify which tool is being requested (e.g., `get_abandoned_checkouts`).
-   It will call the appropriate function from `tools.js`, passing along the `arguments`.
-   It will format the response from the tool into the correct JSON-RPC `result` or `error` structure before sending it back.

## 5. Environment Variables (`.env` file)

The server will require the following variables to be set in a `.env` file for local development:

```
SHOPIFY_STORE_DOMAIN="your-development-store.myshopify.com"
SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
PORT=3000
```
