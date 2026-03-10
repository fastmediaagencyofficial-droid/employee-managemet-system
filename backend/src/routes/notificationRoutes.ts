import { Router } from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
} from '../controllers/notificationController';
import { authenticate } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', asyncHandler(getNotifications));

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', asyncHandler(getUnreadCount));

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', asyncHandler(markAllAsRead));

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:id/read', asyncHandler(markAsRead));

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', asyncHandler(deleteNotification));

export default router;
