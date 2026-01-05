import express from "express";
import authenticateUser from "../functions/auth.js";
import { getAllCommunity, getCommunity, getUserCommunities, createCommunity, editCommunity, deleteCommunity, joinCommunity, leaveCommunity } from "../controllers/communityController.js";

const router = express.Router();

router.get("/",authenticateUser, getAllCommunity)
router.get("/:communityId", authenticateUser, getCommunity)
router.get("/user/:userId", authenticateUser, getUserCommunities)
router.post("/", authenticateUser, createCommunity);
router.put("/:communityId", authenticateUser,editCommunity);
router.delete("/:communityId", authenticateUser, deleteCommunity);
router.post("/:communityId/join", authenticateUser, joinCommunity);
router.post("/:communityId/leave", authenticateUser, leaveCommunity);

export default router;