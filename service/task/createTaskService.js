import { createTask, getTaskById } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";
import { getProject } from "../../dao/projectDao.js";
import { getUser } from "../../dao/userDao.js";

export async function createTaskService(req, res) {
  const dtoIn = req.body;

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
    const task = await createTask(dtoIn);
    res.status(201).json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
}