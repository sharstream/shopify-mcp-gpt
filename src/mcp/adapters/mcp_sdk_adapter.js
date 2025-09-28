/**
 * MCP SDK Adapter for Unified MCP Server
 * Provides MCP SDK interface using the unified core
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { unifiedServer } from '../core/unified_server.js';

/**
 * MCP SDK Server Adapter
 * Uses the unified server core with MCP SDK transport
 */
export class McpSdkServerAdapter {
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
                return await this.unifiedServer.handleToolDiscovery('mcp-sdk');
            } catch (error) {
                throw new Error(`Tool discovery failed: ${error.message}`);
            }
        });

        // Tool execution handler
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;
                return await this.unifiedServer.handleToolExecution(name, args, 'mcp-sdk');
            } catch (error) {
                return this.unifiedServer.formatMcpSdkError(`Tool execution failed: ${error.message}`);
            }
        });
    }

    /**
     * Start the MCP server with stdio transport
     */
    async runMcpServer() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Unified Shopify MCP Server running on stdio');
    }
}

/**
 * Legacy compatibility class name
 * Maintains the same interface as the old ShopifyMcpServer
 */
export class ShopifyMcpServer extends McpSdkServerAdapter {
    constructor() {
        super();
        // Inherits all functionality from McpSdkServerAdapter
    }
}

export default McpSdkServerAdapter;
