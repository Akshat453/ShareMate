import { Router } from 'express';
import { getListings, getListing, createListing, updateListing, deleteListing, requestListing, handleRequest } from '../controllers/listingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getListings);
router.get('/:id', getListing);
router.post('/', authenticate, createListing);
router.put('/:id', authenticate, updateListing);
router.delete('/:id', authenticate, deleteListing);
router.post('/:id/request', authenticate, requestListing);
router.put('/:id/request/:reqId', authenticate, handleRequest);

export default router;
