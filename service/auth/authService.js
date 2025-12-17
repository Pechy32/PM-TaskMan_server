import { getUserByEmail, getUserById } from "../../dao/userDao.js";
import { getProject } from "../../dao/projectDao.js";

import { generateTokens } from "./jwtService.js";


export async function loginWithEmail(email, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("UserNotFound");
  }

  if (!user.passwordHash) {
    throw new Error("PasswordLoginNotAllowed");
  }

  // TODO: bcrypt.compare()
  if (password !== user.passwordHash) {
    throw new Error("WrongPassword");
  }

  return generateTokens(user);
}


export async function getUserRoleForProject(userId, projectId) {
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("ProjectNotFound");
  }

  // Owner
  if (project.ownerId.toString() === userId.toString()) {
    return "owner";
  }

  // Member
  const member = project.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (member?.role) {
    return member.role; // "editor" | "viewer"
  }

  return false;
}
