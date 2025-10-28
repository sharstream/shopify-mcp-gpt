/**
 * SSE Transport Adapter for Remote MCP Access
 * Enables Server-Sent Events transport for Claude Code and other MCP clients
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { unifiedServer } from '../core/unified_server.js';

/**
 * SSE Server Adapter for MCP
 * Handles SSE connections for remote clients
 */
export class SseServerAdapter {
    constructor() {
        this.server = new Server(
            {
                name: 'shopify-mcp-server',
                version: '1.0.0'
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        this.unifiedServer = unifiedServer;
        this.setupHandlers();
    }

    /**
     * Setup MCP SDK request handlers using the unified server
     */
    setupHandlers() {
        // Tool discovery handler
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            try {
                return await this.unifiedServer.handleToolDiscovery('mcp-sse');
            } catch (error) {
                throw new Error(`Tool discovery failed: ${error.message}`);
            }
        });

        // Tool execution handler
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;
                return await this.unifiedServer.handleToolExecution(name, args, 'mcp-sse');
            } catch (error) {
                return this.unifiedServer.formatMcpSdkError(`Tool execution failed: ${error.message}`);
            }
        });
    }

    /**
     * Create SSE transport for a client connection
     * @param {import('express').Request} req - Express request
     * @param {import('express').Response} res - Express response
     */
    async createTransport(req, res) {
        try {
            // Set SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');

            // For Heroku, prevent request timeout
            res.setHeader('X-Request-Timeout', '0');

            // Create SSE transport
            const transport = new SSEServerTransport('/message', res);

            // Connect server to transport
            await this.server.connect(transport);

            console.log('✅ SSE client connected');

            // Handle client disconnect
            req.on('close', () => {
                console.log('🔌 SSE client disconnected');
            });

            // Handle errors
            req.on('error', (error) => {
                console.error('❌ SSE connection error:', error);
            });

            return transport;
        } catch (error) {
            console.error('Failed to create SSE transport:', error);
            throw error;
        }
    }

    /**
     * Handle incoming SSE messages
     * @param {import('express').Request} req - Express request
     * @param {import('express').Response} res - Express response
     */
    async handleSseConnection(req, res) {
        try {
            const transport = await this.createTransport(req, res);

            // Handle POST messages to /message endpoint
            if (req.method === 'POST' && req.path.endsWith('/message')) {
                try {
                    const message = req.body;
                    await transport.handlePostMessage(message);
                } catch (error) {
                    console.error('Error handling SSE message:', error);
                    res.status(400).json({
                        error: {
                            code: 'invalid_message',
                            message: error.message
                        }
                    });
                }
            }
        } catch (error) {
            console.error('SSE connection error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: {
                        code: 'connection_error',
                        message: error.message
                    }
                });
            }
        }
    }
}

// Singleton instance for SSE adapter
let sseAdapterInstance = null;

/**
 * Get or create SSE adapter instance
 */
export function getSseAdapter() {
    if (!sseAdapterInstance) {
        sseAdapterInstance = new SseServerAdapter();
    }
    return sseAdapterInstance;
}

/**
 * Handle SSE endpoint requests
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 */
export async function handleSseRequest(req, res) {
    const adapter = getSseAdapter();
    await adapter.handleSseConnection(req, res);
}
