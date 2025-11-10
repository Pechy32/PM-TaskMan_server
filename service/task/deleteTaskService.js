import { deleteTask, getTaskById } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

export async function deleteTaskService(req, res) {
  const { id } = req.params;

  const validateTask = await validateEntity(id, getTaskById, "task");
  if (!validateTask.valid){
    return res.status(400).json({message: validateTask.message});
  }

  try {
    const deleted = await deleteTask(id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
