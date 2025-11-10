import { createUser } from "../../dao/userDao.js";

// API handler for creating a user
export async function createUserService (req, res) {
  try {
    const user = await createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: error.message });
  }
}