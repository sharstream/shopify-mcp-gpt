#!/usr/bin/env node

import 'dotenv/config';
import { createServer } from 'http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import app from './src/api/index.js';
import { initializeDatabase } from './db/database.js';
import {
    getAbandonedCheckouts,
    debugEnvVars,
    getProductCount,
    updateAbandonmentDeliveryStatus,
    sendAbandonmentRecoveryOffer,
    autoProcessAbandonmentRecovery
} from './src/clients/shopify.js';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '3000', 10);

/**
 * Unified Shopify MCP Server using the official MCP SDK
 */
class ShopifyMcpServer {
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
                tools: [
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
                ]
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

/**
 * Initialize the database and start servers based on mode
 */
async function startServers() {
    try {
        // Initialize database first
        await initializeDatabase();
        console.log('Database initialized successfully.');

        // Check if we should run in MCP mode (stdio)
        const isMcpMode = process.env.MCP_MODE === 'true' || process.argv.includes('--mcp');

        if (isMcpMode) {
            console.log('🔗 Starting Shopify MCP Server (stdio mode)...');
            const mcpServer = new ShopifyMcpServer();
            await mcpServer.runMcpServer();
            return; // Don't start HTTP server in MCP mode
        }

        // Start HTTP server (development/hybrid mode)
        console.log('🚀 Starting Express HTTP server...');
        const server = createServer(app);

        server.listen(PORT, () => {
            console.log(`Express server running on port ${PORT}`);
            console.log(`📊 API Endpoints:`);
            console.log(`   - POST /api/mcp (MCP tools via HTTP)`);
            console.log(`   - GET  /api/products/count`);
            console.log(`   - POST /api/products`);
            console.log(`💬 MCP Server: Available via HTTP API`);
            console.log(`🏪 Shopify Integration: Active`);
            console.log(`\n💡 To run in pure MCP mode: MCP_MODE=true node server.js`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
                process.exit(1);
            }
            console.error('❌ Server error:', error);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Gracefully shutting down...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start servers:', error);
        process.exit(1);
    }
}

// Export the server class for use in other modules
export { ShopifyMcpServer };

// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startServers();
}
