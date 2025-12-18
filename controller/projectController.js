import express from 'express';

import { createProjectService } from '../service/project/createProjectService.js';
import { getProjectsForUserContext } from '../service/project/getAllProjectsService.js';
import { getProjectService } from '../service/project/getProjectService.js';
import { updateProjectService } from '../service/project/updateProjectService.js';
import { deleteProjectService } from '../service/project/deleteProjectService.js';
import { getTasksByProjectService } from '../service/project/getTasksByProjectService.js';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const projects = await getProjectsForUserContext(req.user);
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: "InternalServerError" });
  }
});

router.post('/', createProjectService);
router.get('/:projectId', getProjectService);
router.get('/:projectId/with-tasks', getTasksByProjectService);
router.patch('/:projectId', updateProjectService);
router.delete('/:projectId', deleteProjectService);

export default router;
