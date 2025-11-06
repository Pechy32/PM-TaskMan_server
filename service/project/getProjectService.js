import { getProject } from "../../dao/projectDao.js";
import mongoose from 'mongoose';

// API handler for getting project by id
export async function getProjectService (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  try {
    const project = await getProject(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    return res.json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}