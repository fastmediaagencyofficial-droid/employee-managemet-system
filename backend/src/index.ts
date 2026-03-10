import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import logger from './middlewares/logger';
import { initializeScheduledJobs } from './services/scheduledJobs';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Employee Management API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log('🚀 ========================================');

    // Initialize scheduled jobs
    initializeScheduledJobs();
});

export default app;
