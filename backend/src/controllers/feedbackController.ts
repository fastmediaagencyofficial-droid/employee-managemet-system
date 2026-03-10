import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';
import { analyzeSentiment } from '../services/aiService';

/**
 * Get all feedback
 */
export const getAllFeedback = async (req: AuthRequest, res: Response) => {
    try {
        const feedback = await prisma.feedback.findMany({
            include: {
                from: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                to: {
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
            data: feedback,
        });
    } catch (_error: any) {
        logger.error('Get feedback error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feedback',
        });
    }
};

/**
 * Give feedback
 */
export const giveFeedback = async (req: AuthRequest, res: Response) => {
    try {
        const { toEmployeeId, type, rating, comment, anonymous } = req.body;
        const userId = req.user?.userId;

        const fromEmployee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!fromEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Analyze sentiment asynchronously (or await if critical)
        let sentiment = { score: 0, label: 'Neutral' };
        if (comment) {
            try {
                sentiment = await analyzeSentiment(comment);
            } catch (err) {
                logger.warn('Sentiment analysis failed during feedback creation', err);
            }
        }

        const feedback = await prisma.feedback.create({
            data: {
                fromId: fromEmployee.id,
                toId: toEmployeeId,
                type,
                rating,
                comment,
                isAnonymous: anonymous || false,
                sentimentScore: sentiment.score,
                sentimentLabel: sentiment.label
            },
        });

        logger.info(`Feedback given: ${feedback.id}`);

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback,
        });
    } catch (_error: any) {
        logger.error('Give feedback error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit feedback',
        });
    }
};

/**
 * Get received feedback
 */
export const getReceivedFeedback = async (req: AuthRequest, res: Response) => {
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

        const feedback = await prisma.feedback.findMany({
            where: {
                toId: employee.id,
            },
            include: {
                from: {
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

        // Hide sender info for anonymous feedback
        const processedFeedback = feedback.map((f) => ({
            ...f,
            from: f.isAnonymous ? null : f.from,
        }));

        res.json({
            success: true,
            data: processedFeedback,
        });
    } catch (_error: any) {
        logger.error('Get received feedback error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch received feedback',
        });
    }
};

/**
 * Get given feedback
 */
export const getGivenFeedback = async (req: AuthRequest, res: Response) => {
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

        const feedback = await prisma.feedback.findMany({
            where: {
                fromId: employee.id,
            },
            include: {
                to: {
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
            data: feedback,
        });
    } catch (_error: any) {
        logger.error('Get given feedback error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch given feedback',
        });
    }
};

/**
 * Get feedback analytics
 */
export const getFeedbackAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const employee = await prisma.employee.findUnique({
            where: { userId }
        });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Fetch all feedback received by this employee
        const feedback = await prisma.feedback.findMany({
            where: { toId: employee.id }
        });

        // 1. Sentiment Distribution
        const sentimentDistribution = {
            Positive: 0,
            Neutral: 0,
            Negative: 0
        };

        // 2. Average Rating
        let totalRating = 0;
        let countWithRating = 0;

        feedback.forEach(f => {
            // Sentiment
            const label = f.sentimentLabel || 'Neutral';
            if (label in sentimentDistribution) {
                sentimentDistribution[label as keyof typeof sentimentDistribution]++;
            } else {
                sentimentDistribution['Neutral']++;
            }

            // Rating
            if (f.rating) {
                totalRating += f.rating;
                countWithRating++;
            }
        });

        const avgRating = countWithRating > 0 ? (totalRating / countWithRating).toFixed(1) : 0;

        // 3. Feedback Volume over Time (Last 6 months)
        // Group by month... simplified for now

        res.json({
            success: true,
            data: {
                totalFeedback: feedback.length,
                avgRating,
                sentimentDistribution: [
                    { name: 'Positive', value: sentimentDistribution.Positive, fill: '#4ade80' },
                    { name: 'Neutral', value: sentimentDistribution.Neutral, fill: '#94a3b8' },
                    { name: 'Negative', value: sentimentDistribution.Negative, fill: '#f87171' }
                ]
            }
        });

    } catch (error) {
        logger.error('Get feedback analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feedback analytics'
        });
    }
};
