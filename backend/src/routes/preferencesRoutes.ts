import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/preferencesController';
import { authenticate } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/', asyncHandler(getPreferences));

/**
 * @route   PUT /api/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/', asyncHandler(updatePreferences));

export default router;
