import express from 'express';
import { getUserStatus } from '../controllers/statusController.js';
import authenticateUser from '../functions/auth.js';
const router = express.Router();


router.get("/:userId", authenticateUser, getUserStatus);

export default router;