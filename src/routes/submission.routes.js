import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { submitModule, mySubmissions } from '../controllers/submission.controller.js';

const router = Router();
router.use(auth());

router.post('/', upload.array('files', 5), submitModule);
router.get('/me', mySubmissions);

export default router;
