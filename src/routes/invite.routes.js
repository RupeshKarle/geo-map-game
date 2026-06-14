import { Router } from "express";
import { index, create, validateToken, getInvitees } from '../controllers/invite.controller.js';

const router = Router();

router.route('/')
 .get(index)
 .post(create);

router.get('/members', getInvitees);

export default router;