import { logUserAction } from "../controllers/logController.js";
import authenticateUser from "../functions/auth.js";

import express from 'express';
const router = express.Router();

/* GET users listing. */
router.post('/', authenticateUser, logUserAction);

export default router;
