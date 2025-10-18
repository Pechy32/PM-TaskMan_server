import { Project } from "../model/projectModel.js";

export const createProject = async (data) => {
  const solver = new Project(data);
  return await solver.save();
};

export const getAllProjects = async () => {
  return await Project.find();
};

export const getProject = async (id) => {
  return await Project.findById(id);
};

export const updateProject = async (id, data) => {
  return await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteProject = async (id) => {
  return await Project.findByIdAndDelete(id);
};