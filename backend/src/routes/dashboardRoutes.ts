import { Router } from 'express';
import {
    getDashboardStats,
    getAttendanceTrend,
    getDepartmentDistribution,
    getRecentActivity,
    getAdminMetrics,
    getHRMetrics,
    getManagerMetrics,
    getEmployeeMetrics,
    getDashboardCharts,
} from '../controllers/dashboardController';
import { authenticate } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', asyncHandler(getDashboardStats));

/**
 * @route   GET /api/dashboard/attendance-trend
 * @desc    Get attendance trend (last 7 days)
 * @access  Private
 */
router.get('/attendance-trend', asyncHandler(getAttendanceTrend));

/**
 * @route   GET /api/dashboard/department-distribution
 * @desc    Get department distribution
 * @access  Private
 */
router.get('/department-distribution', asyncHandler(getDepartmentDistribution));

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/recent-activity', asyncHandler(getRecentActivity));

/**
 * @route   GET /api/dashboard/admin-metrics
 * @desc    Get admin dashboard metrics
 * @access  Private (Admin only)
 */
router.get('/admin-metrics', asyncHandler(getAdminMetrics));

/**
 * @route   GET /api/dashboard/hr-metrics
 * @desc    Get HR dashboard metrics
 * @access  Private (HR/Admin only)
 */
router.get('/hr-metrics', asyncHandler(getHRMetrics));

/**
 * @route   GET /api/dashboard/manager-metrics
 * @desc    Get manager dashboard metrics
 * @access  Private (Manager/Admin only)
 */
router.get('/manager-metrics', asyncHandler(getManagerMetrics));

/**
 * @route   GET /api/dashboard/employee-metrics
 * @desc    Get employee dashboard metrics
 * @access  Private
 */
router.get('/employee-metrics', asyncHandler(getEmployeeMetrics));

/**
 * @route   GET /api/dashboard/charts
 * @desc    Get dashboard charts data
 * @access  Private
 */
router.get('/charts', asyncHandler(getDashboardCharts));

export default router;
