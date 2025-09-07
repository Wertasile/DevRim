const express = require("express");


const  authenticateUser = require("../functions/auth");
const { getAllList, fetchList, createList, addToList, deleteFromList, deleteList } = require("../controllers/listController");

const router = express.Router();

router.get("/user/:userId", authenticateUser, getAllList)
router.get("/:listId", authenticateUser, fetchList);
router.post("/", authenticateUser, createList);
router.put("/:listId/blogs/:blogId", authenticateUser,addToList);
router.delete("/:listId/blogs/:blogId", authenticateUser, deleteFromList);
router.delete("/:listId", authenticateUser, deleteList);

module.exports = router;