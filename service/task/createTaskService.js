import { createTask, getTaskById } from "../../dao/taskDao.js";
import { getProject } from "../../dao/projectDao.js";
import { getUserById } from "../../dao/userDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

export async function createTaskService(req, res) {
    const dtoIn = req.body;
    const { projectId } = req.params;
    const user = req.user; 

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
     * Autorization
     * admin | owner | editor
     * ------------------------------------------------------------------ */
    if (user.role !== "admin") {
        const userId = user.id;

        const isOwner =
            project.ownerId.toString() === userId;

        const member = project.members.find(
            (m) => m.userId.toString() === userId
        );

        const isEditor = member?.role === "editor";

        if (!isOwner && !isEditor) {
            return res.status(403).json({ message: "Forbidden" });
        }
    }

    /* ------------------------------------------------------------------
     * Assigned user validation
     * ------------------------------------------------------------------ */
    if (dtoIn.assignedTo) {
        const validateUser = await validateEntity(
            dtoIn.assignedTo,
            getUserById,
            "user"
        );

        if (!validateUser.valid) {
            return res.status(400).json({ message: validateUser.message });
        }
    }

    /* ------------------------------------------------------------------
     * Parent task validation
     * ------------------------------------------------------------------ */
    if (dtoIn.parentTaskId) {
        const validateTask = await validateEntity(
            dtoIn.parentTaskId,
            getTaskById,
            "task"
        );

        if (!validateTask.valid) {
            return res.status(400).json({ message: validateTask.message });
        }
    }

    /* ------------------------------------------------------------------
     * Task creation
     * ------------------------------------------------------------------ */
    try {
        const task = await createTask({
            ...dtoIn,
            projectId,
        });

        return res.status(201).json(task);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
