/**
 * Authentication Middleware for MCP Server
 *
 * HYBRID AUTHENTICATION APPROACH
 * ===============================
 *
 * This module implements a two-layer security model following OAuth 2.0 patterns:
 *
 * Layer 1: Bearer Token (MCP_API_KEY)
 * - Long-lived master credential
 * - Used to protect token generation endpoint
 * - Allows simple auth for development/testing
 * - Format: Authorization: Bearer <api_key>
 *
 * Layer 2: JWT Tokens
 * - Short-lived tokens (default: 15 minutes)
 * - Auto-expire for security
 * - Contain metadata (client, shop, timestamps)
 * - Format: Authorization: MCP <jwt_token>
 *
 * WHY HYBRID?
 * -----------
 * 1. Defense in Depth: Two security layers instead of one
 * 2. Limited Blast Radius: JWT compromise only valid 15 minutes
 * 3. Flexibility: Simple Bearer for dev, secure JWT for production
 * 4. Audit Trail: JWT contains client/shop metadata
 * 5. Credential Rotation: JWT rotates automatically, Bearer rotates manually
 *
 * USAGE PATTERNS
 * --------------
 * - Development: Use Bearer token directly (simple, no token management)
 * - Production: Use JWT tokens (auto-expiring, secure)
 * - Token Generation: Bearer token protects /api/auth/token endpoint
 * - Heroku Deploy: Bootstrap JWT (30 days) for initial setup
 *
 * Following the architectural patterns for JWT signing and verification
 */

import jwt from 'jsonwebtoken';

// JWT Configuration
if (process.env.JWT_SIGNATURE === undefined) {
    console.warn('⚠️  WARNING: JWT_SIGNATURE environment variable not set. JWT authentication will be disabled.');
}

const JWT_SIGNATURE = process.env.JWT_SIGNATURE;
const JWT_ALGORITHM = "HS256";

/**
 * Generate a JWT token for MCP access
 * Protected by MCP_API_KEY for security
 * Token automatically expires after the specified time
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export async function generateMCPToken(req, res, next) {
    try {
        // Check if JWT_SIGNATURE is configured
        if (!JWT_SIGNATURE) {
            return res.status(500).json({
                error: {
                    code: 'server_error',
                    message: 'JWT not configured on server'
                }
            });
        }

        // Verify MCP_API_KEY for token generation (security requirement)
        const apiKey = process.env.MCP_API_KEY;
        const authHeader = req.headers.authorization;

        if (!apiKey) {
            return res.status(500).json({
                error: {
                    code: 'server_error',
                    message: 'Server authentication not configured'
                }
            });
        }

        // Validate API key for token generation
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: {
                    code: 'unauthorized',
                    message: 'Missing or invalid Authorization header. Use: Bearer <api_key>'
                }
            });
        }

        const providedKey = authHeader.substring(7);
        if (providedKey !== apiKey) {
            return res.status(403).json({
                error: {
                    code: 'forbidden',
                    message: 'Invalid API key'
                }
            });
        }

        // Extract client identifier from request
        const clientId = req.body?.clientId || req.headers['x-client-id'] || 'default-client';
        const shopDomain = req.body?.shopDomain || req.headers['x-shop-domain'];
        const customExpiry = req.body?.expiresIn; // Allow custom expiration

        // Create token payload with issued time
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            clientId,
            shopDomain,
            service: "mcp-server",
            type: "access",
            iat: now // Issued at timestamp
        };

        // Token expires in 15 minutes by default (can be customized)
        // Supported formats: "15m", "1h", "7d", "30d"
        const expiresIn = customExpiry || "15m";

        // Sign the token with expiration - JWT automatically adds 'exp' claim
        const token = jwt.sign(payload, JWT_SIGNATURE, {
            expiresIn,
            algorithm: JWT_ALGORITHM
        });

        // Decode to get the actual expiration timestamp
        const decoded = jwt.decode(token);
        const expiresAt = new Date(decoded.exp * 1000).toISOString();
        const issuedAt = new Date(decoded.iat * 1000).toISOString();

        // Return token response with full expiration details
        const data = {
            token,
            token_type: "MCP",
            expires_in: expiresIn,
            expires_at: expiresAt,
            issued_at: issuedAt,
            expires_timestamp: decoded.exp,
            // Time remaining in seconds
            ttl: decoded.exp - now
        };

        console.log(`✅ JWT Token generated for ${clientId} - Expires at: ${expiresAt}`);

        return res.status(200).json(data);
    } catch (error) {
        return next(error);
    }
}

/**
 * Validate JWT token from Authorization header
 * Follows the validateWithMAIO pattern
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export async function validateWithJWT(req, res, next) {
    // Check for Authorization header
    if (typeof req.headers.authorization !== 'string') {
        return res.status(401).json({
            error: {
                code: 'unauthorized',
                message: 'Missing Authorization header'
            }
        });
    }

    // Parse token from Authorization header
    const authParts = req.headers.authorization.split(' ');
    if (authParts.length !== 2 || authParts[0] !== 'MCP') {
        return res.status(401).json({
            error: {
                code: 'unauthorized',
                message: 'Invalid Authorization header format. Expected: MCP <token>'
            }
        });
    }

    const token = authParts[1];

    // Verify JWT token - will automatically check expiration
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SIGNATURE, { algorithms: [JWT_ALGORITHM] });
    } catch (error) {
        // Handle JWT-specific errors
        if (error.name === 'TokenExpiredError') {
            // Token has expired - client must refresh
            const expiredAt = error.expiredAt ? new Date(error.expiredAt).toISOString() : 'unknown';
            console.warn(`⚠️  Expired token used - Expired at: ${expiredAt}`);
            return res.status(401).json({
                error: {
                    code: 'token_expired',
                    message: 'Token has expired. Please generate a new token.',
                    expired_at: expiredAt,
                    refresh_endpoint: '/api/auth/token'
                }
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: {
                    code: 'invalid_token',
                    message: 'Invalid token'
                }
            });
        } else if (error.name === 'NotBeforeError') {
            return res.status(401).json({
                error: {
                    code: 'token_not_active',
                    message: 'Token not yet active'
                }
            });
        } else {
            return next(error);
        }
    }

    // Attach decoded token data to request for use in route handlers
    req.tokenData = decoded;

    // Log token usage for monitoring
    const timeRemaining = decoded.exp - Math.floor(Date.now() / 1000);
    if (timeRemaining < 300) { // Less than 5 minutes remaining
        console.warn(`⚠️  Token for ${decoded.clientId} expires soon (${timeRemaining}s remaining)`);
    }

    // Validation successful
    return next();
}

/**
 * Validate Bearer API key (legacy authentication method)
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export async function validateWithAPIKey(req, res, next) {
    const apiKey = process.env.MCP_API_KEY;

    // Require API key to be configured
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
    if (typeof req.headers.authorization !== 'string') {
        return res.status(401).json({
            error: {
                code: 'unauthorized',
                message: 'Missing Authorization header'
            }
        });
    }

    // Parse Bearer token
    const authParts = req.headers.authorization.split(' ');
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
        return res.status(401).json({
            error: {
                code: 'unauthorized',
                message: 'Invalid Authorization header format. Expected: Bearer <token>'
            }
        });
    }

    const token = authParts[1];

    // Validate API key
    if (token !== apiKey) {
        return res.status(403).json({
            error: {
                code: 'forbidden',
                message: 'Invalid API key'
            }
        });
    }

    // Authentication successful
    return next();
}

/**
 * Unified authentication middleware
 * Supports both JWT (MCP) and Bearer (API Key) authentication
 * Follows the validateWithC2CorMAIO pattern
 *
 * HYBRID AUTHENTICATION ROUTING
 * =============================
 *
 * This function routes to the appropriate authentication method based on
 * the Authorization header prefix:
 *
 * - "Bearer <key>" → validateWithAPIKey (long-lived, simple)
 * - "MCP <token>" → validateWithJWT (short-lived, secure)
 *
 * The client chooses which method to use. Both are valid, but JWT is
 * recommended for production due to automatic expiration.
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export async function authenticateMCP(req, res, next) {
    // Skip auth in development if no credentials are set
    if (process.env.NODE_ENV === 'development' && !process.env.MCP_API_KEY && !JWT_SIGNATURE) {
        console.warn('⚠️  WARNING: No authentication configured. Authentication disabled for development.');
        return next();
    }

    // Check for Authorization header
    if (typeof req.headers.authorization !== 'string') {
        return res.status(401).json({
            error: {
                code: 'unauthorized',
                message: 'Missing Authorization header'
            }
        });
    }

    // Determine authentication type based on prefix
    const authParts = req.headers.authorization.split(' ');

    if (authParts[0] === 'Bearer') {
        // Use API Key authentication
        return validateWithAPIKey(req, res, next);
    } else if (authParts[0] === 'MCP') {
        // Use JWT authentication
        if (!JWT_SIGNATURE) {
            return res.status(500).json({
                error: {
                    code: 'server_error',
                    message: 'JWT authentication not configured'
                }
            });
        }
        return validateWithJWT(req, res, next);
    } else {
        return res.status(401).json({
            error: {
                code: 'unauthorized',
                message: 'Invalid Authorization header format. Expected: Bearer <token> or MCP <token>'
            }
        });
    }
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

/**
 * Introspect and validate JWT token status
 * Checks if token is valid and provides expiration information
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
 */
export async function introspectToken(req, res) {
    try {
        if (!JWT_SIGNATURE) {
            return res.status(500).json({
                error: {
                    code: 'server_error',
                    message: 'JWT not configured on server'
                }
            });
        }

        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(400).json({
                error: {
                    code: 'missing_token',
                    message: 'No Authorization header provided'
                }
            });
        }

        const authParts = authHeader.split(' ');
        if (authParts.length !== 2 || authParts[0] !== 'MCP') {
            return res.status(400).json({
                error: {
                    code: 'invalid_format',
                    message: 'Invalid Authorization header format. Expected: MCP <token>'
                }
            });
        }

        const token = authParts[1];

        // Try to decode without verification first to get claims
        const decoded = jwt.decode(token);
        if (!decoded) {
            return res.status(400).json({
                active: false,
                error: 'Invalid token format'
            });
        }

        // Now verify the token
        try {
            jwt.verify(token, JWT_SIGNATURE, { algorithms: [JWT_ALGORITHM] });

            // Token is valid
            const now = Math.floor(Date.now() / 1000);
            const timeRemaining = decoded.exp - now;

            return res.status(200).json({
                active: true,
                token_type: "MCP",
                client_id: decoded.clientId,
                shop_domain: decoded.shopDomain,
                service: decoded.service,
                issued_at: new Date(decoded.iat * 1000).toISOString(),
                expires_at: new Date(decoded.exp * 1000).toISOString(),
                expires_in_seconds: timeRemaining,
                expires_soon: timeRemaining < 300 // Less than 5 minutes
            });
        } catch (error) {
            // Token is invalid or expired
            if (error.name === 'TokenExpiredError') {
                return res.status(200).json({
                    active: false,
                    expired: true,
                    expired_at: new Date(error.expiredAt).toISOString(),
                    message: 'Token has expired. Generate a new token at /api/auth/token'
                });
            } else {
                return res.status(200).json({
                    active: false,
                    error: error.message
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            error: {
                code: 'introspection_error',
                message: error.message
            }
        });
    }
}

/**
 * Public access middleware (no authentication required)
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export async function openToPublic(req, res, next) {
    return next();
}
