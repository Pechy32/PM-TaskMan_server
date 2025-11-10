import { deleteUser } from "../../dao/userDao.js";
import mongoose from 'mongoose';

// API handler for deleting user
export async function deleteUserService (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  try {
    const message = await deleteUser(req.params.id);
    return res.json({ message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
