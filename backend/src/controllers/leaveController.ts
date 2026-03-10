import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';
import { sendLeaveStatusEmail } from '../services/emailService';

/**
 * Get all leave requests
 */
export const getAllLeaves = async (req: AuthRequest, res: Response) => {
    try {
        const { status, type, employeeId } = req.query;
        const user = req.user;

        const where: any = {};

        if (status) where.status = status;
        if (type) where.type = type;

        // Role-based filtering
        if (user?.role === 'EMPLOYEE') {
            // Find employee record for the current user
            const employee = await prisma.employee.findUnique({
                where: { userId: user.userId },
            });

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Employee record not found',
                });
            }

            where.employeeId = employee.id;
        } else {
            // Admin/HR can filter by specific employee
            if (employeeId) where.employeeId = employeeId;
        }

        const leaves = await prisma.leaveRequest.findMany({
            where,
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: leaves,
            total: leaves.length,
        });
    } catch (_error: any) {
        logger.error('Get all leaves error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave requests',
        });
    }
};

/**
 * Apply for leave
 */
export const applyLeave = async (req: AuthRequest, res: Response) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        // Get employee
        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Create leave request
        const leave = await prisma.leaveRequest.create({
            data: {
                employeeId: employee.id,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                status: 'PENDING',
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

        logger.info(`Leave request created: ${leave.id}`);

        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            data: leave,
        });
    } catch (_error: any) {
        logger.error('Apply leave error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply for leave',
        });
    }
};

/**
 * Approve leave request
 */
export const approveLeave = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const leave = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy: userId,
                approvedAt: new Date(),
            },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        logger.info(`Leave approved: ${leave.id}`);

        res.json({
            success: true,
            message: 'Leave request approved',
            data: leave,
        });
    } catch (_error: any) {
        logger.error('Approve leave error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve leave',
        });
    }
};

/**
 * Reject leave request
 */
export const rejectLeave = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const leave = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
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

        logger.info(`Leave rejected: ${leave.id}`);

        res.json({
            success: true,
            message: 'Leave request rejected',
            data: leave,
        });
    } catch (_error: any) {
        logger.error('Reject leave error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject leave',
        });
    }
};

/**
 * Get leave balance
 */
export const getLeaveBalance = async (req: AuthRequest, res: Response) => {
    try {
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

        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);

        const approvedLeaves = await prisma.leaveRequest.findMany({
            where: {
                employeeId: employee.id,
                status: 'APPROVED',
                startDate: {
                    gte: yearStart,
                    lte: yearEnd,
                },
            },
        });

        // Calculate days used
        const daysUsed = approvedLeaves.reduce((total, leave) => {
            const days = Math.ceil(
                (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
            return total + days;
        }, 0);

        // Default annual leave: 20 days
        const totalLeave = 20;
        const remaining = totalLeave - daysUsed;

        res.json({
            success: true,
            data: {
                total: totalLeave,
                used: daysUsed,
                remaining,
                year: currentYear,
            },
        });
    } catch (_error: any) {
        logger.error('Get leave balance error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave balance',
        });
    }
};

/**
 * Delete leave request
 */
export const deleteLeave = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.leaveRequest.delete({
            where: { id },
        });

        logger.info(`Leave deleted: ${id}`);

        res.json({
            success: true,
            message: 'Leave request cancelled',
        });
    } catch (_error: any) {
        logger.error('Delete leave error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel leave request',
        });
    }
};
