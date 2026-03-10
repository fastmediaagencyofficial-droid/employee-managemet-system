import { Router } from 'express';
import { calculatePayroll } from '../controllers/payrollController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All payroll routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/payroll/calculate
 * @desc    Calculate payroll for an employee
 * @access  Admin, HR
 */
router.get('/calculate', requireRole('ADMIN', 'HR'), asyncHandler(calculatePayroll));

export default router;
