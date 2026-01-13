import { deleteProject, getProject } from "../../dao/projectDao.js";

export async function deleteProjectService(projectId, user) {
  if (!projectId) {
    throw new Error("ProjectIdRequired");
  }

  const project = await getProject(projectId);
  if (!project) {
    throw new Error("ProjectNotFound");
  }

  // admin access
  if (user.role === "admin") {
    await deleteProject(projectId);
    return;
  }

  const userId = user.id;

  // owner access
  if (project.ownerId.toString() === userId) {
    await deleteProject(projectId);
    return;
  }

  throw new Error("Forbidden");
}