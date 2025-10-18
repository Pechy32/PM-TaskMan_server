import { Project } from "../model/projectModel.js";

export const createProject = async (data) => {
  const project = new Project(data);
  return await project.save();
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