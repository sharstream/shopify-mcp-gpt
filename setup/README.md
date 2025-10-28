# Setup Directory

This directory contains deployment and setup scripts for the Shopify MCP Server.

## Files

### `deploy-heroku.sh`

Automated Heroku deployment script that:
- Creates Heroku app
- Generates secure MCP_API_KEY
- Configures environment variables
- Deploys your application
- Provides Claude Code configuration

**Usage:**

```bash
# From anywhere in the project
./setup/deploy-heroku.sh
```

**What it does:**
1. ✅ Detects its location and changes to project root
2. ✅ Checks Heroku CLI installation
3. ✅ Creates Heroku app (with optional custom name)
4. ✅ Generates secure API key using `openssl`
5. ✅ Prompts for Shopify credentials
6. ✅ Sets all environment variables on Heroku
7. ✅ Deploys to Heroku via git push
8. ✅ Provides configuration for both SSE and HTTP transports

**Important:** The script automatically navigates to the project root before executing git and Heroku commands, so you can run it from any directory.

## Script Details

### Path Resolution

The script uses this logic to ensure it runs from the correct directory:

```bash
# Get script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get project root (parent of setup/)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"
```

This means:
- ✅ Script can be run from anywhere: `./setup/deploy-heroku.sh`, `../setup/deploy-heroku.sh`, etc.
- ✅ Git operations execute from repository root
- ✅ Heroku commands use correct remote
- ✅ File paths are relative to project root

### Environment Variables Set

The script configures these on Heroku:
- `NODE_ENV=production`
- `SHOPIFY_STORE_DOMAIN` (from your input)
- `SHOPIFY_ADMIN_ACCESS_TOKEN` (from your input)
- `MCP_API_KEY` (auto-generated)

### Output

After deployment, the script provides:

1. **App Information:**
   - App name
   - App URL
   - SSE endpoint (recommended)
   - HTTP endpoint (legacy)
   - MCP API Key

2. **Claude Code Configuration:**
   - SSE transport config (recommended)
   - HTTP transport config (legacy)
   - Both with proper authentication headers

3. **Testing Commands:**
   - Health check endpoint
   - Server info endpoint
   - HTTP/JSON-RPC test
   - SSE connection test

4. **Useful Commands:**
   - View logs
   - Restart app
   - Open app
   - Check status
   - Update config

## Troubleshooting

### Issue: Script not executable

```bash
chmod +x setup/deploy-heroku.sh
```

### Issue: "Not a git repository"

The script will initialize git for you if needed. Just make sure you're running from the project directory structure.

### Issue: Heroku CLI not found

Install Heroku CLI:
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Issue: Wrong working directory

The script automatically detects and changes to the project root. You'll see output like:
```
Script location: /path/to/project/setup
Project root: /path/to/project
✅ Working from project root
```

If you see errors, the script will show you where it's running from.

## Documentation

For more information, see:
- **Deployment Guide**: `../HEROKU_DEPLOYMENT.md` (in .cursor/work-items/documentation/)
- **SSE Setup**: `../SSE_SETUP.md` (in .cursor/work-items/documentation/)
- **Deployment Summary**: `../DEPLOYMENT_SUMMARY.md` (in .cursor/work-items/documentation/)
- **Main README**: `../README.md`

## Security Notes

- ✅ MCP_API_KEY generated with `openssl rand -hex 32` (cryptographically secure)
- ✅ All secrets stored in Heroku config vars (not in code)
- ✅ API key displayed once during deployment - save it securely
- ✅ Bearer token authentication required for all MCP endpoints
- ✅ Rate limiting applied (100 requests/minute per IP)

---

**Ready to deploy? Run:** `./setup/deploy-heroku.sh`
