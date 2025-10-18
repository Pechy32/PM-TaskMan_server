import express from 'express';

import { createUserService } from '../service/user/createUserService.js';
import { getAllUsersService } from '../service/user/getAllUsersService.js';
import { getUserService } from '../service/user/getUserService.js';
import { updateUserService } from '../service/user/updateUserService.js';
import { deleteUserService } from '../service/user/deleteUserService.js';

const router = express.Router();

router.get('/', getAllUsersService);
router.post('/', createUserService);
router.get('/:id', getUserService);
router.put('/:id', updateUserService);
router.delete('/:id', deleteUserService);

export default router;