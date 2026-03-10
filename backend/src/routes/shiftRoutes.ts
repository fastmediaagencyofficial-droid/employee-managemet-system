import { Router } from 'express';
import {
    getAllShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift,
    assignShift,
} from '../controllers/shiftController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All shift routes require authentication
router.use(authenticate);

// List and detail routes
router.get('/', asyncHandler(getAllShifts));
router.get('/:id', asyncHandler(getShiftById));

// Admin/HR only routes for managing shifts
router.post('/', requireRole('ADMIN', 'HR'), asyncHandler(createShift));
router.put('/:id', requireRole('ADMIN', 'HR'), asyncHandler(updateShift));
router.delete('/:id', requireRole('ADMIN', 'HR'), asyncHandler(deleteShift));
router.post('/assign', requireRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(assignShift));

export default router;
