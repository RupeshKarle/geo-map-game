import { Router } from "express";
import { getGroups, getPaginatedGroups, groupInfo, saveGroup, updateGroup, openCloseGroup, getLocations } from '../controllers/group.controller.js';

const router = Router();

router.route('/')
 .get(getGroups)
 .post(saveGroup);

router.get('/paginated', getPaginatedGroups);
router.patch('/:groupId/:isOpen', openCloseGroup);

router.route('/:groupId')
 .get(groupInfo)
 .put(updateGroup);

router.route('/:groupId/locations')
 .get(getLocations);

export default router;