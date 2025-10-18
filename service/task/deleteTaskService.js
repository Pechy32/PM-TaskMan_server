import { deleteTask } from "../../dao/taskDao.js";
import mongoose from 'mongoose';

// API handler for deleting task
export async function deleteTaskService(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  try {
    const message = await deleteTask(req.params.id);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}