/**
 * Centralized Tools Configuration
 * Single source of truth for all MCP tools definitions, schemas, and metadata
 */

import {
    getAbandonedCheckouts,
    debugEnvVars,
    getProductCount,
    updateAbandonmentDeliveryStatus,
    sendAbandonmentRecoveryOffer,
    autoProcessAbandonmentRecovery
} from '../../clients/shopify.js';

/**
 * Unified tool definitions with consolidated schemas
 * Contains both function references and schema definitions
 */
export const UNIFIED_TOOLS_CONFIG = {
    'get_abandoned_checkouts': {
        function: getAbandonedCheckouts,
        description: 'Retrieve a list of abandoned checkouts from Shopify',
        parameterMapping: 'positional', // (limit, days_ago)
        schema: {
            type: 'object',
            properties: {
                limit: {
                    type: 'number',
                    description: 'Maximum number of abandoned checkouts to retrieve',
                    default: 10
                },
                days_ago: {
                    type: 'number',
                    description: 'Number of days ago to start the search',
                    default: 7
                }
            },
            required: []
        }
    },

    'debug_env_vars': {
        function: debugEnvVars,
        description: 'Debug and verify environment variables configuration',
        parameterMapping: 'none', // no parameters
        schema: {
            type: 'object',
            properties: {},
            required: []
        }
    },

    'get_product_count': {
        function: getProductCount,
        description: 'Get the total count of products in the Shopify store',
        parameterMapping: 'none', // no parameters
        schema: {
            type: 'object',
            properties: {},
            required: []
        }
    },

    'update_abandonment_delivery_status': {
        function: updateAbandonmentDeliveryStatus,
        description: 'Update the delivery status of an abandoned checkout marketing activity',
        parameterMapping: 'object', // single object parameter
        schema: {
            type: 'object',
            properties: {
                abandonmentId: {
                    type: 'string',
                    description: 'The ID of the abandoned checkout'
                },
                marketingActivityId: {
                    type: 'string',
                    description: 'The ID of the marketing activity'
                },
                deliveryStatus: {
                    type: 'string',
                    description: 'The delivery status (SENT, DELIVERED, etc.)'
                },
                deliveredAt: {
                    type: 'string',
                    description: 'ISO timestamp when delivered'
                },
                deliveryStatusChangeReason: {
                    type: 'string',
                    description: 'Reason for the status change'
                }
            },
            required: ['abandonmentId', 'marketingActivityId', 'deliveryStatus']
        }
    },

    'send_abandonment_recovery_offer': {
        function: sendAbandonmentRecoveryOffer,
        description: 'Send a recovery offer for an abandoned checkout',
        parameterMapping: 'object', // single object parameter
        schema: {
            type: 'object',
            properties: {
                abandonmentId: {
                    type: 'string',
                    description: 'The ID of the abandoned checkout'
                },
                customerId: {
                    type: 'string',
                    description: 'The customer ID'
                },
                customerEmail: {
                    type: 'string',
                    description: 'The customer email address'
                },
                offerType: {
                    type: 'string',
                    description: 'Type of offer (discount, free_shipping, etc.)',
                    default: 'discount'
                },
                discountPercent: {
                    type: 'string',
                    description: 'Discount percentage',
                    default: '10'
                }
            },
            required: ['abandonmentId', 'customerEmail']
        }
    },

    'auto_process_abandonment_recovery': {
        function: autoProcessAbandonmentRecovery,
        description: 'Automatically process abandoned checkout recovery by fetching customer data and sending offer',
        parameterMapping: 'object', // single object parameter
        schema: {
            type: 'object',
            properties: {
                abandonmentId: {
                    type: 'string',
                    description: 'The ID of the abandoned checkout'
                },
                offerType: {
                    type: 'string',
                    description: 'Type of offer (discount, free_shipping, etc.)',
                    default: 'discount'
                },
                discountPercent: {
                    type: 'string',
                    description: 'Discount percentage',
                    default: '10'
                }
            },
            required: ['abandonmentId']
        }
    }
};

/**
 * Get all tool names
 * @returns {string[]} Array of tool names
 */
export function getToolNames() {
    return Object.keys(UNIFIED_TOOLS_CONFIG);
}

/**
 * Get tool configuration
 * @param {string} toolName - Name of the tool
 * @returns {object|null} Tool configuration or null if not found
 */
export function getToolConfig(toolName) {
    return UNIFIED_TOOLS_CONFIG[toolName] || null;
}

/**
 * Check if tool exists
 * @param {string} toolName - Name of the tool
 * @returns {boolean} True if tool exists
 */
export function hasToolConfig(toolName) {
    return toolName in UNIFIED_TOOLS_CONFIG;
}

/**
 * Generate MCP SDK format tools list for tool discovery
 * @returns {array} Tools in MCP SDK format
 */
export function getMcpSdkToolsList() {
    return Object.entries(UNIFIED_TOOLS_CONFIG).map(([name, config]) => ({
        name,
        description: config.description,
        inputSchema: config.schema
    }));
}

/**
 * Generate HTTP format tools list for legacy compatibility
 * @returns {object} Tools in HTTP handler format
 */
export function getHttpToolsList() {
    return {
        tools: Object.entries(UNIFIED_TOOLS_CONFIG).map(([name, config]) => ({
            name,
            description: config.description,
            inputSchema: {
                type: config.schema.type,
                properties: config.schema.properties,
                required: config.schema.required
            }
        }))
    };
}
