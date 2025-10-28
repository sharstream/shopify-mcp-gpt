/**
 * CORS Middleware for MCP Server
 * Handles cross-origin requests for remote MCP access
 */

/**
 * Configure CORS for MCP endpoints
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export function configureMcpCors(req, res, next) {
    // Allow Claude Code and other MCP clients to access the server
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://claude.ai',
        'https://api.anthropic.com',
        // Add your production domain if you have one
        process.env.HEROKU_APP_URL || ''
    ].filter(Boolean);

    const origin = req.headers.origin;

    // For MCP endpoints, we need to be permissive with origins
    // since MCP clients may come from various sources
    if (req.path.startsWith('/api/mcp') || req.path.startsWith('/sse')) {
        // Allow all origins for MCP endpoints (auth is handled by Bearer token)
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Allow required methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // Allow required headers
    res.setHeader('Access-Control-Allow-Headers', [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Requested-With',
        'X-MCP-Client-Version'
    ].join(', '));

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
        return res.status(204).end();
    }

    next();
}

/**
 * Security headers middleware
 * Adds security headers for production deployment
 */
export function securityHeaders(req, res, next) {
    // Only add security headers in production
    if (process.env.NODE_ENV === 'production') {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');

        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Enable XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // For SSE endpoints, set appropriate content type
        if (req.path.includes('/sse')) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
        }
    }

    next();
}
