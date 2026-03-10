import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get all reviews
 */
export const getAllReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { employeeId } = req.query;

        const where: any = {};
        if (employeeId) where.employeeId = employeeId;

        const reviews = await prisma.review.findMany({
            where,
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                    },
                },
                reviewer: {
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
            data: reviews,
        });
    } catch (_error: any) {
        logger.error('Get reviews error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
        });
    }
};

/**
 * Create review
 */
export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const {
            employeeId,
            overallRating,
            strengths,
            improvements,
            goals,
            comments,
            reviewPeriod,
        } = req.body;
        const userId = req.user?.userId;

        const reviewer = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!reviewer) {
            return res.status(404).json({
                success: false,
                message: 'Reviewer not found',
            });
        }

        const review = await prisma.review.create({
            data: {
                employeeId,
                reviewerId: reviewer.id,
                overallRating,
                strengths,
                improvements,
                goals,
                comments,
                period: reviewPeriod,
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

        logger.info(`Review created: ${review.id}`);

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review,
        });
    } catch (_error: any) {
        logger.error('Create review error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
        });
    }
};

/**
 * Get single review
 */
export const getReview = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        position: true,
                    },
                },
                reviewer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        position: true,
                    },
                },
            },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        res.json({
            success: true,
            data: review,
        });
    } catch (_error: any) {
        logger.error('Get review error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review',
        });
    }
};

/**
 * Update review
 */
export const updateReview = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const review = await prisma.review.update({
            where: { id },
            data: updateData,
        });

        logger.info(`Review updated: ${review.id}`);

        res.json({
            success: true,
            message: 'Review updated successfully',
            data: review,
        });
    } catch (_error: any) {
        logger.error('Update review error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
        });
    }
};

/**
 * Get employee reviews
 */
export const getEmployeeReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { id: employeeId } = req.params;

        const reviews = await prisma.review.findMany({
            where: { employeeId },
            include: {
                reviewer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        position: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: reviews,
        });
    } catch (_error: any) {
        logger.error('Get employee reviews error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee reviews',
        });
    }
};
