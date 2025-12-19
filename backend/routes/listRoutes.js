import express from "express";
import authenticateUser from "../functions/auth.js";
import { getAllList, fetchList, createList, addToList, deleteFromList, updateList, deleteList } from "../controllers/listController.js";

const router = express.Router();

router.get("/user/:userId", authenticateUser, getAllList)
router.get("/:listId", authenticateUser, fetchList);
router.post("/", authenticateUser, createList);
router.put("/:listId", authenticateUser, updateList);
router.put("/:listId/blogs/:blogId", authenticateUser,addToList);
router.delete("/:listId/blogs/:blogId", authenticateUser, deleteFromList);
router.delete("/:listId", authenticateUser, deleteList);

export default router;