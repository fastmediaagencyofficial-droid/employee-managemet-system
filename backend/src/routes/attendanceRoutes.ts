import { Router } from 'express';
import {
    clockIn,
    clockOut,
    getMonthlySummary,
    getAttendanceReport,
} from '../controllers/attendanceController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/attendance/report
 * @desc    Get detailed attendance report
 * @access  Admin, HR, Manager
 */
router.get('/report', requireRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(getAttendanceReport));

/**
 * @route   POST /api/attendance/clock-in
 * @desc    Clock in
 * @access  Private
 */
router.post('/clock-in', asyncHandler(clockIn));

/**
 * @route   POST /api/attendance/clock-out
 * @desc    Clock out
 * @access  Private
 */
router.post('/clock-out', asyncHandler(clockOut));

/**
 * @route   GET /api/attendance/summary/:month
 * @desc    Get monthly attendance summary
 * @access  Private
 */
router.get('/summary/:month', asyncHandler(getMonthlySummary));

export default router;
