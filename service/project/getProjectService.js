import { getProject } from "../../dao/projectDao.js";


export async function getProjectService(projectId, user) {
  if (!projectId) {
    throw new Error("ProjectIdRequired");
  }

  const project = await getProject(projectId);
  if (!project) {
    throw new Error("ProjectNotFound");
  }

  // admin má neomezený přístup
  if (user.role === "admin") {
    return project;
  }

  const userId = user.id;

  // owner
  if (project.ownerId.toString() === userId) {
    return project;
  }

  // member
  const isMember = project.members.some(
    (m) => m.userId.toString() === userId
  );

  if (isMember) {
    return project;
  }

  throw new Error("Forbidden");
}