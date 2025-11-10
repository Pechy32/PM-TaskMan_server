import { getAllTasks, getSubtasks } from "../../dao/taskDao.js";

export async function getAllTasksService(req, res) {
  try {
    const tasks = await getAllTasks();
    const tasksWithSubtasks = await Promise.all(
      tasks.map(async (task) => {
        const subtasks = await getSubtasks(task._id);
        return { ...task.toObject(), subtasks };
      })
    );

    return res.json(tasksWithSubtasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}