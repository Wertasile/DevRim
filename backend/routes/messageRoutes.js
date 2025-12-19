import express from "express";
import {
  allMessages,
  sendMessage,
  deleteMessage
} from "../controllers/messageController.js";
import authenticateUser from "../functions/auth.js";

const router = express.Router();

router.get("/:chatId", allMessages);
router.delete("/:messageId", authenticateUser, deleteMessage)
router.post("/",authenticateUser, sendMessage);

export default router;