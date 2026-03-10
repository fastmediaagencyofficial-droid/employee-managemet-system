import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get employee performance data
 */
export const getEmployeePerformance = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const performance = await prisma.performance.findMany({
            where: {
                employeeId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        const goals = await prisma.goal.findMany({
            where: {
                employeeId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const reviews = await prisma.review.findMany({
            where: {
                employeeId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 5,
        });

        res.json({
            success: true,
            data: {
                performance,
                goals,
                reviews,
            },
        });
    } catch (_error: any) {
        logger.error('Get employee performance error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee performance',
        });
    }
};

/**
 * Get employee attendance data
 */
export const getEmployeeAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const where: any = {
            employeeId: id,
        };

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            orderBy: {
                date: 'desc',
            },
        });

        // Calculate statistics
        const totalDays = attendance.length;
        const presentDays = attendance.filter((a) => a.status === 'PRESENT').length;
        const absentDays = attendance.filter((a) => a.status === 'ABSENT').length;
        const lateDays = attendance.filter((a) => a.status === 'LATE').length;
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        res.json({
            success: true,
            data: {
                attendance,
                statistics: {
                    totalDays,
                    presentDays,
                    absentDays,
                    lateDays,
                    attendanceRate: Math.round(attendanceRate * 100) / 100,
                },
            },
        });
    } catch (_error: any) {
        logger.error('Get employee attendance error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee attendance',
        });
    }
};
