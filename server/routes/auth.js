import { Router } from 'express';
import { register, login, refresh, logout, getMe, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
