import mongoose from "mongoose";

import { getTasksByProject, getSubtasks } from "../../dao/taskDao.js";


export async function getTasksByProjectService(req, res) {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
    }
    try {
        const tasks = await getTasksByProject(id);
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