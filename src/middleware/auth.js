/**
 * Authentication Middleware for MCP Server
 * Validates Bearer token for remote access
 */

/**
 * Authenticate MCP requests using Bearer token
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export function authenticateMCP(req, res, next) {
    const apiKey = process.env.MCP_API_KEY;

    // Skip auth in development if no key is set
    if (process.env.NODE_ENV === 'development' && !apiKey) {
        console.warn('⚠️  WARNING: MCP_API_KEY not set. Authentication disabled for development.');
        return next();
    }

    // Require API key in production
    if (!apiKey) {
        console.error('❌ MCP_API_KEY not configured');
        return res.status(500).json({
            error: {
                code: 'server_error',
                message: 'Server not configured properly'
            }
        });
    }

    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            error: {
                code: 'unauthorized',
                message: 'Missing Authorization header'
            }
        });
    }

    // Validate Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: {
                code: 'unauthorized',
                message: 'Invalid Authorization header format. Expected: Bearer <token>'
            }
        });
    }

    // Extract and validate token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    if (token !== apiKey) {
        return res.status(403).json({
            error: {
                code: 'forbidden',
                message: 'Invalid API key'
            }
        });
    }

    // Authentication successful
    next();
}

/**
 * Optional: Rate limiting middleware (basic implementation)
 * For production, consider using express-rate-limit package
 */
const requestCounts = new Map();

export function rateLimitMCP(req, res, next) {
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 100; // 100 requests per minute

    if (!requestCounts.has(clientIp)) {
        requestCounts.set(clientIp, []);
    }

    const requests = requestCounts.get(clientIp);
    // Remove old requests outside the time window
    const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);

    if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
            error: {
                code: 'rate_limit_exceeded',
                message: 'Too many requests. Please try again later.'
            }
        });
    }

    recentRequests.push(now);
    requestCounts.set(clientIp, recentRequests);

    next();
}

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
    const now = Date.now();
    const windowMs = 60000;

    for (const [ip, requests] of requestCounts.entries()) {
        const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
        if (recentRequests.length === 0) {
            requestCounts.delete(ip);
        } else {
            requestCounts.set(ip, recentRequests);
        }
    }
}, 60000); // Clean up every minute
