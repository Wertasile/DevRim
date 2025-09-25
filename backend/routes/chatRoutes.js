const express = require("express");
const {
  accessChat,
  fetchChats,
  deleteChat,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  editGroupUsers,
  pinMessage,
  unpinMessage
} = require("../controllers/chatController");
const authenticateUser = require("../functions/auth");

const router = express.Router();  // router gets initialised, allowing us to define routes specific to chat functionalities

router.post("/", authenticateUser, accessChat);
router.get("/", authenticateUser, fetchChats);
router.delete("/:chatId", authenticateUser, deleteChat);
router.post("/group", authenticateUser, createGroupChat);
router.put("/rename/:chatId", authenticateUser, renameGroup);
// router.put("/groupremove", authenticateUser, removeFromGroup);
// router.put("/groupadd", authenticateUser, addToGroup);
router.put("/groupedit/:chatId", authenticateUser, editGroupUsers);
router.put("/pin/:chatId", authenticateUser, pinMessage)
router.put("/unpin/:chatid", authenticateUser, unpinMessage)

module.exports = router;