const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageController");
const { authenticateUser } = require("../functions/auth");

const router = express.Router();

router.get("/:chatId", allMessages);
router.post("/",sendMessage);

module.exports = router;