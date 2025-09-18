/**
 * API Response Formatting Utilities
 * Handles JSON-RPC 2.0 compliant response formatting for the MCP server
 */

/**
 * Formats a successful response in the JSON-RPC 2.0 format.
 * @param {object} result The data to be returned.
 * @param {string|number} id The ID from the original request.
 * @returns {object} The formatted success response object.
 */
export function formatSuccessResponse(result, id) {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      status: 'success',
      data: result,
    },
  };
}

/**
 * Formats an error response in the JSON-RPC 2.0 format.
 * @param {string} message The error message.
 * @param {string|number} id The ID from the original request.
 * @returns {object} The formatted error response object.
 */
export function formatErrorResponse(message, id) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32603, // Internal error
      message,
    },
  };
}
