import { getUserById } from "../../dao/userDao.js";

export async function getCurrentUser(userId) {
  if (!userId) {
    throw new Error("UserIdRequired");
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("UserNotFound");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    googleLinked: !!user.googleId,
    createdAt: user.createdAt,
  };
}
