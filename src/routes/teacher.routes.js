import { Router } from 'express';
import { auth, requireRoles } from '../middleware/auth.js';
import { listByExam, reviewSubmission } from '../controllers/submission.controller.js';
import { createTask, listTasks, createExam, listExams, getExam,activeListExams } from '../controllers/exam.controller.js';

const router = Router();
router.use(auth(), requireRoles('teacher','admin'));

router.post('/tasks', createTask);
router.get('/tasks', listTasks);

router.post('/exams', createExam);
router.get('/exams', listExams);
router.get('/ActiveExams', activeListExams);
router.get('/exams/:id', getExam);

router.get('/submissions', listByExam);
router.post('/submissions/:id/review', reviewSubmission);

export default router;
