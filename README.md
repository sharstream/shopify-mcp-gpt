# Shopify Webhooks with ChatGPT via MCP Server

This project demonstrates how to implement and manage Shopify webhooks using ChatGPT through a Model Context Protocol (MCP) server. The system allows you to create, manage, and monitor Shopify webhook subscriptions through natural language conversations with AI assistants.

## 🏗️ Architecture Overview

```
ChatGPT/AI Assistant <--MCP--> MCP Server <--GraphQL--> Shopify Store
                                    ↓
                              Webhook Handler <-- Webhook Events
                                    ↓
                              Your Application Logic
```

## ✨ Features

- **Natural Language Webhook Management**: Create, list, and delete webhooks through ChatGPT
- **Multiple Delivery Methods**: Support for HTTPS, Google Pub/Sub, and Amazon EventBridge
- **HMAC Verification**: Secure webhook validation
- **Event Processing**: Structured handling of different webhook types
- **Real-time Monitoring**: Track webhook deliveries and status
- **Extensible Architecture**: Easy to add custom event handlers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Shopify store with a custom app
- An AI assistant that supports MCP (ChatGPT, Claude Desktop, Cursor, etc.)

### 1. Set Up Your Shopify App

1. **Create a Custom App**:
   ```
   Shopify Admin → Settings → Apps and sales channels → Develop apps → Create an app
   ```

2. **Configure API Scopes**:
   ```
   Admin API integration → Configure Admin API scopes
   Required scopes:
   - read_webhooks
   - write_webhooks
   - Plus any scopes for data you want to receive (orders, products, customers, etc.)
   ```

3. **Generate Access Token**:
   - After configuration, install the app to generate your Admin API access token
   - Save this token securely

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-admin-api-access-token
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret
PORT=3000
```

### 4. Set Up MCP Server

Add the MCP configuration to your AI assistant:

**For Cursor/Claude Desktop:**
```json
{
  "mcpServers": {
    "shopify-webhook-mcp": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/Users/dperezalvarez/Documents/shopify-chatgpt-mcp",
      "env": {
        "SHOPIFY_STORE_DOMAIN": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "your-admin-api-access-token"
      }
    }
  }
}
```

### 5. Start the Webhook Handler

```bash
npm run webhook
```

Your webhook endpoint will be available at: `http://localhost:3000/webhooks`

For production, use a service like ngrok to expose your local server:
```bash
ngrok http 3000
```

### 6. Start the MCP Server

```bash
npm start
```

## 💬 Using with ChatGPT

Once configured, you can interact with your Shopify webhooks through natural language:

### Example Conversations

**Creating a Webhook:**
```
User: "Create a webhook subscription for when new orders are created"
AI: I'll create a webhook subscription for order creation events...
```

**Listing Webhooks:**
```
User: "Show me all my current webhook subscriptions"
AI: Here are your current webhook subscriptions...
```

**Managing Webhooks:**
```
User: "Delete the webhook subscription with ID gid://shopify/WebhookSubscription/123"
AI: Successfully deleted webhook subscription...
```

## 🛠️ Available MCP Tools

The MCP server provides these tools to ChatGPT:

1. **`create_webhook_subscription`**
   - Create HTTPS webhook subscriptions
   - Specify topic, callback URL, format, and fields

2. **`list_webhook_subscriptions`**
   - List all current subscriptions
   - View subscription details and status

3. **`delete_webhook_subscription`**
   - Remove webhook subscriptions by ID
   - Clean up unused subscriptions

4. **`create_pubsub_webhook`**
   - Create Google Cloud Pub/Sub webhooks
   - For high-volume, reliable delivery

5. **`validate_webhook_endpoint`**
   - Test webhook endpoints
   - Verify accessibility and SSL certificates

## 📡 Supported Webhook Topics

The system supports all Shopify webhook topics:

### Orders
- `ORDERS_CREATE` - New order created
- `ORDERS_UPDATE` - Order modified
- `ORDERS_PAID` - Payment received
- `ORDERS_DELETE` - Order deleted

### Products
- `PRODUCTS_CREATE` - New product added
- `PRODUCTS_UPDATE` - Product modified
- `PRODUCTS_DELETE` - Product removed

### Customers
- `CUSTOMERS_CREATE` - New customer registered
- `CUSTOMERS_UPDATE` - Customer details updated
- `CUSTOMERS_DELETE` - Customer removed

### App Events
- `APP_UNINSTALLED` - App removed from store
- `APP_SUBSCRIPTIONS_UPDATE` - Subscription changes

## 🔧 Customizing Event Handlers

To add custom logic for webhook events, modify the handlers in `webhook-handler.js`:

```javascript
async handleOrderCreated(order, metadata) {
  console.log(`🛍️  New order: #${order.order_number}`);
  
  // Your custom logic here:
  // - Send email notifications
  // - Update external systems  
  // - Trigger fulfillment
  // - Update analytics
  
  await this.notifyAIAssistant('order_created', {
    orderNumber: order.order_number,
    total: order.total_price,
    // ... additional data
  });
}
```

## 🔒 Security Best Practices

1. **HMAC Verification**: Always verify webhook authenticity
2. **HTTPS Only**: Use secure endpoints in production
3. **Token Security**: Store API tokens securely (environment variables, secrets manager)
4. **Rate Limiting**: Implement rate limiting on webhook endpoints
5. **Monitoring**: Log and monitor webhook deliveries

## 🐛 Troubleshooting

### Common Issues

1. **HMAC Verification Failures**
   - Ensure webhook secret matches between Shopify and your handler
   - Verify raw body parsing is working correctly

2. **MCP Connection Issues**
   - Check environment variables are set correctly
   - Verify Shopify API token has required scopes
   - Test GraphQL queries manually

3. **Webhook Not Received**
   - Confirm webhook endpoint is publicly accessible
   - Check Shopify webhook delivery logs
   - Verify SSL certificate if using HTTPS

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run webhook
```

## 📊 Monitoring and Analytics

The webhook handler includes built-in monitoring:

- Health check endpoint: `/health`
- Status endpoint: `/webhooks/status`
- Webhook processing logs
- Error tracking and reporting

## 🔗 Related Resources

- [Shopify Webhooks Documentation](https://shopify.dev/docs/apps/webhooks)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Shopify Admin API](https://shopify.dev/docs/api/admin-graphql)
- [GraphQL Admin API Reference](https://shopify.dev/docs/api/admin-graphql/latest)

---

**Happy webhook management with AI! 🎉**
