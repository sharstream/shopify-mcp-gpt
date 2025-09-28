/**
 * Unified MCP Server
 * Central server that handles both HTTP and MCP SDK requests
 */

import { executionEngine } from './execution_engine.js';
import { getMcpSdkToolsList, getHttpToolsList } from '../config/tools_config.js';

/**
 * Unified MCP Server Class
 * Handles tool discovery and execution for both HTTP and MCP SDK transports
 */
export class UnifiedMcpServer {
    constructor() {
        this.executionEngine = executionEngine;
    }

    /**
     * Handle tool discovery requests (tools/list)
     * @param {string} format - Format for the response ('mcp-sdk' or 'http')
     * @returns {object} List of available tools
     */
    async handleToolDiscovery(format = 'mcp-sdk') {
        try {
            if (format === 'mcp-sdk') {
                return {
                    tools: getMcpSdkToolsList()
                };
            } else if (format === 'http') {
                return getHttpToolsList();
            } else {
                throw new Error(`Unknown format: ${format}`);
            }
        } catch (error) {
            throw new Error(`Tool discovery failed: ${error.message}`);
        }
    }

    /**
     * Handle tool execution requests (tools/call)
     * @param {string} toolName - Name of the tool to execute
     * @param {object} args - Arguments for the tool
     * @param {string} format - Response format ('mcp-sdk' or 'http')
     * @returns {object} Tool execution result
     */
    async handleToolExecution(toolName, args = {}, format = 'mcp-sdk') {
        try {
            const result = await this.executionEngine.executeWithValidation(toolName, args);
            
            if (format === 'mcp-sdk') {
                return this.formatMcpSdkResponse(result);
            } else if (format === 'http') {
                return this.formatHttpResponse(result);
            } else {
                throw new Error(`Unknown format: ${format}`);
            }
        } catch (error) {
            if (format === 'mcp-sdk') {
                return this.formatMcpSdkError(error.message);
            } else {
                return this.formatHttpError(error.message);
            }
        }
    }

    /**
     * Handle unified MCP requests
     * @param {object} request - MCP request object
     * @param {string} format - Response format ('mcp-sdk' or 'http')
     * @returns {object} MCP response
     */
    async handleMcpRequest(request, format = 'mcp-sdk') {
        const { method, params, id } = request;

        try {
            // Handle tool discovery
            if (method === 'tools/list') {
                const result = await this.handleToolDiscovery(format);
                return this.wrapResponse(result, id, format);
            }

            // Handle tool execution
            if (method === 'tools/call') {
                if (!params || !params.name) {
                    const error = 'Tool execution requires a "name" parameter';
                    return this.wrapErrorResponse(error, id, format);
                }

                const { name, arguments: args } = params;
                const result = await this.handleToolExecution(name, args, format);
                return this.wrapResponse(result, id, format);
            }

            // Unknown method
            const error = `Invalid MCP request. Method must be "tools/call" or "tools/list"`;
            return this.wrapErrorResponse(error, id, format);

        } catch (error) {
            return this.wrapErrorResponse(error.message, id, format);
        }
    }

    /**
     * Format result for MCP SDK response
     * @param {any} result - Tool execution result
     * @returns {object} MCP SDK formatted response
     */
    formatMcpSdkResponse(result) {
        return {
            content: [
                {
                    type: 'text',
                    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                }
            ]
        };
    }

    /**
     * Format error for MCP SDK response
     * @param {string} errorMessage - Error message
     * @returns {object} MCP SDK formatted error
     */
    formatMcpSdkError(errorMessage) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: errorMessage
                }
            ]
        };
    }

    /**
     * Format result for HTTP response
     * @param {any} result - Tool execution result
     * @returns {object} HTTP formatted response
     */
    formatHttpResponse(result) {
        return {
            success: true,
            data: result
        };
    }

    /**
     * Format error for HTTP response
     * @param {string} errorMessage - Error message
     * @returns {object} HTTP formatted error
     */
    formatHttpError(errorMessage) {
        return {
            success: false,
            error: errorMessage
        };
    }

    /**
     * Wrap response with proper JSON-RPC structure
     * @param {object} result - Response data
     * @param {string|number} id - Request ID
     * @param {string} format - Response format
     * @returns {object} Wrapped response
     */
    wrapResponse(result, id, format) {
        if (format === 'mcp-sdk') {
            return result; // MCP SDK handles wrapping internally
        } else {
            return {
                jsonrpc: '2.0',
                id,
                result
            };
        }
    }

    /**
     * Wrap error response with proper JSON-RPC structure
     * @param {string} errorMessage - Error message
     * @param {string|number} id - Request ID
     * @param {string} format - Response format
     * @returns {object} Wrapped error response
     */
    wrapErrorResponse(errorMessage, id, format) {
        if (format === 'mcp-sdk') {
            return this.formatMcpSdkError(errorMessage);
        } else {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -1,
                    message: errorMessage
                }
            };
        }
    }
}

/**
 * Singleton instance of the unified server
 */
export const unifiedServer = new UnifiedMcpServer();
