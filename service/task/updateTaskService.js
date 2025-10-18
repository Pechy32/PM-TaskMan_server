import mongoose from "mongoose";
import { updateTask } from "../../dao/taskDao.js";

export async function updateTaskService(req, res) {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No update data provided" });
  }

  try {
    const updatedTask = await updateTask(id, updates);
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
