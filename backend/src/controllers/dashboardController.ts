import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalEmployees = await prisma.employee.count({
            where: { status: 'ACTIVE' },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const presentToday = await prisma.attendance.count({
            where: {
                date: {
                    gte: today,
                },
                status: 'PRESENT',
            },
        });

        const onLeave = await prisma.leaveRequest.count({
            where: {
                status: 'APPROVED',
                startDate: {
                    lte: new Date(),
                },
                endDate: {
                    gte: new Date(),
                },
            },
        });

        const pendingRequests = await prisma.leaveRequest.count({
            where: {
                status: 'PENDING',
            },
        });

        res.json({
            success: true,
            data: {
                totalEmployees,
                presentToday,
                onLeave,
                pendingRequests,
            },
        });
    } catch (_error: any) {
        logger.error('Get dashboard stats error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
        });
    }
};

/**
 * Get attendance trend (last 7 days)
 */
export const getAttendanceTrend = async (req: AuthRequest, res: Response) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const attendance = await prisma.attendance.groupBy({
            by: ['date', 'status'],
            where: {
                date: {
                    gte: sevenDaysAgo,
                },
            },
            _count: true,
        });

        // Format data for charts
        const trendData: Record<string, any> = {};

        attendance.forEach((record) => {
            const dateKey = record.date.toISOString().split('T')[0];
            if (!trendData[dateKey]) {
                trendData[dateKey] = { date: dateKey, present: 0, absent: 0 };
            }
            if (record.status === 'PRESENT') {
                trendData[dateKey].present = record._count;
            } else {
                trendData[dateKey].absent += record._count;
            }
        });

        const result = Object.values(trendData);

        res.json({
            success: true,
            data: result,
        });
    } catch (_error: any) {
        logger.error('Get attendance trend error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance trend',
        });
    }
};

/**
 * Get department distribution
 */
export const getDepartmentDistribution = async (req: AuthRequest, res: Response) => {
    try {
        const distribution = await prisma.employee.groupBy({
            by: ['departmentId'],
            where: {
                status: 'ACTIVE',
            },
            _count: true,
        });

        // Get department names
        const departmentIds = distribution.map((d) => d.departmentId);
        const departments = await prisma.department.findMany({
            where: {
                id: {
                    in: departmentIds,
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const result = distribution.map((d) => {
            const dept = departments.find((dep) => dep.id === d.departmentId);
            return {
                name: dept?.name || 'Unknown',
                value: d._count,
            };
        });

        res.json({
            success: true,
            data: result,
        });
    } catch (_error: any) {
        logger.error('Get department distribution error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch department distribution',
        });
    }
};

/**
 * Get recent activity
 */
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
    try {
        // Get recent attendance records
        const recentAttendance = await prisma.attendance.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Get recent leave requests
        const recentLeaves = await prisma.leaveRequest.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Combine and format
        const activities = [
            ...recentAttendance.map((a) => ({
                id: a.id,
                employee: `${a.employee.firstName} ${a.employee.lastName}`,
                action: `Marked attendance - ${a.status}`,
                time: a.createdAt,
            })),
            ...recentLeaves.map((l) => ({
                id: l.id,
                employee: `${l.employee.firstName} ${l.employee.lastName}`,
                action: `Submitted leave request - ${l.status}`,
                time: l.createdAt,
            })),
        ]
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, 10);

        res.json({
            success: true,
            data: activities,
        });
    } catch (_error: any) {
        logger.error('Get recent activity error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent activity',
        });
    }
};

/**
 * Get Admin Dashboard Metrics
 */
export const getAdminMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const role = req.user?.role;
        if (role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const totalEmployees = await prisma.employee.count();
        const activeEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });
        const totalDepartments = await prisma.department.count();
        const totalTasks = await prisma.task.count();
        const completedTasks = await prisma.task.count({ where: { status: 'COMPLETED' } });
        const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        res.json({ success: true, data: { totalEmployees, activeEmployees, totalDepartments, totalTasks, completedTasks, taskCompletionRate } });
    } catch (_error: any) {
        logger.error('Get admin metrics error:', _error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin metrics' });
    }
};

export const getHRMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const role = req.user?.role;
        if (role !== 'HR' && role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const totalEmployees = await prisma.employee.count();
        const activeEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });
        const pendingLeaves = await prisma.leaveRequest.count({ where: { status: 'PENDING' } });
        res.json({ success: true, data: { totalEmployees, activeEmployees, pendingLeaves, upcomingInterviews: 3, newHiresThisMonth: 5 } });
    } catch (_error: any) {
        logger.error('Get HR metrics error:', _error);
        res.status(500).json({ success: false, message: 'Failed to fetch HR metrics' });
    }
};

export const getManagerMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const role = req.user?.role;
        const userId = req.user?.userId;

        if (role !== 'MANAGER' && role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Get employee ID from database
        let employeeId: string | undefined;
        if (role !== 'ADMIN') {
            const employee = await prisma.employee.findFirst({
                where: { userId },
                select: { employeeId: true },
            });
            employeeId = employee?.employeeId;
        }

        const taskFilter = role === 'ADMIN' ? {} : { assignedById: employeeId };
        const totalTasks = await prisma.task.count({ where: taskFilter });
        const completedTasks = await prisma.task.count({ where: { ...taskFilter, status: 'COMPLETED' } });
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        res.json({ success: true, data: { totalTasks, completedTasks, completionRate } });
    } catch (_error: any) {
        logger.error('Get manager metrics error:', _error);
        res.status(500).json({ success: false, message: 'Failed to fetch manager metrics' });
    }
};

export const getEmployeeMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        // Get employee ID from database
        const employee = await prisma.employee.findFirst({
            where: { userId },
            select: { employeeId: true },
        });

        if (!employee) {
            return res.status(400).json({ success: false, message: 'Employee record not found' });
        }

        const employeeId = employee.employeeId;
        const totalTasks = await prisma.task.count({ where: { assignedToId: employeeId } });
        const completedTasks = await prisma.task.count({ where: { assignedToId: employeeId, status: 'COMPLETED' } });
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        res.json({ success: true, data: { tasks: { total: totalTasks, completed: completedTasks, completionRate } } });
    } catch (_error: any) {
        logger.error('Get employee metrics error:', _error);
        res.status(500).json({ success: false, message: 'Failed to fetch employee metrics' });
    }
};

export const getDashboardCharts = async (req: AuthRequest, res: Response) => {
    try {
        const mockData = { attendanceTrend: [], taskTrend: [], performanceByDepartment: [] };
        res.json({ success: true, data: mockData });
    } catch (_error: any) {
        logger.error('Get dashboard charts error:', _error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard charts' });
    }
};
