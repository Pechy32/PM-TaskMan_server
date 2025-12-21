/* ============================================================
 * DELETE /projects/:projectId/tasks/:taskId
 * admin | owner
 * ============================================================ */
export async function deleteTaskService(req, res) {
  const { projectId, taskId } = req.params;
  const user = req.user;

  // Project validation
  const projectValidation = await validateEntity(
    projectId,
    getProject,
    "project"
  );
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message });
  }

  const project = await getProject(projectId);

  // Authorization
  if (user.role !== "admin") {
    const userId = user.id;

    const isOwner = project.ownerId.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  // Task validation
  const taskValidation = await validateEntity(
    taskId,
    getTaskById,
    "task"
  );
  if (!taskValidation.valid) {
    return res.status(404).json({ message: taskValidation.message });
  }

  const task = await getTaskById(taskId);

  // task-project association check
  if (task.projectId.toString() !== projectId) {
    return res.status(404).json({ message: "TaskNotInProject" });
  }

  // delete
  try {
    await deleteTask(taskId);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
