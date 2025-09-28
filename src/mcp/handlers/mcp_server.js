import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import {
    getAbandonedCheckouts,
    debugEnvVars,
    getProductCount,
    updateAbandonmentDeliveryStatus,
    sendAbandonmentRecoveryOffer,
    autoProcessAbandonmentRecovery
} from '../../clients/shopify.js';

/**
 * MCP SDK Tool Definitions with detailed schemas
 * These are specifically formatted for the MCP SDK server
 */
const MCP_TOOLS_DEFINITIONS = [
    {
        name: 'get_abandoned_checkouts',
        description: 'Retrieve a list of abandoned checkouts from Shopify',
        inputSchema: {
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
            }
        }
    },
    {
        name: 'debug_env_vars',
        description: 'Debug and verify environment variables configuration',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'get_product_count',
        description: 'Get the total count of products in the Shopify store',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'update_abandonment_delivery_status',
        description: 'Update the delivery status of an abandoned checkout marketing activity',
        inputSchema: {
            type: 'object',
            properties: {
                abandonmentId: {
                    type: 'string',
                    description: 'The ID of the abandoned checkout',
                    required: true
                },
                marketingActivityId: {
                    type: 'string',
                    description: 'The ID of the marketing activity',
                    required: true
                },
                deliveryStatus: {
                    type: 'string',
                    description: 'The delivery status (SENT, DELIVERED, etc.)',
                    required: true
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
    {
        name: 'send_abandonment_recovery_offer',
        description: 'Send a recovery offer for an abandoned checkout',
        inputSchema: {
            type: 'object',
            properties: {
                abandonmentId: {
                    type: 'string',
                    description: 'The ID of the abandoned checkout',
                    required: true
                },
                customerId: {
                    type: 'string',
                    description: 'The customer ID'
                },
                customerEmail: {
                    type: 'string',
                    description: 'The customer email address',
                    required: true
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
    {
        name: 'auto_process_abandonment_recovery',
        description: 'Automatically process abandoned checkout recovery by fetching customer data and sending offer',
        inputSchema: {
            type: 'object',
            properties: {
                abandonmentId: {
                    type: 'string',
                    description: 'The ID of the abandoned checkout',
                    required: true
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
];

/**
 * Unified Shopify MCP Server using the official MCP SDK
 * Handles all MCP tools and communication via the MCP SDK
 */
export class ShopifyMcpServer {
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

        this.setupToolHandlers();
    }

    setupToolHandlers() {
        // Tool discovery - list all available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: MCP_TOOLS_DEFINITIONS
            };
        });

        // Tool execution handler
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                let result;

                switch (name) {
                    case 'get_abandoned_checkouts':
                        result = await getAbandonedCheckouts(args?.limit, args?.days_ago);
                        break;

                    case 'debug_env_vars':
                        result = await debugEnvVars();
                        break;

                    case 'get_product_count':
                        result = await getProductCount();
                        break;

                    case 'update_abandonment_delivery_status':
                        result = await updateAbandonmentDeliveryStatus(args);
                        break;

                    case 'send_abandonment_recovery_offer':
                        result = await sendAbandonmentRecoveryOffer(args);
                        break;

                    case 'auto_process_abandonment_recovery':
                        result = await autoProcessAbandonmentRecovery(args);
                        break;

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                        }
                    ]
                };

            } catch (error) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: `Error executing tool "${name}": ${error.message}`
                        }
                    ]
                };
            }
        });
    }

    async runMcpServer() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Shopify MCP Server running on stdio');
    }
}

export default ShopifyMcpServer;
