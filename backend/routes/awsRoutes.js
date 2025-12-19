import express from 'express';
import addImage from '../controllers/awsController.js';

const router = express.Router();

router.post('/image',addImage)

export default router;