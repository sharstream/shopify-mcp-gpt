# Testing Strategy for Shopify MCP Connector

This document outlines the testing approach for ensuring the reliability and correctness of the MVP.

## 1. Unit Testing

-   **Target:** `shopify_client.js` module.
-   **Goal:** Verify that the core connection logic to Shopify's API is working correctly.
-   **Method:**
    -   Use a testing framework like **Jest** or **Vitest**.
    -   **Mock `node-fetch`:** We will not make actual API calls to Shopify during unit tests. Instead, we'll mock the `fetch` function to return predefined successful responses and error responses.
    -   **Tests Cases:**
        -   Test that the correct GraphQL endpoint is constructed.
        -   Test that the `X-Shopify-Access-Token` header is correctly added.
        -   Test that the GraphQL query is passed in the request body.
        -   Test that a successful JSON response is parsed and returned correctly.
        -   Test that the function handles Shopify API errors (e.g., 4xx, 5xx status codes) gracefully.

## 2. Integration Testing

-   **Target:** The full request-response flow from the MCP server's endpoint to the Shopify API.
-   **Goal:** Verify that the MCP server can receive a request, process it, interact with the *actual* Shopify API, and return a correctly formatted response.
-   **Method:**
    -   Create test scripts (using Jest or just plain Node.js scripts) that send a valid JSON-RPC request to our running local server (e.g., `http://localhost:3000`).
    -   These tests will require **real, valid Shopify development store credentials** to be present in the `.env` file.
    -   **Test Cases:**
        -   Send a request for `get_abandoned_checkouts`.
        -   Assert that the response has a `200 OK` status.
        -   Assert that the response body is a valid JSON-RPC response.
        -   Assert that the `result.data` is an array and contains checkout objects with the expected structure.

## 3. Manual / End-to-End (E2E) Testing

-   **Target:** The entire workflow, including the AI Assistant client.
-   **Goal:** Verify the complete user experience from prompt to final answer.
-   **Method:**
    -   Follow the steps outlined in the `deployment-plan.md` to run the server.
    -   Connect Claude Desktop/Browser to the local server.
    -   Execute a series of natural language prompts to test the tool.
    -   **Test Cases (Prompts):**
        -   *"dame los carritos abandonados"*
        -   *"get abandoned checkouts"*
        -   *"enséñame 3 carritos abandonados"* (testing the `limit` parameter)
        -   *"hay carritos abandonados de hace 2 días?"* (testing the `days_ago` parameter)
    -   Verify that Claude's responses are accurate and well-formatted based on the data returned by the tool.
