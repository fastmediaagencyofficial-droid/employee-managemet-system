import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get all goals
 */
export const getAllGoals = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { employeeId } = req.query;

        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            return res.json({
                success: true,
                data: [],
            });
        }

        const where: any = {};
        if (employeeId) {
            where.employeeId = employeeId;
        } else {
            where.employeeId = employee.id;
        }

        const goals = await prisma.goal.findMany({
            where,
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: goals,
        });
    } catch (_error: any) {
        logger.error('Get goals error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch goals',
        });
    }
};

/**
 * Create goal
 */
export const createGoal = async (req: AuthRequest, res: Response) => {
    try {
        const {
            title,
            description,
            category,
            type,
            targetValue,
            currentValue,
            progress,
            status,
            priority,
            dueDate,
            departmentId // New field
        } = req.body;
        const userId = req.user?.userId;

        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const goal = await prisma.goal.create({
            data: {
                employeeId: employee.id,
                departmentId: departmentId || (category === 'DEPARTMENT' ? employee.departmentId : null),
                title,
                description,
                category: category || 'INDIVIDUAL',
                type: type || 'QUALITATIVE',
                targetValue,
                currentValue,
                progress: progress || 0,
                status: status || 'NOT_STARTED',
                priority: priority || 'MEDIUM',
                dueDate: new Date(dueDate),
            },
        });

        logger.info(`Goal created: ${goal.id}`);

        res.status(201).json({
            success: true,
            message: 'Goal created successfully',
            data: goal,
        });
    } catch (_error: any) {
        logger.error('Create goal error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to create goal',
        });
    }
};

/**
 * Get single goal
 */
export const getGoal = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const goal = await prisma.goal.findUnique({
            where: { id },
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found',
            });
        }

        res.json({
            success: true,
            data: goal,
        });
    } catch (_error: any) {
        logger.error('Get goal error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch goal',
        });
    }
};

/**
 * Update goal
 */
export const updateGoal = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.dueDate) {
            updateData.dueDate = new Date(updateData.dueDate);
        }

        // Logic to record completion time and assess if it's on time
        if (updateData.status === 'COMPLETED') {
            updateData.completedAt = new Date();

            // Check if it was overdue
            const currentGoal = await prisma.goal.findUnique({ where: { id } });
            if (currentGoal && currentGoal.dueDate) {
                if (updateData.completedAt > currentGoal.dueDate) {
                    // It was finished late - we could mark it as OVERDUE status?
                    // Or just keep COMPLETED but note the date difference.
                    // For now, let's just make sure completedAt is set.
                }
            }
        } else if (updateData.status && updateData.status !== 'COMPLETED') {
            // If they move it back from completed, clear the date
            updateData.completedAt = null;
        }

        const goal = await prisma.goal.update({
            where: { id },
            data: updateData,
        });

        logger.info(`Goal updated: ${goal.id}`);

        res.json({
            success: true,
            message: 'Goal updated successfully',
            data: goal,
        });
    } catch (_error: any) {
        logger.error('Update goal error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to update goal',
        });
    }
};

/**
 * Delete goal
 */
export const deleteGoal = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.goal.delete({
            where: { id },
        });

        logger.info(`Goal deleted: ${id}`);

        res.json({
            success: true,
            message: 'Goal deleted successfully',
        });
    } catch (_error: any) {
        logger.error('Delete goal error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete goal',
        });
    }
};

/**
 * Get performance metrics with on-time indicators
 */
export const getPerformanceMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            return res.json({
                success: true,
                data: {
                    goals: { total: 0, completed: 0, inProgress: 0, onTime: 0, late: 0, averageProgress: 0 },
                    reviews: { total: 0, averageRating: 0, recent: [] },
                },
            });
        }

        const goals = await prisma.goal.findMany({
            where: { employeeId: employee.id },
        });

        const totalGoals = goals.length;
        const completedGoals = goals.filter((g) => g.status === 'COMPLETED');
        const completedCount = completedGoals.length;
        const inProgressGoals = goals.filter((g) => g.status === 'IN_PROGRESS').length;

        // Calculate on-time vs late
        const onTimeGoals = completedGoals.filter(g =>
            g.completedAt && g.dueDate && new Date(g.completedAt) <= new Date(g.dueDate)
        ).length;

        const lateGoals = completedCount - onTimeGoals;

        const averageProgress = totalGoals > 0
            ? goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals
            : 0;

        const reviews = await prisma.review.findMany({
            where: { employeeId: employee.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
            : 0;

        res.json({
            success: true,
            data: {
                goals: {
                    total: totalGoals,
                    completed: completedCount,
                    inProgress: inProgressGoals,
                    onTime: onTimeGoals,
                    late: lateGoals,
                    averageProgress: Math.round(averageProgress),
                },
                reviews: {
                    total: reviews.length,
                    averageRating: Math.round(averageRating * 10) / 10,
                    recent: reviews,
                },
            },
        });
    } catch (_error: any) {
        logger.error('Get performance metrics error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance metrics',
        });
    }
};

/**
 * Get performance trends (last 6 months)
 */
export const getPerformanceTrends = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            const emptyTrends = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                emptyTrends.push({
                    month: date.toLocaleString('default', { month: 'short' }),
                    completed: 0,
                    avgRating: 0,
                });
            }
            return res.json({ success: true, data: emptyTrends });
        }

        // Get goals completed in each of the last 6 months
        const trends = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();

            const startOfMonth = new Date(year, date.getMonth(), 1);
            const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59);

            const completedInMonth = await prisma.goal.count({
                where: {
                    employeeId: employee.id,
                    status: 'COMPLETED',
                    completedAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });

            // Average rating of reviews in this month
            const reviewsInMonth = await prisma.review.aggregate({
                where: {
                    employeeId: employee.id,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
                _avg: {
                    overallRating: true,
                },
            });

            trends.push({
                month,
                completed: completedInMonth,
                avgRating: reviewsInMonth._avg.overallRating || 0,
            });
        }

        res.json({
            success: true,
            data: trends,
        });
    } catch (_error: any) {
        logger.error('Get performance trends error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance trends',
        });
    }
};
