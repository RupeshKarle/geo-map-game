import { Router } from 'express';
import { getTopThree } from '../controllers/leaderboard.controller.js';

const router = Router();

router.get('/top-3', getTopThree);

export default router;