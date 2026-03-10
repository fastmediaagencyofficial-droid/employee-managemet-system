import { Router } from 'express';
import authRoutes from './authRoutes';
import passwordRoutes from './passwordRoutes';
import employeeRoutes from './employeeRoutes';
import dashboardRoutes from './dashboardRoutes';
import leaveRoutes from './leaveRoutes';
import attendanceRoutes from './attendanceRoutes';
import performanceRoutes from './performanceRoutes';
import reviewRoutes from './reviewRoutes';
import reviewCycleRoutes from './reviewCycleRoutes';
import feedbackRoutes from './feedbackRoutes';
import departmentRoutes from './departmentRoutes';
import shiftRoutes from './shiftRoutes';
import analyticsRoutes from './analyticsRoutes';
import aiRoutes from './aiRoutes';
import preferencesRoutes from './preferencesRoutes';
import bulkUploadRoutes from './bulkUploadRoutes';
import taskRoutes from './taskRoutes';
import notificationRoutes from './notificationRoutes';
import payrollRoutes from './payrollRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/password', passwordRoutes);
router.use('/employees', employeeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/leaves', leaveRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/performance', performanceRoutes);
router.use('/reviews', reviewRoutes);
router.use('/review-cycles', reviewCycleRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/departments', departmentRoutes);
router.use('/shifts', shiftRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/employees/bulk-upload', bulkUploadRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payroll', payrollRoutes);

// Health check for API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
    });
});

export default router;
