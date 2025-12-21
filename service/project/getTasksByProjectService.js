import { getProject } from "../../dao/projectDao.js";
import { getTasksByProject, getSubtasks } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

export async function getTasksByProjectService(req, res) {
    const { projectId } = req.params;
    const user = req.user; // { id, role }

    // 1️⃣ validace projektu (existence + ID)
    const projectValidation = await validateEntity(
        projectId,
        getProject,
        "project"
    );

    if (!projectValidation.valid) {
        return res.status(400).json({ message: projectValidation.message });
    }

    // 2️⃣ NAČTENÍ PROJEKTU (důležité!)
    const project = await getProject(projectId);

    // 3️⃣ AUTORIZACE
    if (user.role !== "admin") {
        const userId = user.id;

        const isOwner =
            project.ownerId.toString() === userId;

        const isMember =
            project.members.some(
                (m) => m.userId.toString() === userId
            );

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Forbidden" });
        }
    }

    // 4️⃣ TASKY
    try {
        const tasks = await getTasksByProject(projectId);

        const tasksWithSubtasks = await Promise.all(
            tasks.map(async (task) => {
                const subtasks = await getSubtasks(task._id);
                return {
                    ...task.toObject(),
                    subtasks,
                };
            })
        );

        return res.json(tasksWithSubtasks);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
