import cron from 'node-cron';
import prisma from '../config/database';
import logger from '../middlewares/logger';
import { createNotification } from '../controllers/notificationController';

/**
 * Check for tasks with upcoming deadlines and send notifications
 * Runs daily at 9:00 AM
 */
export const scheduleDeadlineNotifications = () => {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        try {
            logger.info('Running deadline notification check...');

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

            // Find tasks due tomorrow that are not completed
            const upcomingTasks = await prisma.task.findMany({
                where: {
                    dueDate: {
                        gte: tomorrow,
                        lt: dayAfterTomorrow,
                    },
                    status: {
                        not: 'COMPLETED',
                    },
                },
                include: {
                    assignedTo: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            logger.info(`Found ${upcomingTasks.length} tasks due tomorrow`);

            // Send notifications for each task
            for (const task of upcomingTasks) {
                if (task.assignedTo.user) {
                    try {
                        await createNotification({
                            userId: task.assignedTo.user.id,
                            type: 'TASK_DEADLINE',
                            title: 'Task Deadline Tomorrow',
                            message: `Reminder: "${task.title}" is due tomorrow (${task.dueDate.toLocaleDateString()})`,
                            relatedId: task.id,
                            relatedType: 'TASK',
                        });

                        logger.info(`Sent deadline notification for task ${task.id} to user ${task.assignedTo.user.id}`);
                    } catch (error) {
                        logger.error(`Failed to send deadline notification for task ${task.id}:`, error);
                    }
                }
            }

            logger.info('Deadline notification check completed');
        } catch (error) {
            logger.error('Error in deadline notification job:', error);
        }
    });

    logger.info('Deadline notification scheduler initialized (runs daily at 9:00 AM)');
};

/**
 * Check for overdue tasks and send notifications
 * Runs daily at 10:00 AM
 */
export const scheduleOverdueNotifications = () => {
    // Run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        try {
            logger.info('Running overdue task notification check...');

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find tasks that are overdue
            const overdueTasks = await prisma.task.findMany({
                where: {
                    dueDate: {
                        lt: today,
                    },
                    status: {
                        notIn: ['COMPLETED', 'CANCELLED'],
                    },
                },
                include: {
                    assignedTo: {
                        include: {
                            user: true,
                        },
                    },
                    assignedBy: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            logger.info(`Found ${overdueTasks.length} overdue tasks`);

            // Send notifications to both assignee and assigner
            for (const task of overdueTasks) {
                // Notify assignee
                if (task.assignedTo.user) {
                    try {
                        await createNotification({
                            userId: task.assignedTo.user.id,
                            type: 'TASK_DEADLINE',
                            title: 'Overdue Task',
                            message: `Task "${task.title}" is overdue (was due ${task.dueDate.toLocaleDateString()})`,
                            relatedId: task.id,
                            relatedType: 'TASK',
                        });
                    } catch (error) {
                        logger.error(`Failed to send overdue notification to assignee for task ${task.id}:`, error);
                    }
                }

                // Notify assigner (manager)
                if (task.assignedBy?.user) {
                    try {
                        await createNotification({
                            userId: task.assignedBy.user.id,
                            type: 'TASK_DEADLINE',
                            title: 'Team Task Overdue',
                            message: `Task "${task.title}" assigned to ${task.assignedTo.firstName} ${task.assignedTo.lastName} is overdue`,
                            relatedId: task.id,
                            relatedType: 'TASK',
                        });
                    } catch (error) {
                        logger.error(`Failed to send overdue notification to assigner for task ${task.id}:`, error);
                    }
                }
            }

            logger.info('Overdue task notification check completed');
        } catch (error) {
            logger.error('Error in overdue notification job:', error);
        }
    });

    logger.info('Overdue notification scheduler initialized (runs daily at 10:00 AM)');
};

/**
 * Initialize all scheduled jobs
 */
export const initializeScheduledJobs = () => {
    scheduleDeadlineNotifications();
    scheduleOverdueNotifications();
    logger.info('All scheduled jobs initialized');
};
