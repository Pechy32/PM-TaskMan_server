import { getProject } from "../../dao/projectDao.js";
import { getTaskById, updateTask } from "../../dao/taskDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

/* ============================================================
 * Helper – authorization against project
 * ============================================================ */
function getProjectAccess(project, user) {
  if (user.role === "admin") {
    return { canRead: true, canWrite: true, isOwner: true };
  }

  const userId = user.id;

  const isOwner = project.ownerId.toString() === userId;

  const member = project.members.find(
    (m) => m.userId.toString() === userId
  );

  const isEditor = member?.role === "editor";
  const isViewer = member?.role === "viewer";

  return {
    canRead: isOwner || isEditor || isViewer,
    canWrite: isOwner || isEditor,
    isOwner,
  };
}

/* ============================================================
 * GET comments
 * admin | owner | editor | viewer
 * ============================================================ */
export async function getTaskCommentsService(req, res) {
  const { projectId, taskId } = req.params;
  const user = req.user;

  // 1️⃣ validate project
  const projectValidation = await validateEntity(
    projectId,
    getProject,
    "project"
  );
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message });
  }

  const project = await getProject(projectId);

  // 2️⃣ authorization
  const access = getProjectAccess(project, user);
  if (!access.canRead) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // 3️⃣ validate task
  const taskValidation = await validateEntity(
    taskId,
    getTaskById,
    "task"
  );
  if (!taskValidation.valid) {
    return res.status(404).json({ message: taskValidation.message });
  }

  const task = await getTaskById(taskId);

  // 4️⃣ task must belong to project
  if (task.projectId.toString() !== projectId) {
    return res.status(404).json({ message: "TaskNotInProject" });
  }

  return res.status(200).json(task.comments || []);
}

/* ============================================================
 * POST comment
 * admin | owner | editor
 * ============================================================ */
export async function createTaskCommentService(req, res) {
  const { projectId, taskId } = req.params;
  const { content } = req.body;
  const user = req.user;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ message: "ContentRequired" });
  }

  // 1️⃣ validate project
  const projectValidation = await validateEntity(
    projectId,
    getProject,
    "project"
  );
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message });
  }

  const project = await getProject(projectId);

  // 2️⃣ authorization
  const access = getProjectAccess(project, user);
  if (!access.canWrite) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // 3️⃣ validate task
  const taskValidation = await validateEntity(
    taskId,
    getTaskById,
    "task"
  );
  if (!taskValidation.valid) {
    return res.status(404).json({ message: taskValidation.message });
  }

  const task = await getTaskById(taskId);

  if (task.projectId.toString() !== projectId) {
    return res.status(404).json({ message: "TaskNotInProject" });
  }

  // 4️⃣ create comment
  const newComment = {
    authorId: user.id,
    content,
    createdAt: new Date(),
  };

  task.comments.push(newComment);
  await task.save();

  const createdComment = task.comments[task.comments.length - 1];

  return res.status(201).json(createdComment);
}

/* ============================================================
 * DELETE comment
 * admin | owner
 * ============================================================ */
export async function deleteTaskCommentService(req, res) {
  const { projectId, taskId, commentId } = req.params;
  const user = req.user;

  // 1️⃣ validate project
  const projectValidation = await validateEntity(
    projectId,
    getProject,
    "project"
  );
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message });
  }

  const project = await getProject(projectId);

  // 2️⃣ authorization
  const access = getProjectAccess(project, user);
  if (!access.isOwner && user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  // 3️⃣ validate task
  const taskValidation = await validateEntity(
    taskId,
    getTaskById,
    "task"
  );
  if (!taskValidation.valid) {
    return res.status(404).json({ message: taskValidation.message });
  }

  const task = await getTaskById(taskId);

  if (task.projectId.toString() !== projectId) {
    return res.status(404).json({ message: "TaskNotInProject" });
  }

  // 4️⃣ remove comment
  const commentIndex = task.comments.findIndex(
    (c) => c._id.toString() === commentId
  );

  if (commentIndex === -1) {
    return res.status(404).json({ message: "CommentNotFound" });
  }

  task.comments.splice(commentIndex, 1);
  await task.save();

  return res.status(204).send();
}

/* ============================================================
 * PATCH /comments/:commentId
 * author | admin
 * ============================================================ */
export async function updateCommentService(req, res) {
  const { commentId } = req.params;
  const { content } = req.body;
  const user = req.user; // { id, role }

  if (!content || typeof content !== "string") {
    return res.status(400).json({ message: "ContentRequired" });
  }

  // 1️⃣ find task containing the comment
  const task = await Task.findOne({
    "comments._id": commentId,
  });

  if (!task) {
    return res.status(404).json({ message: "CommentNotFound" });
  }

  // 2️⃣ find comment
  const comment = task.comments.id(commentId);

  if (!comment) {
    return res.status(404).json({ message: "CommentNotFound" });
  }

  // 3️⃣ authorization
  const isAuthor = comment.authorId.toString() === user.id;
  const isAdmin = user.role === "admin";

  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // 4️⃣ update
  comment.content = content;
  await task.save();

  return res.status(200).json({
    _id: comment._id,
    authorId: comment.authorId,
    content: comment.content,
    createdAt: comment.createdAt,
  });
}
