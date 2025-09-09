# Deployment Plan for Shopify MCP Connector

This plan covers how to run the MCP server in a local development environment.

## Requirements

-   Node.js (v18 or higher)
-   npm (or a similar package manager)
-   An AI Assistant client that supports custom MCP tools (e.g., Claude Desktop/Browser).

## Local Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd shopify-mcp-connector
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    -   Create a file named `.env` in the root of the project.
    -   Add the necessary Shopify credentials and server port:
        ```
        SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
        SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_your_admin_api_access_token"
        PORT=3000
        ```

4.  **Start the Server:**
    ```bash
    npm start
    ```
    -   The server should now be running locally on `http://localhost:3000`.

5.  **Connect AI Assistant:**
    -   Open your AI Assistant (e.g., Claude Desktop).
    -   Go to the settings for custom tools or MCP servers.
    -   Add a new connection pointing to the local server URL: `http://localhost:3000`.
    -   Once connected, you should be able to invoke the tools (e.g., `get_abandoned_checkouts`) from your chat prompts.
