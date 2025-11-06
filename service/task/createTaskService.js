import { createTask } from "../../dao/taskDao.js";

export async function createTaskService(req, res) {
  const taskData = req.body;

  if (!taskData.title) {
    return res.status(400).json({ message: "Task title is required" });
  }

  try {
    const task = await createTask(taskData);
    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}