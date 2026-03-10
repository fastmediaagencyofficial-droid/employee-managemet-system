import { Router } from 'express';
import {
    getAllEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getDashboardStats,
    uploadDocument,
    getEmployeeDocuments,
    deleteDocument,
    downloadDocument,
} from '../controllers/employeeController';
import {
    getEmployeePerformance,
    getEmployeeAttendance,
} from '../controllers/employeePerformanceController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import { uploadDocument as uploadMiddleware } from '../middlewares/fileUpload';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/employees
 * @desc    Get all employees
 * @access  Private
 */
router.get('/', asyncHandler(getAllEmployees));

/**
 * @route   GET /api/employees/stats
 * @desc    Get dashboard stats
 * @access  Private
 */
router.get('/stats', asyncHandler(getDashboardStats));

/**
 * @route   GET /api/employees/:id
 * @desc    Get single employee
 * @access  Private
 */
router.get('/:id', asyncHandler(getEmployee));

/**
 * @route   POST /api/employees
 * @desc    Create employee
 * @access  Admin, HR
 */
router.post('/', requireRole('ADMIN', 'HR'), asyncHandler(createEmployee));

/**
 * @route   PUT /api/employees/:id
 * @desc    Update employee
 * @access  Admin, HR
 */
router.put('/:id', requireRole('ADMIN', 'HR'), asyncHandler(updateEmployee));

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete employee
 * @access  Admin
 */
router.delete('/:id', requireRole('ADMIN'), asyncHandler(deleteEmployee));

/**
 * @route   GET /api/employees/:id/performance
 * @desc    Get employee performance data
 * @access  Private
 */
router.get('/:id/performance', asyncHandler(getEmployeePerformance));

/**
 * @route   GET /api/employees/:id/attendance
 * @desc    Get employee attendance data
 * @access  Private
 */
router.get('/:id/attendance', asyncHandler(getEmployeeAttendance));

/**
 * @route   POST /api/employees/:id/documents
 * @desc    Upload employee document
 * @access  Admin, HR
 */
router.post('/:id/documents', requireRole('ADMIN', 'HR'), uploadMiddleware.single('file'), asyncHandler(uploadDocument));

/**
 * @route   GET /api/employees/:id/documents
 * @desc    Get employee documents
 * @access  Private
 */
router.get('/:id/documents', asyncHandler(getEmployeeDocuments));

/**
 * @route   DELETE /api/employees/documents/:documentId
 * @desc    Delete employee document
 * @access  Admin, HR
 */
router.delete('/documents/:documentId', requireRole('ADMIN', 'HR'), asyncHandler(deleteDocument));

/**
 * @route   GET /api/employees/documents/:documentId/download
 * @desc    Download employee document
 * @access  Private
 */
router.get('/documents/:documentId/download', asyncHandler(downloadDocument));

export default router;
