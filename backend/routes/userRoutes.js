import { 
    logoutUser,
    loginUser,
    fetchUser,
    createUser,
    likeBlog,
    unlikeBlog,
    allUsers,
    follow,
    unfollow,
    connect,
    disconnect,
    accept,
    decline,
    updateUser
} from "../controllers/userController.js";
import authenticateUser from "../functions/auth.js";

import express from 'express';
const router = express.Router();

/* GET users listing. */
router.get('/', authenticateUser, allUsers)
router.get('/logout', authenticateUser, logoutUser);
router.post('/login', loginUser);
router.get('/:userid', fetchUser,);
router.post('/', createUser);
router.put('/like/:blogId', authenticateUser, likeBlog)
router.delete('/like/:blogId', authenticateUser, unlikeBlog)
router.put('/follow/:userId', authenticateUser, follow)
router.delete('/unfollow/:userId', authenticateUser, unfollow)
router.put('/connect/:userId', authenticateUser, connect)
router.delete('/connect/:userId', authenticateUser, disconnect)
router.put('/connect/accept/:userId', authenticateUser, accept)
router.delete('/connect/decline/:userId', authenticateUser, decline)
router.put('/me', authenticateUser, updateUser);

export default router;
