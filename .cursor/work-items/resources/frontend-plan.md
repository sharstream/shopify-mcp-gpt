# Frontend Plan for Shopify MCP Connector

The "frontend" for this project is the conversational interface of the AI assistant (Claude Desktop/Browser). This document describes the intended user workflow.

## User Workflow

1.  **Prerequisite:** The user has the custom MCP server running locally and has successfully connected it as a tool in Claude.

2.  **Step 1: Invocation**
    -   The user initiates the process with a natural language prompt.
    -   **Example Prompt:** *"Busca los últimos carritos abandonados en Shopify."*

3.  **Step 2: Tool Call**
    -   Claude recognizes the intent and determines that the `get_abandoned_checkouts` tool is appropriate.
    -   Claude formats and sends a JSON-RPC request to the local MCP server.

4.  **Step 3: Backend Processing**
    -   Our Node.js server receives the request.
    -   It calls the Shopify Admin API to fetch the data.
    -   It filters and formats the data according to the business logic.
    -   It sends the structured data back to Claude in the JSON-RPC response.

5.  **Step 4: Presentation**
    -   Claude receives the list of abandoned checkouts.
    -   It synthesizes this data into a user-friendly, human-readable format.
    -   **Example Response from Claude:**
        > "¡Claro! Aquí están los 5 carritos abandonados más recientes con mayor valor:
        >
        > 1.  **John Doe** (john.doe@example.com)
        >     -   **Total:** $125.50 USD
        >     -   **Items:** 2x Awesome T-Shirt, 1x Cool Hat
        >     -   **Link de recuperación:** [Ver Checkout](https://store.myshopify.com/...)
        >
        > 2.  **Jane Smith** (jane.smith@example.com)
        >     -   **Total:** $95.00 USD
        >     -   **Items:** 1x Fancy Shoes
        >     -   **Link de recuperación:** [Ver Checkout](https://store.myshopify.com/...)"

## Goal for the MVP

The primary goal is to successfully execute this entire workflow from Step 1 to Step 5. The AI's ability to receive structured data from a custom tool and present it clearly is the key validation for this phase.
