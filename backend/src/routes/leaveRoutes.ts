import { Router } from 'express';
import {
    getAllLeaves,
    applyLeave,
    approveLeave,
    rejectLeave,
    getLeaveBalance,
    deleteLeave,
} from '../controllers/leaveController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/leaves
 * @desc    Get all leave requests
 * @access  Private
 */
router.get('/', asyncHandler(getAllLeaves));

/**
 * @route   POST /api/leaves
 * @desc    Apply for leave
 * @access  Private
 */
router.post('/', asyncHandler(applyLeave));

/**
 * @route   GET /api/leaves/balance
 * @desc    Get leave balance
 * @access  Private
 */
router.get('/balance', asyncHandler(getLeaveBalance));

/**
 * @route   PUT /api/leaves/:id/approve
 * @desc    Approve leave request
 * @access  Manager, HR, Admin
 */
router.put('/:id/approve', requireRole('MANAGER', 'HR', 'ADMIN'), asyncHandler(approveLeave));

/**
 * @route   PUT /api/leaves/:id/reject
 * @desc    Reject leave request
 * @access  Manager, HR, Admin
 */
router.put('/:id/reject', requireRole('MANAGER', 'HR', 'ADMIN'), asyncHandler(rejectLeave));

/**
 * @route   DELETE /api/leaves/:id
 * @desc    Cancel leave request
 * @access  Private
 */
router.delete('/:id', asyncHandler(deleteLeave));

export default router;
