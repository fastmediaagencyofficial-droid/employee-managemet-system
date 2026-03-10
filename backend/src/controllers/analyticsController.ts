import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';
import { Parser } from 'json2csv';

/**
 * Get Executive Dashboard Stats
 * High-level overview of organization health
 */
export const getExecutiveStats = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Total Headcount and Dept Distribution
        const totalEmployees = await prisma.employee.count({
            where: { status: 'ACTIVE' }
        });

        const departmentStats = await prisma.employee.groupBy({
            by: ['departmentId'],
            where: { status: 'ACTIVE' },
            _count: true
        });

        // Fetch department names
        const deptIds = departmentStats.map(d => d.departmentId);
        const departments = await prisma.department.findMany({
            where: { id: { in: deptIds } }
        });

        const headcountByDept = departmentStats.map(stat => ({
            name: departments.find(d => d.id === stat.departmentId)?.name || 'Unknown',
            value: stat._count
        }));

        // 2. Attendance Rate (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const totalAttendanceRecords = await prisma.attendance.count({
            where: { date: { gte: thirtyDaysAgo } }
        });

        // This is a simplified calculation. Real attendance rate should assume:
        // (Total Present / (Total Employees * Working Days)) * 100
        // For now, we will return the raw count of 'PRESENT' statuses
        const presentCount = await prisma.attendance.count({
            where: {
                date: { gte: thirtyDaysAgo },
                status: 'PRESENT'
            }
        });

        const attendanceRate = totalAttendanceRecords > 0
            ? Math.round((presentCount / totalAttendanceRecords) * 100)
            : 0;

        // 3. Average Performance Score (Latest Reviews)
        const reviews = await prisma.review.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            select: { overallRating: true }
        });

        const avgPerformance = reviews.length > 0
            ? (reviews.reduce((acc, curr) => acc + curr.overallRating, 0) / reviews.length).toFixed(1)
            : 0;

        res.json({
            success: true,
            data: {
                totalEmployees,
                attendanceRate,
                avgPerformance,
                headcountByDept
            }
        });

    } catch (error) {
        logger.error('Get executive stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch executive stats'
        });
    }
};

/**
 * Get HR Analytics Stats
 * Detailed metrics for HR operations
 */
export const getHRStats = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Leave Status Distribution (Current Month)
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);

        const leaveStats = await prisma.leaveRequest.groupBy({
            by: ['status'],
            where: { createdAt: { gte: currentMonthStart } },
            _count: true
        });

        // 2. Review Cycle Status
        const activeCycle = await prisma.reviewCycle.findFirst({
            where: { status: 'ACTIVE' },
            include: {
                _count: {
                    select: { reviews: true }
                }
            }
        });

        res.json({
            success: true,
            data: {
                leaveDistribution: leaveStats,
                activeCycle: activeCycle || null
            }
        });

    } catch (error) {
        logger.error('Get HR stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch HR stats'
        });
    }
};

/**
 * Get Manager Stats
 * Team-specific performance and attendance
 */
export const getManagerStats = async (req: AuthRequest, res: Response) => {
    try {
        const managerId = req.user?.userId; // Assuming userId maps to an employee who is a manager

        // This requires the Employee model to have a 'managerId' or similar relation
        // OR we infer team by Department if the user is a Dept Manager
        // For now, returning a placeholder as the strict Team relationship might not be fully defined yet

        res.json({
            success: true,
            data: {
                message: "Manager analytics not yet fully implemented pending Team structure definition"
            }
        });

    } catch (error) {
        logger.error('Get Manager stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch manager stats'
        });
    }
};

/**
 * Custom Report Builder
 */
export const getCustomReport = async (req: AuthRequest, res: Response) => {
    try {
        const { metrics, dateRange, filters } = req.body;
        // In a real implementation, this would dynamically build a Prisma query
        // based on the selected metrics (e.g., "attendance", "performance", "turnover")

        // Mock response for now
        res.json({
            success: true,
            data: {
                reportId: Math.random().toString(36).substring(7),
                generatedAt: new Date(),
                metrics,
                results: [] // Placeholder for query results
            }
        });

    } catch (error) {
        logger.error('Custom report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate custom report'
        });
    }
};

/**
 * Export Analytics Data
 */
export const exportAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { type, format } = req.query; // type: 'attendance' | 'performance', format: 'csv' | 'json'

        let data: any[] = [];

        if (type === 'attendance') {
            data = await prisma.attendance.findMany({
                take: 1000,
                orderBy: { date: 'desc' },
                include: { employee: { select: { firstName: true, lastName: true, department: true } } }
            });
        } else if (type === 'performance') {
            data = await prisma.review.findMany({
                take: 1000,
                orderBy: { createdAt: 'desc' },
                include: { employee: { select: { firstName: true, lastName: true, department: true } } }
            });
        }

        if (format === 'csv') {
            const fields = type === 'attendance'
                ? ['date', 'status', 'employee.firstName', 'employee.lastName', 'employee.department.name']
                : ['period', 'overallRating', 'employee.firstName', 'employee.lastName', 'strengths'];

            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(data);

            res.header('Content-Type', 'text/csv');
            res.attachment(`${type}-report-${Date.now()}.csv`);
            return res.send(csv);
        }

        res.json({ success: true, data });

    } catch (error) {
        logger.error('Export analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export analytics'
        });
    }
};
