import { Router } from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
} from '../controllers/authController';
import { createEmployeeRecord } from '../controllers/employeeRecordController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', asyncHandler(register));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', asyncHandler(login));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', asyncHandler(refreshToken));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, asyncHandler(getProfile));

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile (alias)
 * @access  Private
 */
router.get('/profile', authMiddleware, asyncHandler(getProfile));

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/update-profile', authMiddleware, asyncHandler(updateProfile));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authMiddleware, asyncHandler(changePassword));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authMiddleware, asyncHandler(logout));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset link
 * @access  Public
 */
router.post('/forgot-password', asyncHandler(forgotPassword));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password
 * @access  Public
 */
router.post('/reset-password', asyncHandler(resetPassword));

/**
 * @route   POST /api/auth/create-employee-record
 * @desc    Create employee record for current user if it doesn't exist
 * @access  Private
 */
router.post('/create-employee-record', authMiddleware, asyncHandler(createEmployeeRecord));

export default router;
