import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-super-secret-refresh-token-change-this';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
    // @ts-ignore - jsonwebtoken types issue
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
    // @ts-ignore - jsonwebtoken types issue
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
    try {
        if (JWT_SECRET === 'your-secret-key-change-this-in-production') {
            console.warn('⚠️ WARNING: Using default JWT_SECRET. This is insecure and can cause issues if multiple instances are running.');
        }
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            console.log('JWT Error: Token has expired at', error.expiredAt);
        } else {
            console.log('JWT Error:', error.message);
        }
        return null;
    }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload | null => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
    } catch (_error) {
        return null;
    }
};

/**
 * Decode token without verification
 */
export const decodeToken = (token: string): JWTPayload | null => {
    try {
        return jwt.decode(token) as JWTPayload;
    } catch (_error) {
        return null;
    }
};
