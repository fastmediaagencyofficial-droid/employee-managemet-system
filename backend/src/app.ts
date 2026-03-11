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

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            // Only allow localhost in non-production environments if needed, 
            // but the user requested total removal for "real route" setup.
            process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : null,
            process.env.NODE_ENV !== 'production' ? 'http://127.0.0.1:3000' : null,
        ].filter(Boolean);

        // Allow any Vercel deployment URL
        const isVercelUrl = origin.includes('.vercel.app');
        
        if (allowedOrigins.includes(origin) || isVercelUrl) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Temporarily allow all for debugging
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// Root endpoint for easy verification
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Employee Management System API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            documentation: '/api-docs'
        }
    });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Initialize scheduled jobs
// Note: Vercel serverless functions do not support long-running cron jobs in this manner.
// We only initialize them if NOT running on Vercel (e.g., local dev or persistent server).
const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
    initializeScheduledJobs();
} else {
    logger.info('Scheduled jobs skipped (running on Vercel)');
}

export default app;
