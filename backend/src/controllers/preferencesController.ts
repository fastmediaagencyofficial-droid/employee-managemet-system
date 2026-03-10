import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get user preferences
 */
export const getPreferences = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        let preferences = await prisma.userPreferences.findUnique({
            where: { userId: req.user.userId },
        });

        // Create default preferences if they don't exist
        if (!preferences) {
            preferences = await prisma.userPreferences.create({
                data: {
                    userId: req.user.userId,
                },
            });
        }

        res.json({
            success: true,
            data: preferences,
        });
    } catch (error: any) {
        logger.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch preferences',
        });
    }
};

/**
 * Update user preferences
 */
export const updatePreferences = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const {
            emailNotifications,
            leaveRequestUpdates,
            performanceReviews,
            theme
        } = req.body;

        // Upsert preferences (create if not exists, update if exists)
        const preferences = await prisma.userPreferences.upsert({
            where: { userId: req.user.userId },
            update: {
                ...(emailNotifications !== undefined && { emailNotifications }),
                ...(leaveRequestUpdates !== undefined && { leaveRequestUpdates }),
                ...(performanceReviews !== undefined && { performanceReviews }),
                ...(theme && { theme }),
            },
            create: {
                userId: req.user.userId,
                emailNotifications: emailNotifications ?? true,
                leaveRequestUpdates: leaveRequestUpdates ?? true,
                performanceReviews: performanceReviews ?? true,
                theme: theme ?? 'system',
            },
        });

        logger.info(`Preferences updated for user: ${req.user.userId}`);

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: preferences,
        });
    } catch (error: any) {
        logger.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences',
        });
    }
};
