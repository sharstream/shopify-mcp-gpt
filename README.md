# Shopify MCP Server

Advanced Model Context Protocol (MCP) server for Shopify integration with abandoned checkout recovery and marketing automation. Built with the official **@modelcontextprotocol/sdk**.

## 🚀 Features

- **Abandoned Checkout Recovery**: Automatically detect and recover abandoned checkouts
- **Dynamic Marketing Campaigns**: Create personalized recovery offers via Shopify Admin API
- **Real-time Status Tracking**: Update delivery statuses for marketing activities
- **Official MCP SDK**: Built with `@modelcontextprotocol/sdk` for robust protocol compliance
- **Dual Mode Operation**: Run as HTTP server or stdio MCP server
- **GraphQL Integration**: Full Shopify Admin API GraphQL support

## 🚀 Quick Start - Deploy to Heroku

Want to deploy your MCP server as a remote service? Use our automated deployment script:

```bash
# Make script executable (if not already)
chmod +x setup/deploy-heroku.sh

# Run the deployment script
./setup/deploy-heroku.sh
```

The script will:
- Create your Heroku app
- Generate secure API keys
- Configure environment variables
- Deploy your app
- Provide Claude Code configuration

**📖 For detailed deployment instructions, see [HEROKU_DEPLOYMENT.md](./HEROKU_DEPLOYMENT.md)**

## 🛠️ Local Installation

### Prerequisites
- Node.js >= 20.0.0
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

## 🔐 Authentication

### Quick Start

Choose your authentication method based on your use case:

| Use Case | Method | Setup Time |
|----------|--------|-----------|
| 🧪 **Testing/Development** | Bearer Token | 1 minute |
| 🚀 **Production** | JWT Tokens | 2 minutes |

### Two Methods, One Goal: Security

**Bearer Token (MCP_API_KEY)** - Simple & Direct
- ✅ Never expires - always works
- ✅ One credential to manage
- ⚠️ Must protect carefully (no expiration)

**JWT Tokens** - Secure & Auto-Expiring
- ✅ Expires after 15 minutes automatically
- ✅ Contains client/shop metadata
- ✅ If stolen, limited damage window

**Why Both?** Defense in depth following OAuth 2.0 patterns:
- Bearer = Master key (generates JWT tokens)
- JWT = Temporary passes (for actual operations)
- If JWT is compromised → only 15 min risk
- If Bearer is compromised → rotate and wait 15 min for JWTs to expire

---

### Method 1: JWT Tokens (Production)

**Setup (2 minutes):**

```bash
# 1. Generate secrets
openssl rand -hex 64  # JWT_SIGNATURE
openssl rand -hex 32  # MCP_API_KEY

# 2. Add to .env
JWT_SIGNATURE=your_jwt_signature_here
MCP_API_KEY=your_api_key_here
```

**Usage:**

```bash
# Generate token (valid 15 min)
curl -X POST http://localhost:3000/api/auth/token \
  -H "Authorization: Bearer ${MCP_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"my-app","shopDomain":"shop.myshopify.com"}'

# Use token for requests
curl http://localhost:3000/api/mcp \
  -H "Authorization: MCP ${TOKEN}" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# When expired, refresh
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer ${MCP_API_KEY}" \
  -d '{"clientId":"my-app","shopDomain":"shop.myshopify.com"}'
```

**Token Expiration:**
- Default: 15 minutes (customizable: "15m", "1h", "7d", "30d")
- Auto-checked on every request
- When expired → 401 error with refresh instructions
- Check status: `POST /api/auth/introspect`

### Method 2: Bearer Token (Development)

**Setup (1 minute):**

```bash
# 1. Generate key
openssl rand -hex 32

# 2. Add to .env
MCP_API_KEY=your_api_key_here
```

**Usage:**

```bash
# Use directly - no token generation needed
curl http://localhost:3000/api/mcp \
  -H "Authorization: Bearer ${MCP_API_KEY}" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

**Simple but secure:** Never expires, so store carefully.

### Which Method Should I Use?

```
Development/Testing  → Bearer Token (1 credential, always works)
Production           → JWT Tokens (auto-expires, more secure)
Heroku Deployment    → Bootstrap JWT (30-day) → then short-lived JWTs
```

### Quick Comparison

| Feature | Bearer | JWT |
|---------|--------|-----|
| **Setup** | 1 min | 2 min |
| **Expires** | Never | 15 min |
| **Refresh** | Not needed | Auto-generate new token |
| **Security** | Protect carefully | Limited risk window |
| **Best For** | Dev/Testing | Production |

### Testing

```bash
npm start                    # Start server
node test-jwt-auth.js       # Run tests (generates, expires, refreshes token)
```

### Security Best Practices

**Why Hybrid = More Secure:**
- If JWT stolen → only 15 min damage window
- If Bearer stolen → rotate it, wait 15 min for JWTs to expire
- Defense in depth: two security layers

**Key Management:**
- ✅ Store in environment variables / secrets manager
- ✅ Never commit `.env` to git
- ✅ Rotate Bearer token quarterly
- ✅ JWT_SIGNATURE: at least 64 bytes (512 bits)

**Production:**
- ✅ Always use HTTPS
- ✅ Auto-refresh JWTs at 12-13 min (before 15 min expiry)
- ✅ Monitor failed auth attempts
- ✅ Rate limiting enabled (100 req/min default)

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

### 1. Local Development (Stdio)
```bash
npm run mcp-stdio
# Runs MCP server on stdio for local Claude Code/Desktop
```

### 2. HTTP Server Mode (Development)
```bash
npm start
# Server runs on http://localhost:3000
# MCP tools available at POST /api/mcp
# Includes SSE endpoint at GET /sse
```

### 3. Remote Deployment (Heroku - Recommended)
```bash
./setup/deploy-heroku.sh
# Deploys to Heroku with SSE transport
# Accessible from anywhere via HTTPS
# See HEROKU_DEPLOYMENT.md for details
```

**📖 For SSE transport and remote access setup, see [SSE_SETUP.md](./SSE_SETUP.md)**

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
