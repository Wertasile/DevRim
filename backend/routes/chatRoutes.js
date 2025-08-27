const express = require("express");
const {
  accessChat,
  fetchChats,
  deleteChat,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
} = require("../controllers/chatController");
const authenticateUser = require("../functions/auth");

const router = express.Router();  // router gets initialised, allowing us to define routes specific to chat functionalities

router.post("/", authenticateUser, accessChat);
router.get("/", authenticateUser, fetchChats);
router.delete("/:chatId", deleteChat);
router.post("/group", createGroupChat);
router.put("/rename", renameGroup);
router.put("/groupremove", removeFromGroup);
router.put("/groupadd", addToGroup);

module.exports = router;