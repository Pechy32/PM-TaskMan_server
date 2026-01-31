import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "../../dao/userDao.js";
import { getProject } from "../../dao/projectDao.js";
import { generateTokens } from "./jwtService.js";

const SALT_ROUNDS = 10;
export async function registerWithEmail(name, email, password) {
  if (!name || !email || !password) {
    throw new Error("InvalidInput");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)){
    throw new Error("InvalidInput");
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("EmailAlreadyRegistered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await createUser({
    name,
    email,
    passwordHash,
  });

  return generateTokens(user);
}

export async function loginWithEmail(email, password) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("InvalidCredentials");
  }

  if (!user.passwordHash) {
    throw new Error("PasswordLoginNotAllowed");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("InvalidCredentials");
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

