import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadBulkFile } from '../middlewares/fileUpload';
import {
    uploadBulkEmployees,
    downloadTemplate,
    validateBulkFile,
} from '../controllers/bulkUploadController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/employees/bulk-upload
 * @desc    Upload bulk employees from Excel/CSV file
 * @access  Private (Admin, HR)
 */
router.post('/upload', uploadBulkFile.single('file'), uploadBulkEmployees);

/**
 * @route   GET /api/employees/bulk-upload/template
 * @desc    Download Excel template for bulk upload
 * @access  Private
 */
router.get('/template', downloadTemplate);

/**
 * @route   POST /api/employees/bulk-upload/validate
 * @desc    Validate bulk upload file without creating employees
 * @access  Private
 */
router.post('/validate', uploadBulkFile.single('file'), validateBulkFile);

export default router;
