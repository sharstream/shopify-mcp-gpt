# Phase 2: MVP Development Plan - Shopify MCP Connector

## Overview

Phase 2 focuses on building the core functionality for a working **custom MCP (Model Context Protocol) server**. This server will act as a specialized tool that an AI Assistant (like Claude Desktop) can connect to. The primary goal is to empower the AI assistant to retrieve and process abandoned checkout data from a Shopify store, based on the real-world requirements we've discussed.

This phase will deliver a minimum viable product (MVP) that serves as a proof-of-concept for automating abandoned cart recovery.

## Phase 2 Goals

-   ✅ **Develop a local MCP Server:** Create a Node.js server that exposes custom tools for Claude to use.
-   ✅ **Shopify API Integration:** Securely connect to the Shopify Admin API to fetch abandoned checkout data.
-   ✅ **Implement Core Logic:** Implement the "get abandoned checkouts" feature based on the specific business rules (e.g., last 10, within 7 days, sorted by value).
-   ✅ **Claude Desktop/Browser Integration:** Ensure the server can be successfully connected as a tool in the Claude environment.
-   ✅ **Basic Tooling:** Expose at least one functional tool (`get_abandoned_carts`) that Claude can successfully call and receive data from.

## Technical Approach

1.  **Custom MCP Server:** We will build a lightweight Node.js server. This server will listen for JSON-RPC requests from Claude, interpret them, and execute the corresponding logic.
2.  **Shopify Admin API:** The server will use the Shopify Admin API (via GraphQL) to perform its tasks. It will **not** use the Storefront MCP, as our requirements are related to administrative data (abandoned checkouts), not customer-facing shopping actions.
3.  **Client Environment:** The primary testing and execution environment will be **Claude Desktop** or **Claude Browser**, configured to connect to our local MCP server as a custom tool.
4.  **Development Assistance:** We can leverage the **Shopify Dev MCP** server as a helper tool *during development* to ask questions about the Shopify API, validate our GraphQL queries, and get documentation, speeding up the process.

This plan is detailed further in the accompanying documents:
-   `api-specification.md`
-   `backend-plan.md`
-   `database-design.md`
-   `deployment-plan.md`
-   `frontend-plan.md`
-   `testing-strategy.md`
