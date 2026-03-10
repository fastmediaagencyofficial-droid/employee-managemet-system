import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

/**
 * Role-based access control middleware
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
        }

        next();
    };
};

/**
 * Admin only middleware
 */
export const adminOnly = roleMiddleware('ADMIN');

/**
 * HR and Admin middleware
 */
export const hrOrAdmin = roleMiddleware('HR', 'ADMIN');

/**
 * Manager, HR, and Admin middleware
 */
export const managerOrAbove = roleMiddleware('MANAGER', 'HR', 'ADMIN');

// Export requireRole as alias for roleMiddleware
export { roleMiddleware as requireRole };
