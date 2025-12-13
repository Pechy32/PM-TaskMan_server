import { deleteProject, getProject } from "../../dao/projectDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

// API handler for deleting project
export async function deleteProjectService (req, res) {
  const { projectId: id } = req.params;
  
  const projectValidation = await validateEntity(id, getProject, "project")
  if (!projectValidation.valid){
    return res.status(400).json({ message: projectValidation.message })
  }

  try {
    const message = await deleteProject(id);
    return res.json({ message: "Successfully deleted project" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
