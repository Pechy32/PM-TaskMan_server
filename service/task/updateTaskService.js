import mongoose from "mongoose";
import { getTaskById, updateTask } from "../../dao/taskDao.js";
import { getProject } from "../../dao/projectDao.js";
import { getUser } from "../../dao/userDao.js";

export async function updateTaskService(req, res) {
  const { id } = req.params;
  const updates = req.body;

  // Validation for task ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  // Basic validation for update data
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No update data provided" });
  }

  // Example validation: title should not be empty if provided
  if (updates.title !== undefined && updates.title.trim() === "") {
    return res.status(400).json({ message: "Task title cannot be empty" });
  }

  // Validation whether project with given ID exists
  if (!getProject(updates.projectId)) {
    return res.status(400).json({ message: "Associated project not found" });
  }

  // Validation wheter parent task exists if provided
  if (updates.parentTaskId) {
    const parentTask = await getTaskById(updates.parentTaskId);
    if (!parentTask) {
      return res.status(400).json({ message: "Parent task not found" });
    }
  }

  // Validation wheter assigned user exists if provided
  if (updates.assignedTo) {
    if(!getUser(updates.assignedTo)) {
      return res.status(400).json({ message: "Assigned user not found" });
    }
  }

  try {
    const updatedTask = await updateTask(id, updates);
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    return res.json(updatedTask);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
