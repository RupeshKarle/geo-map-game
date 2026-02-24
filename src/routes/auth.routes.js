import { Router } from 'express';
import { refreshToken, logout } from '../controllers/auth.controller.js';

const router = Router();
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router;