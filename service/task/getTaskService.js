import mongoose from "mongoose";
import { getTaskById, getSubtasks } from "../../dao/taskDao.js";

export async function getTaskService(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  try {
    const task = await getTaskById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtasks = await getSubtasks(id);
    res.json({ ...task.toObject(), subtasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
