import { Router } from 'express';
import { forgotPassword, resetPassword } from '../controllers/passwordResetController';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

/**
 * @route   POST /api/password/forgot
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot', asyncHandler(forgotPassword));

/**
 * @route   POST /api/password/reset
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset', asyncHandler(resetPassword));

export default router;
