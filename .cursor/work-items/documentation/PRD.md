# Product Requirements Document (PRD)
## AI Cigar Roller Workflow - Shopify ChatGPT MCP Integration

**Document Status**: Complete  
**Client**: Jorge CigarRoller, Port St. Lucie FL  
**Engineer**: David Perez  
**Project Size**: Medium  
**Last Updated**: August 27, 2025  

---

## 1. Executive Summary

This project implements an AI-powered workflow automation system for Jorge's cigar rolling business, integrating Shopify e-commerce with ChatGPT through a Model Context Protocol (MCP) server. The system enables real-time webhook processing, abandoned cart recovery, automated coupon distribution, and intelligent business analytics through natural language conversations with AI assistants.

### Key Objectives
- Increase online sales by 20% through abandoned cart recovery
- Automate customer communication and marketing campaigns
- Provide real-time inventory and order management
- Enable AI-powered business analytics and decision making
- Reduce manual administrative overhead

---

## 2. System Architecture Overview

```
Shopify Store --> Webhook Events --> MCP Server <--> ChatGPT/AI Assistant
                                        |
                                        v
                                Webhook Handler --> Business Logic
                                        |
                                        v
                            External Systems (Make.com, Email, etc.)
```

### Technology Stack
- **Frontend**: Shopify Store
- **Backend**: Node.js 18+
- **AI Integration**: ChatGPT via MCP (Model Context Protocol)
- **Automation**: Make.com workflows
- **Communication**: Express.js webhook handler
- **APIs**: Shopify Admin API GraphQL, OpenAI API

---

## 3. Core Features Implemented

### 3.1 MCP Server (`server.js`)

**Purpose**: Enables ChatGPT to manage Shopify webhooks through natural language commands.

**Key Capabilities**:
- Create webhook subscriptions for various Shopify events
- List and manage existing webhook subscriptions
- Delete webhook subscriptions by ID
- Create Google Pub/Sub webhook subscriptions
- Validate webhook endpoints

**Supported Webhook Topics**:
- `ORDERS_CREATE` - New order notifications
- `ORDERS_UPDATE` - Order status changes
- `ORDERS_PAID` - Payment confirmations
- `PRODUCTS_CREATE` - New product alerts
- `PRODUCTS_UPDATE` - Product changes
- `CUSTOMERS_CREATE` - New customer registrations
- `APP_UNINSTALLED` - App removal notifications

**Technical Implementation**:
```javascript
// MCP Server Tools Available to ChatGPT:
1. create_webhook_subscription(topic, callbackUrl, format, includeFields)
2. list_webhook_subscriptions(first)
3. delete_webhook_subscription(subscriptionId)
4. create_pubsub_webhook(topic, pubSubProject, pubSubTopic)
5. validate_webhook_endpoint(url)
```

### 3.2 Webhook Handler (`webhook-handler.js`)

**Purpose**: Processes incoming webhook events from Shopify and triggers business logic.

**Key Features**:
- HMAC signature verification for security
- Event-specific handlers for different webhook types
- Real-time AI assistant notifications
- Structured logging and monitoring
- Health check endpoints

**Security Features**:
- HMAC-SHA256 signature validation
- Environment variable configuration
- CORS protection
- Rate limiting support

**Monitoring Endpoints**:
- `/health` - System health check
- `/webhooks/status` - Webhook handler status
- `/webhooks` - Main webhook receiver endpoint

---

## 4. Business Requirements Fulfilled

### 4.1 Abandoned Cart Recovery
**Requirement**: Detect and respond to abandoned shopping carts to increase sales by 20%

**Implementation**:
- Webhook subscription to `ORDERS_CREATE` events
- Real-time notification to ChatGPT when carts are abandoned
- Automated follow-up campaign triggers
- Integration with Make.com for email automation

### 4.2 Automated Coupon Distribution
**Requirement**: Send targeted discount coupons based on customer behavior

**Implementation**:
- Customer segmentation logic in webhook handlers
- Dynamic coupon generation through Shopify API
- AI-powered personalized messaging via ChatGPT
- Time-sensitive offer management

**Coupon Strategy**:
| Customer Segment | Criteria | Discount |
|------------------|----------|----------|
| Loyal Customers | Multiple purchases in last year | 15% |
| Occasional Buyers | Last purchase 6+ months ago | 10% |
| Inactive Customers | No purchase in 1+ year | 5% |

### 4.3 Real-time Business Intelligence
**Requirement**: AI-powered analytics and decision making

**Implementation**:
- Order status monitoring through webhooks
- Product performance tracking
- Customer behavior analysis
- AI assistant provides insights through natural language queries

### 4.4 Inventory Management
**Requirement**: Real-time inventory status and alerts

**Implementation**:
- Product update webhook monitoring
- Stock level notifications
- Automated reorder suggestions via AI
- Integration with fulfillment systems

---

## 5. Setup and Configuration

### 5.1 Shopify App Setup

**Required Scopes**:
```
- read_webhooks
- write_webhooks
- read_products
- write_products
- read_orders
- write_orders
- read_customers
- write_customers
- read_checkouts
```

**Steps to Create Custom App**:
1. Navigate to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps" (enable developer preview if needed)
3. Create new app with descriptive name
4. Configure API scopes as listed above
5. Install app to generate Admin API access token
6. Save access token securely

### 5.2 Environment Variables

**Required Configuration** (`.env` file):
```bash
# Shopify Store Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-admin-api-access-token
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

# Webhook Handler Configuration
PORT=3000

# Optional: For enhanced logging
DEBUG=shopify:*
NODE_ENV=development
```

**How to Obtain Credentials**:
1. **Store Domain**: Found in Shopify admin URL (e.g., `your-store.myshopify.com`)
2. **Access Token**: Generated after installing your custom app
3. **Webhook Secret**: Set in your app's webhook settings for HMAC verification

### 5.3 MCP Configuration for AI Assistants

**For Cursor/Claude Desktop** (`mcp.json`):
```json
{
  "mcpServers": {
    "shopify-webhook-mcp": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/path/to/shopify-chatgpt-mcp",
      "env": {
        "SHOPIFY_STORE_DOMAIN": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "your-admin-api-access-token"
      }
    }
  }
}
```

---

## 6. Technical Implementation Details

### 6.1 MCP Server Architecture

**Core Components**:
```javascript
class ShopifyWebhookMCPServer {
  constructor() {
    // Initialize MCP server with capabilities
    this.server = new Server({
      name: 'shopify-webhook-mcp',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
  }

  async makeShopifyRequest(query, variables = {}) {
    // GraphQL API communication with Shopify
    const url = `https://${this.shopifyDomain}/admin/api/2025-07/graphql.json`;
    // Handle authentication and error processing
  }

  setupToolHandlers() {
    // Register available tools for ChatGPT
    // Handle tool execution and response formatting
  }
}
```

**GraphQL Mutations Used**:
```graphql
# Create webhook subscription
mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
  webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
    userErrors { field message }
    webhookSubscription {
      id callbackUrl topic format includeFields
      createdAt updatedAt
    }
  }
}

# List webhook subscriptions
query webhookSubscriptions($first: Int!) {
  webhookSubscriptions(first: $first) {
    edges {
      node {
        id callbackUrl topic format includeFields
        createdAt updatedAt
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

### 6.2 Webhook Handler Architecture

**Event Processing Pipeline**:
```javascript
class ShopifyWebhookHandler {
  async handleWebhook(req, res) {
    // 1. Extract webhook metadata from headers
    // 2. Verify HMAC signature for security
    // 3. Parse JSON payload
    // 4. Route to specific event handler
    // 5. Execute business logic
    // 6. Notify AI assistant
    // 7. Respond to Shopify with 200 OK
  }

  setupEventHandlers() {
    this.handlers = {
      'orders/create': this.handleOrderCreated.bind(this),
      'orders/update': this.handleOrderUpdated.bind(this),
      'products/create': this.handleProductCreated.bind(this),
      // ... additional handlers
    };
  }
}
```

**Security Implementation**:
```javascript
verifyWebhookSignature(rawBody, signature) {
  if (!this.webhookSecret || !signature) return false;
  
  const calculatedHmac = crypto
    .createHmac('sha256', this.webhookSecret)
    .update(rawBody)
    .digest('base64');
    
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac),
    Buffer.from(signature)
  );
}
```

---

## 7. Startup Instructions

### 7.1 Project Installation

```bash
# Navigate to project directory
cd /path/to/shopify-chatgpt-mcp

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Shopify credentials
```

### 7.2 Starting the Services

**Option 1: Using the Startup Script**
```bash
# Make script executable
chmod +x start.sh

# Run the startup script (validates environment and starts MCP server)
./start.sh
```

**Option 2: Manual Startup**
```bash
# Start MCP server (for ChatGPT integration)
npm start
# OR
node server.js

# Start webhook handler (in separate terminal)
npm run webhook
# OR
node webhook-handler.js
```

**Option 3: Development Mode**
```bash
# Start with auto-reload
npm run dev
```

### 7.3 Startup Script Features

The `start.sh` script provides:
- Environment variable validation
- Automatic `.env` file creation
- Credential verification
- Helpful error messages and setup guidance
- Secure token display (showing only first 10 characters)

---

## 8. Usage Examples

### 8.1 ChatGPT Interactions

**Creating Webhooks**:
```
User: "Create a webhook subscription for when new orders are created"
AI: I'll create a webhook subscription for order creation events...
[Creates webhook using create_webhook_subscription tool]
```

**Managing Webhooks**:
```
User: "Show me all my current webhook subscriptions"
AI: Here are your current webhook subscriptions...
[Lists webhooks using list_webhook_subscriptions tool]

User: "Delete the webhook with ID gid://shopify/WebhookSubscription/123"
AI: Successfully deleted webhook subscription...
[Removes webhook using delete_webhook_subscription tool]
```

### 8.2 Business Scenarios

**Abandoned Cart Recovery**:
1. Customer adds items to cart but doesn't complete purchase
2. Shopify triggers `orders/create` webhook
3. Webhook handler processes event and notifies ChatGPT
4. AI assistant analyzes customer behavior and suggests follow-up action
5. Automated email with personalized discount is triggered

**Inventory Management**:
1. Product stock changes in Shopify
2. `products/update` webhook fires
3. AI assistant receives inventory update
4. ChatGPT can answer "What's my current inventory status?"
5. Automated reorder suggestions for low-stock items

---

## 9. Integration with Make.com

### 9.1 Webhook Endpoint Configuration

**Make.com Webhook URL**: `https://hook.us2.make.com/iby8lmy1mho5reca86jr6fjdcxwi432s`

**Data Schema for Abandoned Carts**:
```json
{
  "checkout_id": "{{id}}",
  "email": "{{email}}",
  "created_at": "{{created_at}}",
  "abandoned_checkout_url": "{{abandoned_checkout_url}}",
  "line_items": [{
    "title": "{{title}}",
    "quantity": "{{quantity}}",
    "price": "{{price}}"
  }],
  "customer": {
    "first_name": "{{first_name}}",
    "last_name": "{{last_name}}"
  },
  "total_price": "{{total_price}}",
  "currency": "{{currency}}"
}
```

### 9.2 Make.com Automation Workflows

**Abandoned Cart Recovery Workflow**:
1. Shopify → Webhook trigger → Iterator
2. Tools → Variable processing → Array Aggregator  
3. Google Sheets → Log abandoned carts
4. OpenAI → Generate personalized message
5. Email → Send recovery email with coupon

---

## 10. Security and Compliance

### 10.1 Data Protection
- HMAC signature verification for all webhooks
- Environment variables for sensitive credentials
- Minimal access principle (only required Shopify scopes)
- Secure token handling and display

### 10.2 API Security
- Rate limiting on webhook endpoints
- HTTPS-only communication
- Input validation and sanitization
- Error handling without data exposure

### 10.3 Access Control
**Shopify Permissions Required**:
- Abandoned Checkouts: Search and Watch
- Discounts: Search and Create
- Orders: Read and Write
- Products: Read and Write
- Customers: Read and Write

---

## 11. Monitoring and Troubleshooting

### 11.1 Health Check Endpoints

**Webhook Handler Status**:
- `GET /health` - Basic health check
- `GET /webhooks/status` - Detailed system information

**Response Example**:
```json
{
  "server": "Shopify Webhook Handler",
  "version": "1.0.0",
  "environment": {
    "port": 3000,
    "nodeVersion": "v18.18.0",
    "hasSecret": true
  }
}
```

### 11.2 Logging and Debugging

**Console Output Examples**:
```bash
🎣 Received webhook: {
  topic: 'orders/create',
  shop: 'your-store.myshopify.com',
  webhookId: 'abc-123',
  timestamp: '2025-08-27T11:30:00.000Z'
}

✅ HMAC signature verified
🛍️  New order created: #1001
💰 Total: $45.99 USD
🤖 AI Assistant Notification: order_created
```

**Debug Mode**:
```bash
DEBUG=shopify:* npm run webhook
```

### 11.3 Common Issues and Solutions

**HMAC Verification Failures**:
- Ensure webhook secret matches between Shopify and handler
- Verify raw body parsing is correct
- Check webhook secret generation in Shopify app

**MCP Connection Issues**:
- Validate environment variables are set
- Confirm Shopify API token has required scopes
- Test GraphQL queries manually

**Webhook Not Received**:
- Verify webhook endpoint is publicly accessible
- Check Shopify webhook delivery logs
- Confirm SSL certificate validity

---

## 12. Performance and Scalability

### 12.1 Current Limitations
- Single instance webhook handler
- Synchronous webhook processing
- Local environment variables

### 12.2 Production Recommendations
- Deploy webhook handler to cloud service (Heroku, AWS, etc.)
- Implement webhook queue system for high volume
- Use managed secrets service
- Add rate limiting and request throttling
- Implement webhook retry mechanism

### 12.3 Monitoring Metrics
- Webhook processing time
- Success/failure rates
- API response times
- Error frequency and types

---

## 13. Future Enhancements

### 13.1 Planned Features
- **Voice Integration**: Whisper API for speech-to-text commands
- **Advanced Analytics**: Machine learning-powered insights
- **Multi-channel Marketing**: Facebook, Instagram, WhatsApp integration
- **Freight Management**: Shipping carrier integration
- **Competitive Analysis**: Automated price monitoring

### 13.2 Technical Improvements
- WebSocket support for real-time updates
- Database integration for persistent storage
- Multi-tenant support for multiple stores
- Advanced caching mechanisms
- Comprehensive test suite

---

## 14. Cost Analysis

### 14.1 Monthly Operating Costs
| Service | Cost | Purpose |
|---------|------|---------|
| Make.com | Free (1K ops) / $10+ | Workflow automation |
| OpenAI API | $0.01-0.03/message | AI processing |
| Shopify | Existing plan | E-commerce platform |
| **Total Estimated** | **$10-50/month** | **Full system operation** |

### 14.2 Development Investment
- Consultancy (4 hrs @ $50): $200
- Automation Design (8 @ $200): $1,600  
- Implementation & Testing: $100
- **Total Development**: **$1,900**

---

## 15. Success Metrics

### 15.1 Business KPIs
- **Sales Increase**: Target 20% improvement
- **Cart Recovery Rate**: Baseline tracking and improvement
- **Customer Response Time**: Real-time notification processing
- **Operational Efficiency**: Reduced manual tasks

### 15.2 Technical KPIs  
- **Webhook Processing**: <1 second response time
- **Uptime**: 99.9% availability target
- **Error Rate**: <1% failure rate
- **API Performance**: <500ms average response time

---

## 16. Conclusion

This implementation provides a robust foundation for AI-powered e-commerce automation, enabling Jorge's cigar business to leverage cutting-edge technology for improved customer engagement, automated workflows, and data-driven decision making. The modular architecture allows for future expansion while maintaining security and performance standards.

The integration of Shopify webhooks with ChatGPT through the MCP protocol represents a significant advancement in e-commerce automation, providing natural language control over complex business processes while maintaining the flexibility to adapt to changing business requirements.

---

**Document Version**: 1.0  
**Review Date**: August 27, 2025  
**Next Review**: September 27, 2025
