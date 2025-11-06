import { getAllUsers } from "../../dao/userDao.js";

// API handler for getting all users
export async function getAllUsersService (req, res) {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}