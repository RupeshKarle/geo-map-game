import { Router } from "express";
import { index, create, destroy, validateToken } from '../controllers/invite.controller.js';

const router = Router();

router.route('/')
 .get(index)
 .post(create);

export default router;