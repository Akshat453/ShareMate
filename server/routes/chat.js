import { Router } from 'express';
import { getConversations, createConversation, getMessages, sendMessage } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.post('/conversations', authenticate, createConversation);
router.get('/conversations/:id/messages', authenticate, getMessages);
router.post('/conversations/:id/messages', authenticate, sendMessage);

export default router;
