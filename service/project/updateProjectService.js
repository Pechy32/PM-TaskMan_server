import { getProject, updateProject} from "../../dao/projectDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

// API handler for updating project
export async function updateProjectService(req, res) {
  const { projectId: id } = req.params;

  const projectValidation = await validateEntity(id, getProject, "project")
  if (!projectValidation.valid) {
    return res.status(400).json({ message: projectValidation.message })
  }

  try {
    const project = await updateProject(id, req.body);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    return res.json(project);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: error.message });
  }
}
