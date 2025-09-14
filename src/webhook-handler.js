#!/usr/bin/env node

import express from 'express';
import crypto from 'crypto';
import { createServer } from 'http';

/**
 * Shopify Webhook Handler
 * Receives and processes webhook events from Shopify
 * Validates HMAC signatures and processes different event types
 */

class ShopifyWebhookHandler {
  constructor(options = {}) {
    this.app = express();
    this.port = options.port || process.env.PORT || 3000;
    this.webhookSecret = options.webhookSecret || process.env.SHOPIFY_WEBHOOK_SECRET;
    
    if (!this.webhookSecret) {
      console.error('Warning: SHOPIFY_WEBHOOK_SECRET not provided. HMAC verification will be skipped.');
    }

    this.setupMiddleware();
    this.setupRoutes();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Parse raw body for HMAC verification
    this.app.use('/webhooks', express.raw({ type: 'application/json' }));
    
    // Parse JSON for other routes
    this.app.use(express.json());
    
    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Main webhook endpoint
    this.app.post('/webhooks/:topic?', (req, res) => {
      this.handleWebhook(req, res);
    });

    // Webhook status endpoint
    this.app.get('/webhooks/status', (req, res) => {
      res.json({
        server: 'Shopify Webhook Handler',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          webhook: '/webhooks/{topic}',
          status: '/webhooks/status'
        },
        environment: {
          port: this.port,
          nodeVersion: process.version,
          hasSecret: !!this.webhookSecret
        }
      });
    });
  }

  setupEventHandlers() {
    // Event handlers for different webhook topics
    this.handlers = {
      'orders/create': this.handleOrderCreated.bind(this),
      'orders/update': this.handleOrderUpdated.bind(this),
      'orders/paid': this.handleOrderPaid.bind(this),
      'products/create': this.handleProductCreated.bind(this),
      'products/update': this.handleProductUpdated.bind(this),
      'customers/create': this.handleCustomerCreated.bind(this),
      'app/uninstalled': this.handleAppUninstalled.bind(this),
      'default': this.handleGenericWebhook.bind(this)
    };
  }

  verifyWebhookSignature(rawBody, signature) {
    if (!this.webhookSecret || !signature) {
      return false;
    }

    const calculatedHmac = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(calculatedHmac),
      Buffer.from(signature)
    );
  }

  async handleWebhook(req, res) {
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];
    const webhookId = req.headers['x-shopify-webhook-id'];
    const apiVersion = req.headers['x-shopify-api-version'];
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    const triggeredAt = req.headers['x-shopify-triggered-at'];

    console.log(`\n🎣 Received webhook:`, {
      topic,
      shop,
      webhookId,
      apiVersion,
      triggeredAt,
      timestamp: new Date().toISOString()
    });

    // Verify HMAC if secret is provided
    if (this.webhookSecret) {
      const isValid = this.verifyWebhookSignature(req.body, hmacHeader);
      if (!isValid) {
        console.error('❌ Invalid HMAC signature');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      console.log('✅ HMAC signature verified');
    }

    try {
      // Parse the webhook payload
      const payload = JSON.parse(req.body.toString());
      
      // Find and execute the appropriate handler
      const handler = this.handlers[topic] || this.handlers['default'];
      await handler(payload, {
        topic,
        shop,
        webhookId,
        apiVersion,
        triggeredAt
      });

      // Respond to Shopify
      res.status(200).json({ 
        received: true, 
        webhookId,
        processedAt: new Date().toISOString()
      });

    } catch (error) {
      let { eventType, data } = getWebhookFromHeaders(req.headers);
      console.error(`---> An error occurred while processing webhooks for ${shop} with event type ${eventType}:`, error.message, data);
      // It's important to still send a 200 OK to Shopify to prevent retries
      res.status(200).json({ received: true, error: "Internal Server Error" });
    }
  }

  // Specific webhook handlers
  async handleOrderCreated(order, metadata) {
    console.log(`🛍️  New order created: #${order.order_number || order.name}`);
    console.log(`💰 Total: ${order.total_price} ${order.currency}`);
    console.log(`📧 Customer: ${order.email || 'N/A'}`);
    
    // Add your order processing logic here
    // Examples:
    // - Send confirmation email
    // - Update inventory systems
    // - Trigger fulfillment process
    // - Sync with external systems
    
    await this.notifyAIAssistant('order_created', {
      orderNumber: order.order_number || order.name,
      total: order.total_price,
      currency: order.currency,
      customerEmail: order.email,
      shop: metadata.shop
    });
  }

  async handleOrderUpdated(order, metadata) {
    console.log(`📝 Order updated: #${order.order_number || order.name}`);
    console.log(`📊 Status: ${order.financial_status} / ${order.fulfillment_status}`);
    
    // Add your order update logic here
    await this.notifyAIAssistant('order_updated', {
      orderNumber: order.order_number || order.name,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      shop: metadata.shop
    });
  }

  async handleOrderPaid(order, metadata) {
    console.log(`💳 Order paid: #${order.order_number || order.name}`);
    console.log(`💰 Amount: ${order.total_price} ${order.currency}`);
    
    // Add your payment processing logic here
    await this.notifyAIAssistant('order_paid', {
      orderNumber: order.order_number || order.name,
      amount: order.total_price,
      currency: order.currency,
      shop: metadata.shop
    });
  }

  async handleProductCreated(product, metadata) {
    console.log(`📦 New product created: ${product.title}`);
    console.log(`🔖 Handle: ${product.handle}`);
    
    // Add your product processing logic here
    await this.notifyAIAssistant('product_created', {
      title: product.title,
      handle: product.handle,
      productType: product.product_type,
      vendor: product.vendor,
      shop: metadata.shop
    });
  }

  async handleProductUpdated(product, metadata) {
    console.log(`📝 Product updated: ${product.title}`);
    
    // Add your product update logic here
    await this.notifyAIAssistant('product_updated', {
      title: product.title,
      handle: product.handle,
      shop: metadata.shop
    });
  }

  async handleCustomerCreated(customer, metadata) {
    console.log(`👤 New customer: ${customer.email}`);
    console.log(`📧 Email: ${customer.email}`);
    
    // Add your customer processing logic here
    await this.notifyAIAssistant('customer_created', {
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      shop: metadata.shop
    });
  }

  async handleAppUninstalled(data, metadata) {
    console.log(`🚫 App uninstalled from: ${metadata.shop}`);
    
    // Add your cleanup logic here
    // - Delete stored data
    // - Cancel subscriptions
    // - Clean up resources
    
    await this.notifyAIAssistant('app_uninstalled', {
      shop: metadata.shop,
      uninstalledAt: metadata.triggeredAt
    });
  }

  async handleGenericWebhook(payload, metadata) {
    console.log(`📥 Generic webhook: ${metadata.topic}`);
    console.log(`🏪 Shop: ${metadata.shop}`);
    console.log(`📋 Payload keys: ${Object.keys(payload).join(', ')}`);
    
    await this.notifyAIAssistant('generic_webhook', {
      topic: metadata.topic,
      shop: metadata.shop,
      payloadKeys: Object.keys(payload)
    });
  }

  // Notify AI Assistant (ChatGPT) about events
  async notifyAIAssistant(eventType, data) {
    // This is where you would integrate with your AI system
    // Examples:
    // - Send to a message queue
    // - Store in database for AI processing
    // - Call an AI endpoint
    // - Update a dashboard
    
    console.log(`🤖 AI Assistant Notification:`, {
      eventType,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Example: Store event for later processing
    // await this.storeEventForAI(eventType, data);
    
    // Example: Send real-time notification
    // await this.sendRealTimeNotification(eventType, data);
  }

  async storeEventForAI(eventType, data) {
    // Implement your storage logic here
    // Could be database, file, message queue, etc.
  }

  async sendRealTimeNotification(eventType, data) {
    // Implement real-time notification logic
    // Could be WebSocket, Server-Sent Events, etc.
  }

  start() {
    const server = createServer(this.app);
    
    server.listen(this.port, () => {
      console.log(`🚀 Shopify Webhook Handler running on port ${this.port}`);
      console.log(`📡 Webhook endpoint: http://localhost:${this.port}/webhooks`);
      console.log(`💚 Health check: http://localhost:${this.port}/health`);
      console.log(`📊 Status: http://localhost:${this.port}/webhooks/status`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    return server;
  }
}

function getWebhookFromHeaders(headers){
  const eventType = headers["x-shopify-topic"] || "";
  const data = headers["x-shopify-shop-domain"] || "";

  return {eventType, data};
}

// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const handler = new ShopifyWebhookHandler({
    port: process.env.PORT || 3000,
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET
  });
  
  handler.start();
}

export default ShopifyWebhookHandler;
