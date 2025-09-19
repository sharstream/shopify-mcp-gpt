import { getAbandonedCheckouts, debugEnvVars, getProductCount, updateAbandonmentDeliveryStatus, sendAbandonmentRecoveryOffer, autoProcessAbandonmentRecovery } from '../../clients/shopify.js';
import { validateToolArgs, getAvailableTools } from '../schemas/tool_schema.js';
import { formatSuccessResponse, formatErrorResponse } from '../../utils/api_responses.js';

/**
 * A map of all available tools that the MCP server can execute.
 * The key is the tool name, and the value is the function that implements it.
 */
const TOOLS = {
  'get_abandoned_checkouts': getAbandonedCheckouts,
  'debug_env_vars': debugEnvVars,
  'get_product_count': getProductCount,
  'update_abandonment_delivery_status': updateAbandonmentDeliveryStatus,
  'send_abandonment_recovery_offer': sendAbandonmentRecoveryOffer,
  'auto_process_abandonment_recovery': autoProcessAbandonmentRecovery,
};

/**
 * Handles an incoming MCP request, executes the requested tool, and returns a formatted response.
 * @param {object} requestBody The parsed JSON body of the incoming request.
 * @returns {object} A JSON-RPC 2.0 compliant response object.
 */
export async function handleMcpRequest(requestBody) {
  const { method, params, id } = requestBody;

  // Handle tool discovery requests
  if (method === 'tools/list') {
    return formatSuccessResponse(getAvailableTools(TOOLS), id);
  }

  // Handle tool execution requests
  if (method !== 'tools/call') {
    return formatErrorResponse('Invalid MCP request. Method must be "tools/call" with a "name" parameter, or "tools/list" for discovery.', id);
  }
  
  if (!params || !params.name) {
    return formatErrorResponse('Tool execution requires a "name" parameter.', id);
  }

  const { name, arguments: args } = params;

  const toolFunction = TOOLS[name];
  if (!toolFunction) {
    return formatErrorResponse(`Tool "${name}" not found. Use "tools/list" to see available tools.`, id);
  }

  try {
    // Validate tool arguments before execution
    validateToolArgs(name, args);
    
    let result;
    
    // Handle different tool signatures with specific parameter handling
    switch (name) {
      case 'debug_env_vars':
      case 'get_product_count':
        result = await toolFunction();
        break;
        
      case 'get_abandoned_checkouts':
        result = await toolFunction(args?.limit, args?.days_ago);
        break;
        
      case 'update_abandonment_delivery_status':
        result = await toolFunction({
          abandonmentId: args?.abandonmentId,
          marketingActivityId: args?.marketingActivityId,
          deliveryStatus: args?.deliveryStatus,
          deliveredAt: args?.deliveredAt,
          deliveryStatusChangeReason: args?.deliveryStatusChangeReason,
        });
        break;
        
      case 'send_abandonment_recovery_offer':
        result = await toolFunction({
          abandonmentId: args?.abandonmentId,
          customerId: args?.customerId,
          customerEmail: args?.customerEmail,
          offerType: args?.offerType,
          discountPercent: args?.discountPercent,
        });
        break;
        
      case 'auto_process_abandonment_recovery':
        result = await toolFunction({
          abandonmentId: args?.abandonmentId,
          offerType: args?.offerType,
          discountPercent: args?.discountPercent,
        });
        break;
        
      default:
        result = await toolFunction(args);
        break;
    }
    
    return formatSuccessResponse(result, id);
  } catch (error) {
    return formatErrorResponse(`Error executing tool "${name}": ${error.message}`, id);
  }
}
