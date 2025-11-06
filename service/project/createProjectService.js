import { createProject } from "../../dao/projectDao.js";
import { getUser } from "../../dao/userDao.js";
import { validateEntity } from "../../helpers/validators/validateEntity.js";

export async function createProjectService(req, res) {
  const dtoIn = req.body;

  const ownerValidation = await validateEntity(dtoIn.ownerId, getUser, "user");
  if (!ownerValidation.valid) {
    return res.status(400).json({ message: ownerValidation.message });
  }

  try {
    const project = await createProject(dtoIn);
    res.status(201).json(project);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
}