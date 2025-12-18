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

/**
 * GET /api/projects/:projectId
 */
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = req.user; // { id, role }

    const project = await getProjectService(projectId, user);

    res.status(200).json(project);
  } catch (err) {
    if (err.message === "ProjectIdRequired") {
      return res.status(400).json({ error: err.message });
    }

    if (err.message === "ProjectNotFound") {
      return res.status(404).json({ error: err.message });
    }

    if (err.message === "Forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.status(500).json({ error: "InternalServerError" });
  }
});

router.post('/', createProjectService);
router.get('/:projectId/with-tasks', getTasksByProjectService);
router.patch('/:projectId', updateProjectService);
router.delete('/:projectId', deleteProjectService);

export default router;
