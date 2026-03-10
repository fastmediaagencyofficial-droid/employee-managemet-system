import { Router } from 'express';
import {
    getAllDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from '../controllers/departmentController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Private
 */
router.get('/', asyncHandler(getAllDepartments));

/**
 * @route   GET /api/departments/:id
 * @desc    Get single department
 * @access  Private
 */
router.get('/:id', asyncHandler(getDepartment));

/**
 * @route   POST /api/departments
 * @desc    Create department
 * @access  Admin, HR
 */
router.post('/', requireRole('ADMIN', 'HR'), asyncHandler(createDepartment));

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Admin, HR
 */
router.put('/:id', requireRole('ADMIN', 'HR'), asyncHandler(updateDepartment));

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department
 * @access  Admin
 */
router.delete('/:id', requireRole('ADMIN'), asyncHandler(deleteDepartment));

export default router;
