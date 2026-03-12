import { Router } from 'express';
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent, joinEvent, leaveEvent, getNearbyEvents, contributeResource } from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getEvents);
router.get('/nearby', getNearbyEvents);
router.get('/:id', getEvent);
router.post('/', authenticate, createEvent);
router.put('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);
router.post('/:id/join', authenticate, joinEvent);
router.delete('/:id/leave', authenticate, leaveEvent);
router.post('/:id/resources', authenticate, contributeResource);

export default router;
