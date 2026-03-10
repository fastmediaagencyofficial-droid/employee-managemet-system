import { Router } from 'express';
import {
    getInsights,
    chat,
    analyzeResume,
    summarizeReview,
    predictPerformance
} from '../controllers/aiController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/insights', getInsights);
router.post('/chat', chat);
router.post('/analyze-resume', analyzeResume);
router.post('/summarize-review', summarizeReview);
router.post('/predict-performance', predictPerformance);

export default router;
