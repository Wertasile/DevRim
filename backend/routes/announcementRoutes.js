import express from "express";
import authenticateUser from "../functions/auth.js";
import { createAnnouncement, deleteAnnouncement } from "../controllers/announcementController.js";

const router = express.Router();

router.post("/", authenticateUser, createAnnouncement);
router.delete("/:announcementId", authenticateUser, deleteAnnouncement);

export default router;

