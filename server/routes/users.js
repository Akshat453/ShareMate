import { Router } from 'express';
import { getProfile, updateProfile, getLeaderboard, getUserEvents } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.get('/:id', getProfile);
router.get('/:id/events', getUserEvents);

export default router;
