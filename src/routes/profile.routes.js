import { Router } from 'express';
import { usersProfile, belongsToGroup, userDetailsByEmail, requestGroupAdmin } from '../controllers/profile.controller.js';

const router = Router();

router.get('/profile', usersProfile);
router.get('/belongs', belongsToGroup);
router.get('/by-email', userDetailsByEmail);
router.post('/request-group-admin', requestGroupAdmin);

export default router;