import mongoose from "mongoose";
import { getTasksByProject, getSubtasks } from "../../dao/taskDao.js";

export async function getTasksByProjectService(req, res) {

  //projectId passed as query parameter
  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({ message: "Missing required query parameter: projectId" });
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: "Invalid project ID format" });
  }

  try {
    const tasks = await getTasksByProject(projectId);

    const tasksWithSubtasks = await Promise.all(
      tasks.map(async (task) => {
        const subtasks = await getSubtasks(task._id);
        return { ...task.toObject(), subtasks };
      })
    );

    res.json(tasksWithSubtasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}