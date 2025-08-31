const express = require("express");

const {
  getComments,
  addComment,
} = require("../controllers/commentController");

const  authenticateUser = require("../functions/auth");

const router = express.Router();

router.get("/:listId", authenticateUser, fetchList);
router.post("/", authenticateUser, createList);
router.update("/:listId", authenticateUser,updateList);
router.delete("/:listId", authenticateUser, deleteList);

module.exports = router;