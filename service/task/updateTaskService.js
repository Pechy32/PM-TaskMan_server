import { updateTask } from "../../dao/taskDao.js";
import mongoose from 'mongoose';

// API handler for updating task
export async function updateTaskService(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  try {
    const task = await updateTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
}