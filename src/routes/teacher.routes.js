import { Router } from 'express';
import { auth, requireRoles } from '../middleware/auth.js';
import { 
  createTask, 
  listTasks, 
  getTask, 
  updateTask, 
  deleteTask,
  createExam, 
  listExams, 
  getExam,
  updateExam,
  activeListExams 
} from '../controllers/exam.controller.js';
import { 
  listByExam, 
  reviewSubmission, 
  getSubmission 
} from '../controllers/submission.controller.js';

const router = Router();
router.use(auth(), requireRoles('teacher', 'admin'));

router.post('/tasks', createTask);
router.get('/tasks', listTasks);
router.get('/tasks/:id', getTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

router.post('/exams', createExam);
router.get('/exams', listExams);
router.get('/exams/active', activeListExams);
router.get('/exams/:id', getExam);
router.put('/exams/:id', updateExam);


router.get('/submissions', listByExam);
router.get('/submissions/:id', getSubmission);
router.post('/submissions/:id/review', reviewSubmission);

export default router;