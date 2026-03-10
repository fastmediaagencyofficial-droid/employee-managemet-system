import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { isTokenBlacklisted } from '../services/tokenBlacklist';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer' prefix

        // Check if token is blacklisted
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({
                success: false,
                message: 'Token has been revoked',
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            console.log('Token verification failed for token:', token.substring(0, 20) + '...');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                code: 'TOKEN_EXPIRED',
            });
        }

        // Attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuthMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyAccessToken(token);

            if (decoded) {
                req.user = decoded;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Export as both authMiddleware and authenticate
export { authMiddleware as authenticate };
export default authMiddleware;
