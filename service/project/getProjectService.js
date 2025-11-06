import { getProject } from "../../dao/projectDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

// API handler for getting project by id
export async function getProjectService(req, res) {
  const { id } = req.params.id;

  const projectValidation = await validateEntity(id, getProject, "project")
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message })
  }

  try {
    const project = await getProject(id);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}