import express from 'express';

import { createProjectService } from '../service/project/createProjectService.js';
import { getAllProjectsService } from '../service/project/getAllProjectsService.js';
import { getProjectService } from '../service/project/getProjectService.js';
import { updateProjectService } from '../service/project/updateProjectService.js';
import { deleteProjectService } from '../service/project/deleteProjectService.js';

const router = express.Router();

router.get('/', getAllProjectsService);
router.post('/', createProjectService);
router.get('/:id', getProjectService);
router.patch('/:id', updateProjectService);
router.delete('/:id', deleteProjectService);

export default router;