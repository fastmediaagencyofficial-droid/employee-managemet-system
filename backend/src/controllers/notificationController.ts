import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Create a notification (internal function)
 */
export const createNotification = async (data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
}) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type as any,
                title: data.title,
                message: data.message,
                relatedId: data.relatedId,
                relatedType: data.relatedType,
            },
        });
        return notification;
    } catch (error) {
        logger.error('Create notification error:', error);
        throw error;
    }
};

/**
 * Get user's notifications
 * @route GET /api/notifications
 * @access Private
 */
export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { limit = '20', unreadOnly = 'false' } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found',
            });
        }

        const where: any = { userId };
        if (unreadOnly === 'true') {
            where.isRead = false;
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string),
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false },
        });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
            },
        });
    } catch (_error: any) {
        logger.error('Get notifications error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
        });
    }
};

/**
 * Mark notification as read
 * @route PATCH /api/notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found',
            });
        }

        // Verify notification belongs to user
        const notification = await prisma.notification.findFirst({
            where: { id, userId },
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        res.json({
            success: true,
            data: updated,
        });
    } catch (_error: any) {
        logger.error('Mark as read error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
        });
    }
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 * @access Private
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found',
            });
        }

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (_error: any) {
        logger.error('Mark all as read error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
        });
    }
};

/**
 * Delete notification
 * @route DELETE /api/notifications/:id
 * @access Private
 */
export const deleteNotification = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found',
            });
        }

        // Verify notification belongs to user
        const notification = await prisma.notification.findFirst({
            where: { id, userId },
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        await prisma.notification.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (_error: any) {
        logger.error('Delete notification error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
        });
    }
};

/**
 * Get unread count
 * @route GET /api/notifications/unread-count
 * @access Private
 */
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found',
            });
        }

        const count = await prisma.notification.count({
            where: { userId, isRead: false },
        });

        res.json({
            success: true,
            data: { count },
        });
    } catch (_error: any) {
        logger.error('Get unread count error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
        });
    }
};
