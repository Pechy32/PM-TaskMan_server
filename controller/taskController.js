import express from 'express';
import { createTaskService } from '../service/task/createTaskService.js';
import { getTasksByProjectService } from '../service/task/getTasksByProjectService.js';
import { getTaskService } from '../service/task/getTaskService.js';
import { updateTaskService } from '../service/task/updateTaskService.js';
import { deleteTaskService } from '../service/task/deleteTaskService.js';

const router = express.Router();

router.get('/', getTasksByProjectService);
router.post('/', createTaskService);
router.get('/:id', getTaskService);
router.patch('/:id', updateTaskService);
router.delete('/:id', deleteTaskService);

export default router;