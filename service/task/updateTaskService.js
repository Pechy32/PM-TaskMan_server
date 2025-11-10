import { getTaskById, updateTask } from "../../dao/taskDao.js";
import { getProject } from "../../dao/projectDao.js";
import { getUser } from "../../dao/userDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

export async function updateTaskService(req, res) {
  const id = req.params.id;
  const updates = req.body;

  // validate task existence
  const validateTask = await validateEntity(id, getTaskById, "task");
  if (!validateTask.valid) {
    return res.status(400).json({ message: validateTask.message });
  }

  //validate project existence
  const projectValidation = await validateEntity(dtoIn.projectId, getProject, "project")
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message })
  }

  //validate assigned user existence
  if (dtoIn.assignedTo) {
    const validateUser = await validateEntity(dtoIn.assignedTo, getUser, "user");
    if (!validateUser.valid) {
      return res.status(400).json({ message: validateUser.message });
    }
  }

  //validate parent task existence
  if (dtoIn.parentTaskId) {
    const validateTask = await validateEntity(dtoIn.parentTaskId, getTaskById, "task");
    if (!validateTask.valid) {
      return res.status(400).json({ message: validateTask.message });
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
