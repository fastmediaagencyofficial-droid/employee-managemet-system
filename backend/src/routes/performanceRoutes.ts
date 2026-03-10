import { Router } from 'express';
import {
    getAllGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    getPerformanceMetrics,
    getPerformanceTrends,
} from '../controllers/performanceController';
import { authenticate } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/goals', asyncHandler(getAllGoals));

/**
 * @route   GET /api/performance/goals/:id
 * @desc    Get single goal
 * @access  Private
 */
router.get('/goals/:id', asyncHandler(getGoal));

/**
 * @route   POST /api/performance/goals
 * @desc    Create goal
 * @access  Private
 */
router.post('/goals', asyncHandler(createGoal));

/**
 * @route   PUT /api/performance/goals/:id
 * @desc    Update goal
 * @access  Private
 */
router.put('/goals/:id', asyncHandler(updateGoal));

/**
 * @route   DELETE /api/performance/goals/:id
 * @desc    Delete goal
 * @access  Private
 */
router.delete('/goals/:id', asyncHandler(deleteGoal));

/**
 * @route   GET /api/performance/metrics
 * @desc    Get performance metrics
 * @access  Private
 */
router.get('/metrics', asyncHandler(getPerformanceMetrics));
router.get('/trends', asyncHandler(getPerformanceTrends));

export default router;
