import express from 'express';

import { createProjectService } from '../service/project/createProjectService.js';
import { getProjectsForUserContext } from '../service/project/getAllProjectsService.js';
import { getProjectService } from '../service/project/getProjectService.js';
import { updateProjectService } from '../service/project/updateProjectService.js';
import { deleteProjectService } from '../service/project/deleteProjectService.js';
import { getTasksByProjectService } from '../service/project/getTasksByProjectService.js';
import { createTaskService } from '../service/task/createTaskService.js';
import { getTaskService } from '../service/task/getTaskService.js';
import { updateTaskService } from '../service/task/updateTaskService.js';
import { deleteTaskService } from '../service/task/deleteTaskService.js';
import {
  getTaskCommentsService,
  createTaskCommentService,
  deleteTaskCommentService,
  updateCommentService,
} from "../service/task/commentService.js";
import {
  addProjectMemberService,
  getProjectMembersService,
  updateProjectMemberRoleService,
  removeProjectMemberService,
} from "../service/project/projectMemberService.js";

const router = express.Router();

/**
 * GET /api/projects
 */
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

/**
 * PATCH /api/projects/:projectId
 */
router.patch("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = req.user;           // { id, role }
    const updateData = req.body;

    const project = await updateProjectService(
      projectId,
      user,
      updateData
    );

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

/**
 * DELETE /api/projects/:projectId
 */
router.delete("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = req.user; // { id, role }

    await deleteProjectService(projectId, user);

    res.status(204).send(); // No Content
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

/**
 * POST /api/projects/:projectId/tasks
 * Vytvoří task v projektu
 * Přístup: admin | owner | editor
 */
router.post("/:projectId/tasks", createTaskService);

/**
 * GET /api/projects/:projectId/tasks/:taskId
 * Vrátí jeden task projektu
 * Přístup: admin | owner | member (editor/viewer)
 */
router.get("/:projectId/tasks/:taskId", getTaskService);

/**
 * PATCH /api/projects/:projectId/tasks/:taskId
 */
router.patch("/:projectId/tasks/:taskId", updateTaskService);

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 */
router.delete("/:projectId/tasks/:taskId", deleteTaskService);

router.post('/', createProjectService);
router.get('/:projectId/with-tasks', getTasksByProjectService);


// --------------------- COMMENTS -----------------------

/**
 * GET /projects/:projectId/tasks/:taskId/comments
 */
router.get(
  "/:projectId/tasks/:taskId/comments",
  getTaskCommentsService
);

/**
 * POST /projects/:projectId/tasks/:taskId/comments
 */
router.post(
  "/:projectId/tasks/:taskId/comments",
  createTaskCommentService
);

/**
 * DELETE /projects/:projectId/tasks/:taskId/comments/:commentId
 */
router.delete(
  "/:projectId/tasks/:taskId/comments/:commentId",
  deleteTaskCommentService
);

/**
 * PATCH /comments/:commentId
 * Update comment (author or admin)
 */
router.patch("/comments/:commentId", updateCommentService);

/**
 * POST /projects/:projectId/members
 */
router.post(
  "/:projectId/members",
  addProjectMemberService
);

/**
 * GET /projects/:projectId/members
 */
router.get(
  "/:projectId/members",
  getProjectMembersService
);

/**
 * PATCH /projects/:projectId/members/:userId
 */
router.patch(
  "/:projectId/members/:userId",
  updateProjectMemberRoleService
);

/**
 * DELETE /projects/:projectId/members/:userId
 */
router.delete(
  "/:projectId/members/:userId",
  removeProjectMemberService
);

export default router;
