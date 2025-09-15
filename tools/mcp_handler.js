import { getAbandonedCheckouts, debugEnvVars, getProductCount, updateAbandonmentDeliveryStatus } from '../src/shopify_client.js';

/**
 * A map of all available tools that the MCP server can execute.
 * The key is the tool name, and the value is the function that implements it.
 */
const TOOLS = {
  'get_abandoned_checkouts': getAbandonedCheckouts,
  'debug_env_vars': debugEnvVars,
  'get_product_count': getProductCount,
  'update_abandonment_delivery_status': updateAbandonmentDeliveryStatus,
};

/**
 * Formats a successful response in the JSON-RPC 2.0 format.
 * @param {object} result The data to be returned.
 * @param {string|number} id The ID from the original request.
 * @returns {object} The formatted success response object.
 */
function formatSuccessResponse(result, id) {
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
function formatErrorResponse(message, id) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32603, // Internal error
      message,
    },
  };
}

/**
 * Handles an incoming MCP request, executes the requested tool, and returns a formatted response.
 * @param {object} requestBody The parsed JSON body of the incoming request.
 * @returns {object} A JSON-RPC 2.0 compliant response object.
 */
export async function handleMcpRequest(requestBody) {
  const { method, params, id } = requestBody;

  if (method !== 'tools/call' || !params || !params.name) {
    return formatErrorResponse('Invalid MCP request. Method must be "tools/call" with a "name" parameter.', id);
  }

  const { name, arguments: args } = params;

  const toolFunction = TOOLS[name];
  if (!toolFunction) {
    return formatErrorResponse(`Tool "${name}" not found.`, id);
  }

  try {
    let result;
    
    // Handle different tool signatures
    if (name === 'debug_env_vars') {
      result = await toolFunction();
    } else if (name === 'get_abandoned_checkouts') {
      result = await toolFunction(args?.limit, args?.days_ago);
    } else {
      result = await toolFunction(args);
    }
    
    return formatSuccessResponse(result, id);
  } catch (error) {
    return formatErrorResponse(`Error executing tool "${name}": ${error.message}`, id);
  }
}
