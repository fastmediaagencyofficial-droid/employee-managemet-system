import { Router } from 'express';
import {
    getExecutiveStats,
    getHRStats,
    getManagerStats,
    getCustomReport,
    exportAnalytics
} from '../controllers/analyticsController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Executive stats - Admin, Executive (if role exists), HR
router.get('/executive', requireRole('ADMIN', 'HR'), asyncHandler(getExecutiveStats));

// HR stats - Admin, HR
router.get('/hr', requireRole('ADMIN', 'HR'), asyncHandler(getHRStats));

// Manager stats - Admin, HR, Manager
router.get('/manager', requireRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(getManagerStats));

// Custom report - Admin, HR, Manager
router.post('/custom-report', requireRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(getCustomReport));

// Export analytics - Admin, HR
router.get('/export', requireRole('ADMIN', 'HR'), asyncHandler(exportAnalytics));

export default router;
