#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP Server for Shopify Webhook Management
 * Allows ChatGPT to create, manage, and monitor Shopify webhooks
 */

class ShopifyWebhookMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'shopify-webhook-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!this.shopifyDomain || !this.accessToken) {
      throw new Error('SHOPIFY_STORE_DOMAIN and SHOPIFY_ACCESS_TOKEN environment variables are required');
    }

    this.setupToolHandlers();
  }

  async makeShopifyRequest(query, variables = {}) {
    const url = `https://${this.shopifyDomain}/admin/api/2025-07/graphql.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_webhook_subscription',
          description: 'Create a new webhook subscription for a specific topic',
          inputSchema: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                description: 'Webhook topic (e.g., ORDERS_CREATE, PRODUCTS_UPDATE)',
                enum: [
                  'ORDERS_CREATE', 'ORDERS_UPDATE', 'ORDERS_DELETE', 'ORDERS_PAID',
                  'PRODUCTS_CREATE', 'PRODUCTS_UPDATE', 'PRODUCTS_DELETE',
                  'CUSTOMERS_CREATE', 'CUSTOMERS_UPDATE', 'CUSTOMERS_DELETE',
                  'APP_UNINSTALLED', 'APP_SUBSCRIPTIONS_UPDATE'
                ]
              },
              callbackUrl: {
                type: 'string',
                description: 'HTTPS URL where webhooks will be sent'
              },
              format: {
                type: 'string',
                description: 'Response format',
                enum: ['JSON', 'XML'],
                default: 'JSON'
              },
              includeFields: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific fields to include in webhook payload'
              }
            },
            required: ['topic', 'callbackUrl']
          }
        },
        {
          name: 'list_webhook_subscriptions',
          description: 'List all current webhook subscriptions',
          inputSchema: {
            type: 'object',
            properties: {
              first: {
                type: 'number',
                description: 'Number of subscriptions to retrieve (max 250)',
                default: 10
              }
            }
          }
        },
        {
          name: 'delete_webhook_subscription',
          description: 'Delete a webhook subscription by ID',
          inputSchema: {
            type: 'object',
            properties: {
              subscriptionId: {
                type: 'string',
                description: 'The ID of the webhook subscription to delete'
              }
            },
            required: ['subscriptionId']
          }
        },
        {
          name: 'create_pubsub_webhook',
          description: 'Create a Google Cloud Pub/Sub webhook subscription',
          inputSchema: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                description: 'Webhook topic'
              },
              pubSubProject: {
                type: 'string',
                description: 'Google Cloud Project ID'
              },
              pubSubTopic: {
                type: 'string',
                description: 'Pub/Sub topic name'
              }
            },
            required: ['topic', 'pubSubProject', 'pubSubTopic']
          }
        },
        {
          name: 'validate_webhook_endpoint',
          description: 'Test if a webhook endpoint is reachable and valid',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The webhook endpoint URL to validate'
              }
            },
            required: ['url']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_webhook_subscription':
            return await this.createWebhookSubscription(args);
          
          case 'list_webhook_subscriptions':
            return await this.listWebhookSubscriptions(args);
          
          case 'delete_webhook_subscription':
            return await this.deleteWebhookSubscription(args);
          
          case 'create_pubsub_webhook':
            return await this.createPubSubWebhook(args);
          
          case 'validate_webhook_endpoint':
            return await this.validateWebhookEndpoint(args);
          
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Error executing ${name}: ${error.message}`);
      }
    });
  }

  async createWebhookSubscription(args) {
    const { topic, callbackUrl, format = 'JSON', includeFields } = args;

    const mutation = `
      mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          userErrors {
            field
            message
          }
          webhookSubscription {
            id
            callbackUrl
            topic
            format
            includeFields
            createdAt
            updatedAt
          }
        }
      }
    `;

    const variables = {
      topic,
      webhookSubscription: {
        callbackUrl,
        format,
        ...(includeFields && { includeFields })
      }
    };

    const data = await this.makeShopifyRequest(mutation, variables);
    
    if (data.webhookSubscriptionCreate.userErrors.length > 0) {
      throw new Error(`Webhook creation failed: ${JSON.stringify(data.webhookSubscriptionCreate.userErrors)}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created webhook subscription:\n${JSON.stringify(data.webhookSubscriptionCreate.webhookSubscription, null, 2)}`
        }
      ]
    };
  }

  async listWebhookSubscriptions(args) {
    const { first = 10 } = args;

    const query = `
      query webhookSubscriptions($first: Int!) {
        webhookSubscriptions(first: $first) {
          edges {
            node {
              id
              callbackUrl
              topic
              format
              includeFields
              createdAt
              updatedAt
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const data = await this.makeShopifyRequest(query, { first });
    
    const subscriptions = data.webhookSubscriptions.edges.map(edge => edge.node);

    return {
      content: [
        {
          type: 'text',
          text: `Current webhook subscriptions (${subscriptions.length}):\n${JSON.stringify(subscriptions, null, 2)}`
        }
      ]
    };
  }

  async deleteWebhookSubscription(args) {
    const { subscriptionId } = args;

    const mutation = `
      mutation webhookSubscriptionDelete($id: ID!) {
        webhookSubscriptionDelete(id: $id) {
          userErrors {
            field
            message
          }
          deletedWebhookSubscriptionId
        }
      }
    `;

    const data = await this.makeShopifyRequest(mutation, { id: subscriptionId });
    
    if (data.webhookSubscriptionDelete.userErrors.length > 0) {
      throw new Error(`Webhook deletion failed: ${JSON.stringify(data.webhookSubscriptionDelete.userErrors)}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Successfully deleted webhook subscription: ${data.webhookSubscriptionDelete.deletedWebhookSubscriptionId}`
        }
      ]
    };
  }

  async createPubSubWebhook(args) {
    const { topic, pubSubProject, pubSubTopic } = args;

    const mutation = `
      mutation pubSubWebhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: PubSubWebhookSubscriptionInput!) {
        pubSubWebhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          userErrors {
            field
            message
          }
          webhookSubscription {
            id
            callbackUrl
            topic
            format
            createdAt
          }
        }
      }
    `;

    const variables = {
      topic,
      webhookSubscription: {
        pubSubProject,
        pubSubTopic
      }
    };

    const data = await this.makeShopifyRequest(mutation, variables);
    
    if (data.pubSubWebhookSubscriptionCreate.userErrors.length > 0) {
      throw new Error(`Pub/Sub webhook creation failed: ${JSON.stringify(data.pubSubWebhookSubscriptionCreate.userErrors)}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created Pub/Sub webhook subscription:\n${JSON.stringify(data.pubSubWebhookSubscriptionCreate.webhookSubscription, null, 2)}`
        }
      ]
    };
  }

  async validateWebhookEndpoint(args) {
    const { url } = args;

    try {
      // Test if the endpoint is reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const isValid = response.ok;
      const status = response.status;
      const headers = Object.fromEntries(response.headers.entries());

      return {
        content: [
          {
            type: 'text',
            text: `Webhook endpoint validation:\nURL: ${url}\nStatus: ${status}\nValid: ${isValid}\nHeaders: ${JSON.stringify(headers, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Webhook endpoint validation failed:\nURL: ${url}\nError: ${error.message}`
          }
        ]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Shopify Webhook MCP server running on stdio');
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ShopifyWebhookMCPServer();
  server.run().catch(console.error);
}

export default ShopifyWebhookMCPServer;
