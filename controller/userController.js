import express from 'express';

import { createUserService } from '../service/user/createUserService.js';
import { getAllUsersService } from '../service/user/getAllUsersService.js';
import { getUserService } from '../service/user/getUserService.js';
import { updateUserService } from '../service/user/updateUserService.js';
import { deleteUserService } from '../service/user/deleteUserService.js';
import { getCurrentUser } from '../service/user/getCurrentUser.js';

const router = express.Router();

/**
 * GET /api/users/me
 * Returns the currently logged in user
 */
router.get("/me", async (req, res) => {
  try {
    const userId = req.user.id; // z authMiddleware

    const user = await getCurrentUser(userId);

    res.status(200).json(user);
  } catch (err) {
    if (err.message === "UserIdRequired") {
      return res.status(400).json({ error: err.message });
    }

    if (err.message === "UserNotFound") {
      return res.status(404).json({ error: err.message });
    }

    res.status(500).json({ error: "InternalServerError" });
  }
});

// router.get('/', getAllUsersService);
// router.post('/', createUserService);
// router.get('/:id', getUserService);
// router.patch('/:id', updateUserService);
// router.delete('/:id', deleteUserService);

export default router;