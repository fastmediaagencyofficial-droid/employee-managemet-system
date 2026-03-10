import { Request, Response, NextFunction } from 'express';
import logger from './logger';

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log error
    logger.error({
        message: err.message,
        stack: err.stack,
        url: _req.url,
        method: _req.method,
        ip: _req.ip,
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

/**
 * 404 Not Found handler
 */
// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
        debug: {
            originalUrl: req.originalUrl,
            path: req.path,
            baseUrl: req.baseUrl,
            headers: process.env.NODE_ENV === 'development' ? req.headers : undefined
        }
    });
};

/**
 * Async handler wrapper
 * Catches errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
