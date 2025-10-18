import { getAllProjects } from "../../dao/projectDao.js";

// API handler for getting all projects
export async function getAllProjectsService (req, res) {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}