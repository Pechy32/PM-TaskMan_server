import { Task } from '../model/taskModel.js';

export async function createTask(taskData) {
  return await Task.create(taskData);
}

export async function getTaskById(taskId) {
  return await Task.findById(taskId)
    .populate("assignedTo", "name email")
    .populate("comments.authorId", "name");
}

export async function getTasksByProject(projectId) {
  return await Task.find({ projectId, parentTaskId: null })
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 });
}

export async function getSubtasks(parentTaskId) {
  return await Task.find({ parentTaskId }).sort({ createdAt: 1 });
}

export async function updateTask(taskId, updates) {
  return await Task.findByIdAndUpdate(taskId, updates, { new: true });
}

export async function deleteTask(taskId) {
  return await Task.findByIdAndDelete(taskId);
}

export async function addComment(taskId, commentData) {
  return await Task.findByIdAndUpdate(
    taskId,
    { $push: { comments: commentData } },
    { new: true }
  ).populate("comments.authorId", "name");
}
