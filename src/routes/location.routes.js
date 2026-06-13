import { Router } from 'express';
import {
 addLocation,
 disableLocation,
 enableLocation,
 getAvailableLocations,
 getPaginatedLocations
} from '../controllers/location.controller.js';

import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

/* User route */
router.get('/available', authenticate, getAvailableLocations);

/* Admin route */
router.get('/', authenticate, requireAdmin, getPaginatedLocations);
router.post('/grouped', authenticate, requireAdmin, getPaginatedLocations);
router.post('/', authenticate, requireAdmin, addLocation);
router.patch('/:id/disable', authenticate, requireAdmin, disableLocation);
router.patch('/:id/enable', authenticate, requireAdmin, enableLocation);

export default router;