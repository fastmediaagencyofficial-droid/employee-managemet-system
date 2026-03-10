import { Router } from 'express';
import {
    getAllReviews,
    getReview,
    getEmployeeReviews,
    createReview,
    updateReview,
} from '../controllers/reviewController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews
 * @access  Private
 */
router.get('/', asyncHandler(getAllReviews));

/**
 * @route   GET /api/reviews/employee/:id
 * @desc    Get employee reviews
 * @access  Private
 */
router.get('/employee/:id', asyncHandler(getEmployeeReviews));

/**
 * @route   GET /api/reviews/:id
 * @desc    Get single review
 * @access  Private
 */
router.get('/:id', asyncHandler(getReview));

/**
 * @route   POST /api/reviews
 * @desc    Create review
 * @access  Manager, HR, Admin
 */
router.post('/', requireRole('MANAGER', 'HR', 'ADMIN'), asyncHandler(createReview));

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Manager, HR, Admin
 */
router.put('/:id', requireRole('MANAGER', 'HR', 'ADMIN'), asyncHandler(updateReview));

export default router;
