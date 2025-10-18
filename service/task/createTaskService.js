import { createTask } from '../../dao/taskDao.js';

// API handler for creating a task
export async function createTaskService(req, res) {
  try {
    const task = await createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
}