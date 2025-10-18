import { Router } from 'express';
import { register, login, googleLogin, verifyEmail, resendOtp } from '../controllers/auth.controller.js';

const router = Router();
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/google', googleLogin);

export default router;
