const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage
} = require("../controllers/messageController");
const  authenticateUser = require("../functions/auth");

const router = express.Router();

router.get("/:chatId", allMessages);
router.delete("/:messageId", authenticateUser, deleteMessage)
router.post("/",authenticateUser, sendMessage);

module.exports = router;