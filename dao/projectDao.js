import mongoose from 'mongoose';

import { Project } from "../model/projectModel.js";
import {Task} from "../model/taskModel.js";
import {deleteTasksByProjectId} from "./taskDao.js";

export const createProject = async (data) => {
  const project = new Project(data);
  return await project.save();
};

export const getAllProjects = async () => {
  return await Project.find();
};

export const getProject = async (id) => {
  let objectId;
  if (mongoose.Types.ObjectId.isValid(id)) {
      objectId = id;
  } else {
      objectId = new mongoose.Types.ObjectId(id);
  }
  return await Project.findById(objectId);
};

export const updateProject = async (id, data) => {
  return await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteProject = async (id) => {
    const session = await mongoose.startSession();

    let response;
    await session.withTransaction(async () => {
        await deleteTasksByProjectId(id, session);
        response = await Project.deleteOne({ _id: id }, { session });
    });

    await session.endSession();

    return response;
};

export const getProjectsForUser = async (userId) => {
  return await Project.find({
    $or: [
      { ownerId: userId },
      { "members.userId": userId }
    ]
  });
};
