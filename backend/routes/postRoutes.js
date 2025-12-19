import * as postsController from "../controllers/postsController.js";
import express from 'express';
import authenticateUser from "../functions/auth.js";
const router = express.Router();

/* GET users listing. */
router.get('/', authenticateUser, postsController.fetchPosts);
router.get('/:id', authenticateUser, postsController.fetchUserPosts);
router.post('/', authenticateUser, postsController.createPost);
router.post('/:id', postsController.getPost);
router.put('/:id', authenticateUser, postsController.updatePost);
router.delete('/:id', postsController.deletePost);

export default router;