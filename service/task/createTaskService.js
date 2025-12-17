import { createTask, getTaskById } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";
import { getProject } from "../../dao/projectDao.js";
import { getUserById } from "../../dao/userDao.js";

export async function createTaskService(req, res) {
    const dtoIn = req.body;
    const { projectId } = req;

  //validate project existence
  const projectValidation = await validateEntity(projectId, getProject, "project")
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message })
  }

  //validate assigned user existence
  if (dtoIn.assignedTo) {
    const validateUser = await validateEntity(dtoIn.assignedTo, getUserById, "user");
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
    const task = await createTask({...dtoIn, projectId: projectId});
    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
