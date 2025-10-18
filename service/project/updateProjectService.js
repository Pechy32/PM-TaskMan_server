import { updateProject } from "../../dao/projectDao.js";
import mongoose from 'mongoose';

// API handler for updating project
export async function updateProjectService (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  try {
    const project = await updateProject(req.params.id, req.body);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
}