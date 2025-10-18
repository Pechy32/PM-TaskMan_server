import { createProject } from "../../dao/projectDao.js";

// API handler for creating a project
export async function createProjectService (req, res) {
  try {
    const project = await createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
}