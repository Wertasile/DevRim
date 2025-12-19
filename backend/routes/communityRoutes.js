import express from "express";
import authenticateUser from "../functions/auth.js";
import { getAllCommunity, getCommunity, createCommunity, editCommunity, deleteCommunity } from "../controllers/communityController.js";

const router = express.Router();

router.get("/",authenticateUser, getAllCommunity)
router.get("/:communityId", authenticateUser, getCommunity)
router.post("/", authenticateUser, createCommunity);
router.put("/:communityId", authenticateUser,editCommunity);
router.delete("/:communityId", authenticateUser, deleteCommunity);

export default router;