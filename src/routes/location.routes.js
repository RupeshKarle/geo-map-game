import { Router } from 'express';
import {
 addLocation,
 disableLocation,
 enableLocation,
 getAvailableLocations
} from '../controllers/location.controller.js';

import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

/* User route */
router.get('/available', authenticate, getAvailableLocations);

/* Admin route */
router.post('/', authenticate, requireAdmin, addLocation);
router.patch('/:id/disable', authenticate, requireAdmin, disableLocation);
router.patch('/:id/enable', authenticate, requireAdmin, enableLocation);

export default router;