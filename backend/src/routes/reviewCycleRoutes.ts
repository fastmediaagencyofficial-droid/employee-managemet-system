import { Router } from 'express';
import {
    getAllCycles,
    getCycleById,
    createCycle,
    updateCycle,
    deleteCycle
} from '../controllers/reviewCycleController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// All cycle routes require authentication
router.use(authenticate);

router.get('/', asyncHandler(getAllCycles));
router.get('/:id', asyncHandler(getCycleById));

// Creation, update, and deletion restricted to HR and ADMIN
router.post('/', requireRole('ADMIN', 'HR'), asyncHandler(createCycle));
router.put('/:id', requireRole('ADMIN', 'HR'), asyncHandler(updateCycle));
router.delete('/:id', requireRole('ADMIN', 'HR'), asyncHandler(deleteCycle));

export default router;
