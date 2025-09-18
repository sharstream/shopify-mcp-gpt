/**
 * Tool Schema Management Module
 * Handles tool validation and discovery for the MCP server
 */

/**
 * Schema definitions for tool parameter validation.
 * Defines required and optional parameters for each tool.
 */
export const TOOL_SCHEMAS = {
  'get_abandoned_checkouts': {
    required: [],
    optional: ['limit', 'days_ago'],
    description: 'Retrieves abandoned checkouts with optional limit and time filters'
  },
  'debug_env_vars': {
    required: [],
    optional: [],
    description: 'Returns debug information about environment variables and configuration'
  },
  'get_product_count': {
    required: [],
    optional: [],
    description: 'Returns the total number of products in the Shopify store'
  },
  'update_abandonment_delivery_status': {
    required: ['abandonmentId', 'marketingActivityId', 'deliveryStatus'],
    optional: ['deliveredAt', 'deliveryStatusChangeReason'],
    description: 'Updates the delivery status of a marketing activity for an abandoned checkout'
  },
  'send_abandonment_recovery_offer': {
    required: ['abandonmentId', 'customerId', 'customerEmail'],
    optional: ['offerType', 'discountPercent'],
    description: 'Sends a complete abandonment recovery offer by creating a marketing activity'
  },
  'auto_process_abandonment_recovery': {
    required: ['abandonmentId'],
    optional: ['offerType', 'discountPercent'],
    description: 'Automatically processes an abandoned checkout recovery by fetching customer data'
  },
};

/**
 * Validates tool arguments against the defined schema.
 * @param {string} toolName The name of the tool to validate.
 * @param {object} args The arguments to validate.
 * @throws {Error} If validation fails.
 */
export function validateToolArgs(toolName, args = {}) {
  const schema = TOOL_SCHEMAS[toolName];
  if (!schema) {
    return; // No schema defined, skip validation
  }

  // Check required parameters
  for (const field of schema.required) {
    if (args[field] === undefined || args[field] === null || args[field] === '') {
      throw new Error(`Missing required parameter: ${field}`);
    }
  }
}

/**
 * Handles tool discovery requests (tools/list method).
 * @param {object} tools The TOOLS object containing all available tools.
 * @returns {object} List of available tools with their schemas.
 */
export function getAvailableTools(tools) {
  return {
    tools: Object.keys(tools).map(name => ({
      name,
      description: TOOL_SCHEMAS[name]?.description || 'No description available',
      inputSchema: {
        type: 'object',
        properties: {
          ...(TOOL_SCHEMAS[name]?.required?.reduce((acc, field) => {
            acc[field] = { type: 'string', required: true };
            return acc;
          }, {}) || {}),
          ...(TOOL_SCHEMAS[name]?.optional?.reduce((acc, field) => {
            acc[field] = { type: 'string', required: false };
            return acc;
          }, {}) || {}),
        },
        required: TOOL_SCHEMAS[name]?.required || [],
      },
    })),
  };
}

/**
 * Utility function to get schema for a specific tool.
 * @param {string} toolName The name of the tool.
 * @returns {object|null} The schema object or null if not found.
 */
export function getToolSchema(toolName) {
  return TOOL_SCHEMAS[toolName] || null;
}

/**
 * Utility function to check if a tool exists in the schema.
 * @param {string} toolName The name of the tool.
 * @returns {boolean} True if the tool has a schema definition.
 */
export function hasToolSchema(toolName) {
  return toolName in TOOL_SCHEMAS;
}
