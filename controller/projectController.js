import express from 'express';

import { createProjectService } from '../service/project/createProjectService.js';
import { getAllProjectsService } from '../service/project/getAllProjectsService.js';
import { getProjectService } from '../service/project/getProjectService.js';
import { updateProjectService } from '../service/project/updateProjectService.js';
import { deleteProjectService } from '../service/project/deleteProjectService.js';
import { getTasksByProjectService } from '../service/project/getTasksByProjectService.js';

const router = express.Router();

router.get('/', getAllProjectsService);
router.post('/', createProjectService);
router.get('/:projectId', getProjectService);
router.get('/:projectId/with-tasks', getTasksByProjectService);
router.patch('/:projectId', updateProjectService);
router.delete('/:projectId', deleteProjectService);

export default router;
