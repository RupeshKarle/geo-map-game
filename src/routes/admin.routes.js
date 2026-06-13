import { Router } from 'express';
import { groupAdminReq, approveReq, rejectReq } from '../controllers/admin.controller.js';

const router = Router();

router.get("/group-admin-requests", groupAdminReq);
router.post("/approve-group-admin/:userId", approveReq);
router.post("/reject-group-admin/:userId", rejectReq);

export default router;