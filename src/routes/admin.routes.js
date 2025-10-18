import { Router } from 'express';
import { auth, requireRoles } from '../middleware/auth.js';
import { createTeacher, dashboardStats, listUsers } from '../controllers/admin.controller.js';

const router = Router();
router.use(auth(), requireRoles('admin'));
router.post('/teachers', createTeacher);
router.get('/dashboard', dashboardStats);
router.get('/users', listUsers);

export default router;
