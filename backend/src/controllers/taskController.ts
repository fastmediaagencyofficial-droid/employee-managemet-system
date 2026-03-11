import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';
import { createNotification } from './notificationController';
import { getEmployeeIdFromUserId } from '../utils/employeeHelper';

/**
 * Create a new task (Manager/Admin only)
 */
export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, priority, category, assignedToId, dueDate, estimatedHours } = req.body;
        const userId = req.user?.userId;

        // Get employee ID from database
        const assignedById = userId ? await getEmployeeIdFromUserId(userId) : null;

        if (!assignedById) {
            return res.status(403).json({
                success: false,
                message: 'Employee record not found for this user',
            });
        }

        // Verify user is Manager, Admin, or HR
        if (req.user?.role !== 'MANAGER' && req.user?.role !== 'ADMIN' && req.user?.role !== 'HR') {
            return res.status(403).json({
                success: false,
                message: 'Only managers, admins, and HR can create tasks',
            });
        }

        // Verify assigned employee exists
        const assignedEmployee = await prisma.employee.findUnique({
            where: { id: assignedToId },
        });

        if (!assignedEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Assigned employee not found',
            });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                category,
                assignedToId,
                assignedById,
                dueDate: new Date(dueDate),
                estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        logger.info(`Task created: ${task.id} by ${assignedById}`);

        // Send notification to assigned employee
        try {
            const assignedUser = await prisma.user.findFirst({
                where: { employee: { employeeId: assignedToId } },
            });

            if (assignedUser) {
                await createNotification({
                    userId: assignedUser.id,
                    type: 'TASK_ASSIGNED',
                    title: 'New Task Assigned',
                    message: `You have been assigned a new task: "${title}"`,
                    relatedId: task.id,
                    relatedType: 'TASK',
                });
            }
        } catch (notifError) {
            logger.error('Failed to send task assignment notification:', notifError);
            // Don't fail the request if notification fails
        }

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task,
        });
    } catch (error: any) {
        logger.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message,
        });
    }
};

/**
 * Get all tasks (filtered by role)
 */
export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const { status, priority, assignedToId } = req.query;
        const userId = req.user?.userId;
        const role = req.user?.role;

        // Get employee ID from database for non-admin users
        const employeeId = userId ? await getEmployeeIdFromUserId(userId) : null;

        let where: any = {};

        // Role-based filtering
        if (role === 'EMPLOYEE') {
            // Employees only see their own tasks
            where.assignedToId = employeeId;
        } else if (role === 'MANAGER') {
            // Managers see tasks they created or assigned to their team
            const manager = await prisma.employee.findUnique({
                where: { id: employeeId },
                include: {
                    subordinates: {
                        select: { id: true },
                    },
                },
            });

            const teamIds = manager?.subordinates.map(s => s.id) || [];
            where.OR = [
                { assignedById: employeeId },
                { assignedToId: { in: [...teamIds, employeeId!] } },
            ];
        }
        // Admin sees all tasks

        // Additional filters
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (assignedToId) where.assignedToId = assignedToId;

        const tasks = await prisma.task.findMany({
            where,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        attachments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: tasks,
        });
    } catch (error: any) {
        logger.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message,
        });
    }
};

/**
 * Get task by ID
 */
export const getTaskById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;

        // Get employee ID from database for non-admin users
        const employeeId = userId ? await getEmployeeIdFromUserId(userId) : null;

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        position: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                comments: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                attachments: {
                    include: {
                        uploadedBy: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        // Check access permission
        if (role === 'EMPLOYEE' && task.assignedToId !== employeeId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        res.json({
            success: true,
            data: task,
        });
    } catch (error: any) {
        logger.error('Get task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task',
            error: error.message,
        });
    }
};

/**
 * Update task
 */
export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, priority, category, dueDate, estimatedHours } = req.body;
        const role = req.user?.role;

        // Only managers, admins, and HR can update task details
        if (role !== 'MANAGER' && role !== 'ADMIN' && role !== 'HR') {
            return res.status(403).json({
                success: false,
                message: 'Only managers, admins, and HR can update tasks',
            });
        }

        const task = await prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                priority,
                category,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        logger.info(`Task updated: ${id}`);

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    } catch (error: any) {
        logger.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message,
        });
    }
};

/**
 * Update task status
 */
export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, actualHours } = req.body;
        const userId = req.user?.userId;

        // Get employee ID from database
        const employeeId = userId ? await getEmployeeIdFromUserId(userId) : null;

        const task = await prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        // Employees can only update their own tasks
        if (req.user?.role === 'EMPLOYEE' && task.assignedToId !== employeeId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own tasks',
            });
        }

        const updateData: any = { status };

        // Set timestamps based on status
        if (status === 'IN_PROGRESS' && !task.startedAt) {
            updateData.startedAt = new Date();
        }
        if (status === 'COMPLETED') {
            updateData.completedAt = new Date();
            if (actualHours) {
                updateData.actualHours = parseFloat(actualHours);
            }
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        logger.info(`Task status updated: ${id} to ${status}`);

        // Send notification when task is completed
        if (status === 'COMPLETED' && task.assignedById) {
            try {
                const assignerUser = await prisma.user.findFirst({
                    where: { employee: { employeeId: task.assignedById } },
                });

                if (assignerUser) {
                    await createNotification({
                        userId: assignerUser.id,
                        type: 'TASK_COMPLETED',
                        title: 'Task Completed',
                        message: `${updatedTask.assignedTo.firstName} ${updatedTask.assignedTo.lastName} completed the task: "${task.title}"`,
                        relatedId: task.id,
                        relatedType: 'TASK',
                    });
                }
            } catch (notifError) {
                logger.error('Failed to send task completion notification:', notifError);
                // Don't fail the request if notification fails
            }
        }

        res.json({
            success: true,
            message: 'Task status updated successfully',
            data: updatedTask,
        });
    } catch (error: any) {
        logger.error('Update task status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task status',
            error: error.message,
        });
    }
};

/**
 * Delete task
 */
export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const role = req.user?.role;

        if (role !== 'MANAGER' && role !== 'ADMIN' && role !== 'HR') {
            return res.status(403).json({
                success: false,
                message: 'Only managers, admins, and HR can delete tasks',
            });
        }

        await prisma.task.delete({
            where: { id },
        });

        logger.info(`Task deleted: ${id}`);

        res.json({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (error: any) {
        logger.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message,
        });
    }
};

/**
 * Get my tasks (current user's tasks)
 */
export const getMyTasks = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        // Get employee ID from database
        const employeeId = userId ? await getEmployeeIdFromUserId(userId) : null;
        const { status } = req.query;

        if (!employeeId) {
            // Admin/HR users without an employee record have no personal tasks
            return res.json({
                success: true,
                data: [],
            });
        }

        const where: any = {
            assignedToId: employeeId,
        };

        if (status) where.status = status;

        const tasks = await prisma.task.findMany({
            where,
            include: {
                assignedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
            orderBy: [
                { status: 'asc' },
                { dueDate: 'asc' },
            ],
        });

        res.json({
            success: true,
            data: tasks,
        });
    } catch (error: any) {
        logger.error('Get my tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message,
        });
    }
};

/**
 * Get team tasks (Manager only)
 */
export const getTeamTasks = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (role !== 'MANAGER' && role !== 'ADMIN' && role !== 'HR') {
            return res.status(403).json({
                success: false,
                message: 'Only managers, admins, and HR can view team tasks',
            });
        }

        let tasks;

        // ADMIN and HR can see all tasks
        if (role === 'ADMIN' || role === 'HR') {
            tasks = await prisma.task.findMany({
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            attachments: true, // Added attachments count just in case
                        },
                    },
                },
                orderBy: {
                    dueDate: 'asc',
                },
            });
        } else {
            // Get employee ID from database for managers
            const employeeId = userId ? await getEmployeeIdFromUserId(userId) : null;

            if (!employeeId) {
                return res.status(404).json({
                    success: false,
                    message: 'Employee record not found',
                });
            }

            // Get manager's team
            const manager = await prisma.employee.findUnique({
                where: { id: employeeId },
                include: {
                    subordinates: {
                        select: { id: true },
                    },
                },
            });

            if (!manager) {
                return res.status(404).json({
                    success: false,
                    message: 'Manager record not found',
                });
            }

            const teamIds = manager.subordinates.map(s => s.id);

            tasks = await prisma.task.findMany({
                where: {
                    assignedToId: { in: teamIds },
                },
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                        },
                    },
                },
                orderBy: {
                    dueDate: 'asc',
                },
            });
        }

        res.json({
            success: true,
            data: tasks,
        });
    } catch (error: any) {
        logger.error('Get team tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team tasks',
            error: error.message,
        });
    }
};

/**
 * Get task statistics
 */
export const getTaskStatistics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        // Get employee ID from database for non-admin users
        const employeeId = userId ? await getEmployeeIdFromUserId(userId) : null;

        let where: any = {};

        if (role === 'EMPLOYEE') {
            where.assignedToId = employeeId;
        } else if (role === 'MANAGER') {
            const manager = await prisma.employee.findUnique({
                where: { id: employeeId },
                include: {
                    subordinates: {
                        select: { id: true },
                    },
                },
            });

            const teamIds = manager?.subordinates.map(s => s.id) || [];
            where.assignedToId = { in: [...teamIds, employeeId!] };
        }

        const [total, pending, inProgress, completed, overdue] = await Promise.all([
            prisma.task.count({ where }),
            prisma.task.count({ where: { ...where, status: 'PENDING' } }),
            prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
            prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
            prisma.task.count({
                where: {
                    ...where,
                    status: { not: 'COMPLETED' },
                    dueDate: { lt: new Date() },
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                total,
                pending,
                inProgress,
                completed,
                overdue,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            },
        });
    } catch (error: any) {
        logger.error('Get task statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task statistics',
            error: error.message,
        });
    }
};

/**
 * Add comment to task
 */
export const addTaskComment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const userId = req.user?.userId;

        // Get employee ID from database
        const employeeId = userId ? await getEmployeeIdFromUserId(userId) : null;

        if (!employeeId) {
            return res.status(403).json({
                success: false,
                message: 'Only employees can add comments',
            });
        }

        const taskComment = await prisma.taskComment.create({
            data: {
                taskId: id,
                employeeId,
                comment,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: taskComment,
        });
    } catch (error: any) {
        logger.error('Add task comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message,
        });
    }
};
