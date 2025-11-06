import { updateProject } from "../../dao/projectDao.js";

// API handler for updating project
export async function updateProjectService(req, res) {
  const { id } = req.params.id;

  const projectValidation = await validateEntity(id, getProject, "project")
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message })
  }

  try {
    const project = await updateProject(id, req.body);
    res.json(project);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
}