import { getTask } from "../../dao/taskDao.js";
import mongoose from 'mongoose';

// API handler for getting task by id
export async function getTaskService(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  try {
    const task = await getTask(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}