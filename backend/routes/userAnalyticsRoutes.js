import { getSummary, getHistory, getRecommendation, getTrending } from "../controllers/userAnalyticsController.js";
import authenticateUser from "../functions/auth.js";

import express from 'express';
const router = express.Router();

/* GET users listing. */
router.get('/summary', authenticateUser, getSummary)
router.get('/history', authenticateUser, getHistory)
router.get('/recommendations', authenticateUser, getRecommendation)
router.get('/trending', authenticateUser, getTrending);

export default router;
