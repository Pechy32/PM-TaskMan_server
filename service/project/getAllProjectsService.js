import { getAllProjects, getProjectsForUser } from "../../dao/projectDao.js";

export async function getProjectsForUserContext(user) {
  if (!user || !user.id) {
    throw new Error("UserRequired");
  }

  // admin vidí vše
  if (user.role === "admin") {
    return getAllProjects();
  }

  // běžný user jen svoje projekty
  return getProjectsForUser(user.id);
}
