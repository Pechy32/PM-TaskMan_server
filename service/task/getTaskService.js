import { getTaskById, getSubtasks } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

export async function getTaskService(req, res) {
  const { id } = req.params;

  const validateTask = await validateEntity(id, getTaskById, "task");
  if (!validateTask.valid) {
    return res.status(400).json({ message: validateTask.message });
  }

  try {
    const task = await getTaskById(id);
    const subtasks = await getSubtasks(id);
    res.json({ ...task.toObject(), subtasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
