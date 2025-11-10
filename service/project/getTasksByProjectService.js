import { getProject } from "../../dao/projectDao.js";
import { getTasksByProject, getSubtasks } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

export async function getTasksByProjectService(req, res) {
    const id = req.params.id;
    
    const projectValidation = await validateEntity(id, getProject, "project")
    if (!projectValidation.valid) {
        return res.status(400).json({ message: projectValidation.message })
    }

    try {
        const tasks = await getTasksByProject(id);
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