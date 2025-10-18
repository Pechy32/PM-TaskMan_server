import { deleteProject } from "../../dao/projectDao.js";
import mongoose from 'mongoose';

// API handler for deleting project
export async function deleteProjectService (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  try {
    const message = await deleteProject(req.params.id);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
