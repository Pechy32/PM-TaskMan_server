import { getProject, updateProject } from "../../dao/projectDao.js";
import { getUserByEmail } from "../../dao/userDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

/* ============================================================
 * POST /projects/:projectId/members
 * admin | owner
 * ============================================================ */
export async function addProjectMemberService(req, res) {
  const { projectId } = req.params;
  const { email, role = "viewer" } = req.body;
  const user = req.user; // { id, role }

  // validate input
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "UserEmailRequired" });
  }

  if (!["editor", "viewer"].includes(role)) {
    return res.status(400).json({ message: "InvalidRole" });
  }

  // validate project
  const projectValidation = await validateEntity(
    projectId,
    getProject,
    "project"
  );
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message });
  }

  const project = await getProject(projectId);

  // authorization
  const isAdmin = user.role === "admin";
  const isOwner = project.ownerId.toString() === user.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // find user by email
  const memberUser = await getUserByEmail(email.toLowerCase());
  if (!memberUser) {
    return res.status(404).json({ message: "UserNotFound" });
  }

  const memberUserId = memberUser._id.toString();

  // prevent adding owner
  if (project.ownerId.toString() === memberUserId) {
    return res.status(409).json({ message: "UserIsProjectOwner" });
  }

  // prevent duplicates
  const alreadyMember = project.members.some(
    (m) => m.userId.toString() === memberUserId
  );

  if (alreadyMember) {
    return res.status(409).json({ message: "UserAlreadyMember" });
  }

  // add member
  project.members.push({
    userId: memberUserId,
    role,
  });

  await project.save();

  return res.status(201).json({
    userId: memberUserId,
    email: memberUser.email,
    role,
  });
}

/* ============================================================
 * GET /projects/:projectId/members
 * admin | owner | editor | viewer
 * ============================================================ */
export async function getProjectMembersService(req, res) {
  const { projectId } = req.params;
  const user = req.user;

  // validate project
  const projectValidation = await validateEntity(
    projectId,
    getProject,
    "project"
  );
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message });
  }

  const project = await getProject(projectId);

  // authorization
  const isAdmin = user.role === "admin";
  const isOwner = project.ownerId.toString() === user.id;
  const isMember = project.members.some(
    (m) => m.userId.toString() === user.id
  );

  if (!isAdmin && !isOwner && !isMember) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // populate members
  await project.populate("members.userId", "name email");

  const members = project.members.map((m) => ({
    userId: m.userId._id,
    name: m.userId.name,
    email: m.userId.email,
    role: m.role,
  }));

  return res.status(200).json(members);
}

/* ============================================================
 * PATCH /projects/:projectId/members/:userId
 * admin | owner
 * ============================================================ */
export async function updateProjectMemberRoleService(req, res) {
  const { projectId, userId } = req.params;
  const { role } = req.body;
  const user = req.user;

  if (!["editor", "viewer"].includes(role)) {
    return res.status(400).json({ message: "InvalidRole" });
  }

  // validate project
  const projectValidation = await validateEntity(
    projectId,
    getProject,
    "project"
  );
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message });
  }

  const project = await getProject(projectId);

  // authorization
  const isAdmin = user.role === "admin";
  const isOwner = project.ownerId.toString() === user.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // cannot modify owner
  if (project.ownerId.toString() === userId) {
    return res.status(400).json({ message: "CannotModifyOwner" });
  }

  const member = project.members.find(
    (m) => m.userId.toString() === userId
  );

  if (!member) {
    return res.status(404).json({ message: "MemberNotFound" });
  }

  member.role = role;
  await project.save();

  return res.status(200).json({
    userId,
    role,
  });
}

/* ============================================================
 * DELETE /projects/:projectId/members/:userId
 * admin | owner
 * ============================================================ */
export async function removeProjectMemberService(req, res) {
  const { projectId, userId } = req.params;
  const user = req.user;

  // validate project
  const projectValidation = await validateEntity(
    projectId,
    getProject,
    "project"
  );
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message });
  }

  const project = await getProject(projectId);

  // authorization
  const isAdmin = user.role === "admin";
  const isOwner = project.ownerId.toString() === user.id;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // cannot remove owner
  if (project.ownerId.toString() === userId) {
    return res.status(400).json({ message: "CannotRemoveOwner" });
  }

  const memberIndex = project.members.findIndex(
    (m) => m.userId.toString() === userId
  );

  if (memberIndex === -1) {
    return res.status(404).json({ message: "MemberNotFound" });
  }

  project.members.splice(memberIndex, 1);
  await project.save();

  return res.status(204).send();
}
