import { Router } from 'express';
import { startGame, submitGuess } from '../controllers/game.controller.js';
import rateLimit from 'express-rate-limit';
const guessLimiter = rateLimit({
 windowMs: 60 * 1000,
 max: 20
});

const router = Router();

router.post('/start/:locationId', startGame);
router.post('/guess', guessLimiter, submitGuess);

export default router;