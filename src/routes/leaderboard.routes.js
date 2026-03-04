import { Router } from 'express';
import { getTopThree } from '../controllers/leaderboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = Router();

router.get('/', authenticate, getTopThree);

export default router;