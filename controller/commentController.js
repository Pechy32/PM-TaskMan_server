import express from "express";
import { updateCommentService } from "../service/task/commentService.js";

const router = express.Router();

/**
 * PATCH /comments/:commentId
 * Update comment (author or admin)
 */
router.patch("/comments/:commentId", updateCommentService);

export default router;