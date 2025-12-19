import express from "express";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment
} from "../controllers/commentController.js";

import authenticateUser from "../functions/auth.js";

const router = express.Router();

router.get("/:postId", getComments);
router.post("/:postId",authenticateUser, addComment);
router.put("/:postId", authenticateUser, updateComment);
router.delete("/:postId", authenticateUser, deleteComment);
export default router;