import { getProject } from "../../dao/projectDao.js";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

/* ============================================================
 * PATCH /projects/:projectId/tasks/:taskId
 * admin | owner | editor
 * ============================================================ */
export async function updateTaskService(req, res) {
  const { projectId, taskId } = req.params;
  const user = req.user;
  const dtoIn = req.body;

  // Project validation
  const projectValidation = await validateEntity(
    projectId,
    getProject,
    "project"
  );
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message });
  }

  const project = await getProject(projectId);

  // Authorization
  if (user.role !== "admin") {
    const userId = user.id;

    const isOwner = project.ownerId.toString() === userId;
    const member = project.members.find(
      (m) => m.userId.toString() === userId
    );

    const isEditor = member?.role === "editor";

    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  // Task validation
  const taskValidation = await validateEntity(
    taskId,
    getTaskById,
    "task"
  );
  if (!taskValidation.valid) {
    return res.status(404).json({ message: taskValidation.message });
  }

  const task = await getTaskById(taskId);

  // Task-project association check
  if (task.projectId.toString() !== projectId) {
    return res.status(404).json({ message: "TaskNotInProject" });
  }

  // Update
  try {
    const updatedTask = await updateTask(taskId, dtoIn);
    return res.status(200).json(updatedTask);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
