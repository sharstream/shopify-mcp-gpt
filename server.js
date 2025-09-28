#!/usr/bin/env node

import 'dotenv/config';
import { createServer } from 'http';

import app from './src/api/index.js';
import { initializeDatabase } from './db/database.js';
import { ShopifyMcpServer } from './src/mcp/adapters/mcp_sdk_adapter.js';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '3000', 10);

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
            console.log('🔗 Starting Unified Shopify MCP Server (stdio mode)...');
            const mcpServer = new ShopifyMcpServer();
            await mcpServer.runMcpServer();
            return; // Don't start HTTP server in MCP mode
        }

        // Start HTTP server (development/hybrid mode)
        console.log('🚀 Starting Express HTTP server with Unified MCP...');
        const server = createServer(app);

        server.listen(PORT, () => {
            console.log(`Express server running on port ${PORT}`);
            console.log(`📊 API Endpoints:`);
            console.log(`   - POST /api/mcp (Unified MCP tools via HTTP)`);
            console.log(`   - GET  /api/products/count`);
            console.log(`   - POST /api/products`);
            console.log(`💬 MCP Server: Unified architecture active`);
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

// Export the server class for use in other modules (legacy compatibility)
export { ShopifyMcpServer };

// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startServers();
}
