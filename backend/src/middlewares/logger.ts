import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';

const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Create logs directory if it doesn't exist and not on Vercel
const logsDir = path.join(process.cwd(), 'logs');
if (!isVercel && !fs.existsSync(logsDir)) {
    try {
        fs.mkdirSync(logsDir, { recursive: true });
    } catch (error) {
        console.error('Failed to create logs directory:', error);
    }
}

const transportsList: any[] = [
    // Write all logs to console
    new transports.Console({
        format: format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
        ),
    }),
];

// Only add file transports if not on Vercel
if (!isVercel) {
    try {
        transportsList.push(
            new transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
            new transports.File({ filename: path.join(logsDir, 'combined.log') })
        );
    } catch (error) {
        console.error('Failed to initialize file transports:', error);
    }
}

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'employee-management-api' },
    transports: transportsList,
});

export default logger;
