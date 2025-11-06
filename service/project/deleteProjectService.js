import { deleteProject, getProject } from "../../dao/projectDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

// API handler for deleting project
export async function deleteProjectService (req, res) {
  const { id } = req.params.id;
  
  const projectValidation = await validateEntity(id, getProject, "project")
  if (!projectValidation.valid){
    return res.status(400).json({ message: projectValidation.message })
  }

  try {
    const message = await deleteProject(id);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
