import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Token Blacklist Service
 * Manages blacklisted (revoked) tokens
 */

interface BlacklistedToken {
    token: string;
    expiresAt: Date;
}

// In-memory blacklist (for development - use Redis in production)
const tokenBlacklist = new Map<string, Date>();

/**
 * Add token to blacklist
 */
export const blacklistToken = async (token: string, expiresAt: Date): Promise<void> => {
    try {
        tokenBlacklist.set(token, expiresAt);
        logger.info('Token blacklisted successfully');

        // Clean up expired tokens periodically
        cleanupExpiredTokens();
    } catch (error) {
        logger.error('Error blacklisting token:', error);
        throw error;
    }
};

/**
 * Check if token is blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
    if (tokenBlacklist.has(token)) {
        const expiresAt = tokenBlacklist.get(token)!;

        // Check if blacklist entry has expired
        if (new Date() > expiresAt) {
            tokenBlacklist.delete(token);
            return false;
        }

        return true;
    }

    return false;
};

/**
 * Remove token from blacklist
 */
export const removeFromBlacklist = (token: string): void => {
    tokenBlacklist.delete(token);
};

/**
 * Clean up expired tokens from blacklist
 */
const cleanupExpiredTokens = (): void => {
    const now = new Date();
    let cleaned = 0;

    for (const [token, expiresAt] of tokenBlacklist.entries()) {
        if (now > expiresAt) {
            tokenBlacklist.delete(token);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        logger.info(`Cleaned ${cleaned} expired tokens from blacklist`);
    }
};

/**
 * Get blacklist size (for monitoring)
 */
export const getBlacklistSize = (): number => {
    return tokenBlacklist.size;
};

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
