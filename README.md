# Shopify MCP Server

Advanced Model Context Protocol (MCP) server for Shopify integration with abandoned checkout recovery and marketing automation. Built with the official **@modelcontextprotocol/sdk**.

## 🚀 Features

- **Abandoned Checkout Recovery**: Automatically detect and recover abandoned checkouts
- **Dynamic Marketing Campaigns**: Create personalized recovery offers via Shopify Admin API
- **Real-time Status Tracking**: Update delivery statuses for marketing activities
- **Official MCP SDK**: Built with `@modelcontextprotocol/sdk` for robust protocol compliance
- **Dual Mode Operation**: Run as HTTP server or stdio MCP server
- **GraphQL Integration**: Full Shopify Admin API GraphQL support

## 🛠️ Installation

### Prerequisites
- Node.js >= 22.0.0
- Shopify Partner App with Admin API access
- Environment variables configured

### Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd shopify-chatgpt-mcp
npm install
```

2. **Shopify App Configuration:**
   
   **Create a Custom Shopify App:**
   ```
   Shopify Admin → Settings → Apps and sales channels → Develop apps → Create an app
   ```

   **Configure API Scopes:**
   ```
   Admin API integration → Configure Admin API scopes
   Required scopes:
   - read_products
   - write_marketing_activities
   - read_checkouts
   - write_checkouts
   - read_customers
   - write_customers
   ```

   **Generate Access Token:**
   - After configuration, install the app to generate your Admin API access token
   - Save this token securely for the next step

3. **Environment Configuration:**
Create a `.env` file with your Shopify credentials:
```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-admin-api-access-token
NODE_ENV=development
```

4. **Initialize Database:**
```bash
npm start
```

## 📋 Available Tools

### Core Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_abandoned_checkouts` | Retrieve abandoned checkouts | `limit`, `days_ago` |
| `debug_env_vars` | Debug environment configuration | None |
| `get_product_count` | Get total product count | None |
| `update_abandonment_delivery_status` | Update marketing activity status | `abandonmentId`, `marketingActivityId`, `deliveryStatus`, `deliveredAt`, `deliveryStatusChangeReason` |
| `send_abandonment_recovery_offer` | Send recovery offer | `abandonmentId`, `customerEmail`, `customerId`, `offerType`, `discountPercent` |
| `auto_process_abandonment_recovery` | Auto-process recovery | `abandonmentId`, `offerType`, `discountPercent` |

## 🎯 Usage Modes

### 1. HTTP Server Mode (Development)
```bash
npm start
# Server runs on http://localhost:3000
# MCP tools available at POST /api/mcp
```

### 2. MCP Studio Mode (Production)
```bash
npm run mcp-stdio
# Runs pure MCP server on stdio for AI assistants
```

### 3. Hybrid Mode
```bash
MCP_MODE=true npm start
# Forces MCP-only mode
```

## 🔧 MCP Client Configuration

### For Claude Desktop
Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "shopify-mcp": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/path/to/your/shopify-chatgpt-mcp",
      "env": {
        "NODE_ENV": "production",
        "MCP_MODE": "true"
      }
    }
  }
}
```

### For Other MCP Clients
Use the provided `mcp-config.json` as a reference for your MCP client configuration.

## 📖 Example Workflows

### 1. Abandoned Checkout Recovery
```javascript
// 1. Get abandoned checkouts
await tools.call("get_abandoned_checkouts", { limit: 5 });

// 2. Send recovery offer
await tools.call("send_abandonment_recovery_offer", {
  abandonmentId: "gid://shopify/AbandonedCheckout/123",
  customerEmail: "customer@example.com",
  offerType: "discount",
  discountPercent: "15"
});

// 3. Update status
await tools.call("update_abandonment_delivery_status", {
  abandonmentId: "gid://shopify/AbandonedCheckout/123",
  marketingActivityId: "gid://shopify/MarketingActivity/456",
  deliveryStatus: "SENT"
});
```

### 2. Auto-Processing
```javascript
// Process everything automatically
await tools.call("auto_process_abandonment_recovery", {
  abandonmentId: "gid://shopify/AbandonedCheckout/123",
  offerType: "free_shipping"
});
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Manual Testing (HTTP Mode)
```bash
# Start server
npm start

# Test MCP endpoint
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "debug_env_vars"
    },
    "id": 1
  }'
```

### Manual Testing (MCP Mode)
```bash
# Start MCP server
npm run mcp-stdio

# Send JSON-RPC request via stdin
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | npm run mcp-stdio
```

## 🔍 Development

### Linting
```bash
npm run lint          # Check code style
npm run lint:fix      # Fix code style issues
```

### Watch Mode
```bash
npm run dev           # Auto-restart on file changes
```

## 🏗️ Architecture

```
├── server.js                        # Unified MCP Server (main entry point)
├── src/
│   ├── mcp/
│   │   ├── handlers/
│   │   │   └── mcp_handler.js       # Legacy HTTP handler
│   │   └── schemas/
│   │       └── tool_schema.js       # Tool definitions
│   ├── clients/
│   │   └── shopify.js              # Shopify API client
│   ├── graphql/
│   │   ├── loader.js               # GraphQL query loader
│   │   └── queries/                # GraphQL queries/mutations
│   ├── api/
│   │   └── index.js                # Express HTTP API
│   └── utils/
│       └── api_responses.js        # Response formatters
├── db/
│   └── database.js                 # SQLite database
└── mcp-config.json                 # MCP client configuration
```

## 🚨 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure Node.js >= 22.0.0
   - Run `npm install`

2. **Shopify API errors**
   - Verify `SHOPIFY_STORE_URL` and `SHOPIFY_ACCESS_TOKEN`
   - Check API permissions and scopes (see installation section)
   - Ensure your Shopify app is installed and active
   - Test API access: `npm run debug_env_vars`

3. **MCP connection issues**
   - Ensure stdio mode: `npm run mcp-stdio`
   - Check MCP client configuration paths
   - Verify environment variables are loaded: `MCP_MODE=true`

4. **Database errors**
   - Delete `database.sqlite` and restart
   - Check file permissions
   - Ensure write access to project directory

5. **Authentication issues**
   - Verify your access token hasn't expired
   - Check that your app has the required API scopes
   - Ensure the store URL format: `your-store.myshopify.com` (not `https://`)

## 🔐 Security Best Practices

- Store API tokens securely (environment variables, secrets manager)
- Use HTTPS endpoints in production
- Implement rate limiting for HTTP endpoints
- Monitor and log API usage
- Rotate access tokens periodically

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `npm test`
4. Run linting: `npm run lint:fix`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using the official Model Context Protocol SDK**
