import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listExams, getExam, activeListExams } from '../controllers/exam.controller.js';

const router = Router();
router.use(auth(false));

router.get('/', activeListExams);
router.get('/:id', getExam);

export default router;
