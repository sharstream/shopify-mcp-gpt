/**
 * HTTP Adapter for Unified MCP Server
 * Converts HTTP requests to use the unified MCP core
 */

import { unifiedServer } from '../core/unified_server.js';

/**
 * Handle HTTP MCP requests
 * Converts HTTP JSON-RPC requests to unified MCP server calls
 * @param {object} requestBody - The HTTP request body (JSON-RPC format)
 * @returns {object} HTTP response in JSON-RPC format
 */
export async function handleHttpMcpRequest(requestBody) {
    try {
        // Use the unified server with HTTP formatting
        return await unifiedServer.handleMcpRequest(requestBody, 'http');
    } catch (error) {
        // Fallback error handling
        return {
            jsonrpc: '2.0',
            id: requestBody?.id || null,
            error: {
                code: -1,
                message: `HTTP MCP Request failed: ${error.message}`
            }
        };
    }
}

/**
 * Legacy compatibility wrapper
 * Maintains the same interface as the old mcp_handler.js
 * @param {object} requestBody - The HTTP request body
 * @returns {object} HTTP response
 */
export async function handleMcpRequest(requestBody) {
    return handleHttpMcpRequest(requestBody);
}

export default {
    handleHttpMcpRequest,
    handleMcpRequest // Legacy compatibility
};
