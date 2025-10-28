// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import 'dotenv/config'; // Load .env file

import shopify from "../../web/shopify.js";
import productCreator from "../../web/product-creator.js";
import PrivacyWebhookHandlers from "../../web/privacy.js";
import { handleMcpRequest } from "../mcp/adapters/http_adapter.js"; // Unified MCP adapter
import { handleSseRequest } from "../mcp/adapters/sse_adapter.js"; // SSE transport
import { authenticateMCP, rateLimitMCP, generateMCPToken, introspectToken } from "../middleware/auth.js";
import { configureMcpCors, securityHeaders } from "../middleware/cors.js";

const STATIC_PATH =
  process.env.NODE_ENV === "production"
      ? `${process.cwd()}/frontend/dist`
      : `${process.cwd()}/frontend/`;

const app = express();

// Apply global security and CORS middleware
app.use(securityHeaders);
app.use(configureMcpCors);

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
    shopify.config.auth.callbackPath,
    shopify.auth.callback(),
    shopify.redirectToShopifyOrAppRoot()
);
app.post(
    shopify.config.webhooks.path,
    shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// ============================================================================
// MCP ENDPOINTS - Authentication required via Bearer token
// ============================================================================

// Legacy HTTP/JSON-RPC endpoint (for backward compatibility)
app.post("/api/mcp", express.json(), rateLimitMCP, authenticateMCP, async (req, res) => {
    try {
        const response = await handleMcpRequest(req.body);
        res.status(200).json(response);
    } catch (error) {
        console.error('MCP request error:', error);
        res.status(500).json({
            jsonrpc: '2.0',
            id: req.body.id || null,
            error: {
                code: -32603,
                message: error.message
            }
        });
    }
});

// SSE endpoint for remote MCP clients (recommended for Heroku)
app.get("/sse", rateLimitMCP, authenticateMCP, async (req, res) => {
    try {
        await handleSseRequest(req, res);
    } catch (error) {
        console.error('SSE connection error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: {
                    code: 'sse_error',
                    message: error.message
                }
            });
        }
    }
});

// SSE message endpoint (for posting messages to the SSE connection)
app.post("/sse/message", express.json(), rateLimitMCP, authenticateMCP, async (_req, res) => {
    try {
        // The SSE adapter handles message routing
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('SSE message error:', error);
        res.status(500).json({
            error: {
                code: 'message_error',
                message: error.message
            }
        });
    }
});

// Health check endpoint (no authentication required)
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

// JWT Token generation endpoint
// Protected by MCP_API_KEY - requires Bearer token authentication
// This allows users to exchange their long-lived API key for short-lived JWT tokens
app.post("/api/auth/token", express.json(), rateLimitMCP, generateMCPToken);

// JWT Token refresh endpoint (alias for token generation)
// When a token expires, clients can refresh by generating a new token
app.post("/api/auth/refresh", express.json(), rateLimitMCP, generateMCPToken);

// Token introspection endpoint - check token validity and expiration
// No authentication required - the token itself is being validated
app.post("/api/auth/introspect", express.json(), rateLimitMCP, introspectToken);

// MCP server info endpoint (no authentication required)
app.get("/api/mcp/info", (_req, res) => {
    res.status(200).json({
        name: 'shopify-mcp-server',
        version: '1.0.0',
        description: 'Shopify MCP Server with abandoned checkout recovery',
        capabilities: ['tools'],
        transports: ['http', 'sse'],
        endpoints: {
            http: '/api/mcp',
            sse: '/sse',
            health: '/health',
            token: '/api/auth/token',
            refresh: '/api/auth/refresh',
            introspect: '/api/auth/introspect'
        },
        authentication: {
            methods: ['Bearer API Key', 'JWT (MCP)'],
            token_generation: '/api/auth/token (requires Bearer API Key)',
            token_refresh: '/api/auth/refresh (requires Bearer API Key)',
            token_introspection: '/api/auth/introspect (no auth required)'
        },
        documentation: 'https://github.com/yourusername/shopify-chatgpt-mcp'
    });
});

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
    const client = new shopify.api.clients.Graphql({
        session: res.locals.shopify.session
    });

    const countData = await client.request(`
        query shopifyProductCount {
            productsCount {
                count
            }
        }
    `);

    res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
    let status = 200;
    let error = null;

    try {
        await productCreator(res.locals.shopify.session);
    } catch (e) {
        console.log(`Failed to process products/create: ${e.message}`);
        status = 500;
        error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
    return res
        .status(200)
        .set("Content-Type", "text/html")
        .send(
            readFileSync(join(STATIC_PATH, "index.html"))
                .toString()
                .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
        );
});

export default app;
