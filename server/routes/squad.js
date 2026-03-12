import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  getSquadPosts, createSquadPost, getSquadPost, updateSquadPost, deleteSquadPost,
  joinSquadPost, leaveSquadPost, expressInterest, getParticipants,
  getNearbySquads, getTrending, getExpiringSoon, getByCategory,
  getMyCreated, getMyJoined, getMyInterested,
  confirmSquad, completeSquad, suggestTags,
} from '../controllers/squadController.js';

const router = Router();

// Discovery endpoints (before /:id to avoid route conflicts)
router.get('/nearby', optionalAuth, getNearbySquads);
router.get('/trending', optionalAuth, getTrending);
router.get('/expiring-soon', optionalAuth, getExpiringSoon);
router.get('/category/:category', optionalAuth, getByCategory);

// My squads
router.get('/my/created', authenticate, getMyCreated);
router.get('/my/joined', authenticate, getMyJoined);
router.get('/my/interested', authenticate, getMyInterested);

// Tag suggestions (rate limited)
router.post('/suggest-tags', authenticate, authLimiter, suggestTags);

// CRUD
router.get('/', optionalAuth, getSquadPosts);
router.post('/', authenticate, createSquadPost);
router.get('/:id', optionalAuth, getSquadPost);
router.put('/:id', authenticate, updateSquadPost);
router.delete('/:id', authenticate, deleteSquadPost);

// Participation
router.post('/:id/join', authenticate, joinSquadPost);
router.delete('/:id/leave', authenticate, leaveSquadPost);
router.post('/:id/interest', authenticate, expressInterest);
router.get('/:id/participants', optionalAuth, getParticipants);

// Status management
router.post('/:id/confirm', authenticate, confirmSquad);
router.post('/:id/complete', authenticate, completeSquad);

export default router;
