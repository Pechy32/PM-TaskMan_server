import { getProject } from "../../dao/projectDao.js";
import { getTaskById } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

export async function getTaskService(req, res) {
    const { projectId, taskId } = req.params;
    const user = req.user; // { id, role }

    /* ------------------------------------------------------------------
     * Project validation
     * ------------------------------------------------------------------ */
    const projectValidation = await validateEntity(
        projectId,
        getProject,
        "project"
    );

    if (!projectValidation.valid) {
        return res.status(400).json({ message: projectValidation.message });
    }

    const project = await getProject(projectId);

    /* ------------------------------------------------------------------
     * Authorization (admin | owner | member)
     * ------------------------------------------------------------------ */
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

    /* ------------------------------------------------------------------
     * Task validation
     * ------------------------------------------------------------------ */
    const taskValidation = await validateEntity(
        taskId,
        getTaskById,
        "task"
    );

    if (!taskValidation.valid) {
        return res.status(404).json({ message: taskValidation.message });
    }

    const task = await getTaskById(taskId);

    /* ------------------------------------------------------------------
     * Task belongs to project check
     * ------------------------------------------------------------------ */
    if (task.projectId.toString() !== projectId) {
        return res.status(404).json({ message: "TaskNotInProject" });
    }

    /* ------------------------------------------------------------------
     * Result
     * ------------------------------------------------------------------ */
    return res.status(200).json(task);
}
