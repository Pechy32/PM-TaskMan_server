import { getProject, updateProject} from "../../dao/projectDao.js";

export async function updateProjectService(projectId, user, updateData) {
  if (!projectId) {
    throw new Error("ProjectIdRequired");
  }

  const project = await getProject(projectId);
  if (!project) {
    throw new Error("ProjectNotFound");
  }

  // admin has full access
  if (user.role === "admin") {
    return updateProject(projectId, updateData);
  }

  const userId = user.id;

  // owner has full access
  if (project.ownerId.toString() === userId) {
    return updateProject(projectId, updateData);
  }

  // get members role
  const member = project.members.find(
    (m) => m.userId.toString() === userId
  );

  if (!member) {
    throw new Error("Forbidden");
  }

  // editor has restricted access
  if (member.role === "editor") {
    const allowedFields = ["name", "description"];

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([key]) =>
        allowedFields.includes(key)
      )
    );

    if (Object.keys(sanitizedUpdate).length === 0) {
      throw new Error("Forbidden");
    }

    return updateProject(projectId, sanitizedUpdate);
  }

  // viewer
  throw new Error("Forbidden");
}