const express = require("express");

const {
  getComments,
  addComment,
  updateComment,
  deleteComment
} = require("../controllers/commentController");

const  authenticateUser = require("../functions/auth");

const router = express.Router();

router.get("/:postId", getComments);
router.post("/:postId",authenticateUser, addComment);
router.put("/:postId", authenticateUser, updateComment);
router.delete("/:postId", authenticateUser, deleteComment);
module.exports = router;