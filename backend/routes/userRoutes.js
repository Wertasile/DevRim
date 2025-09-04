const { logoutUser, loginUser, fetchUser, createUser, likeBlog, unlikeBlog, allUsers} = require("../controllers/userController");
const authenticateUser = require("../functions/auth");
// const protect =require("../functions/auth")

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', authenticateUser, allUsers)
router.get('/logout', authenticateUser, logoutUser);
router.post('/login', loginUser);
router.get('/:userid', fetchUser,);
router.post('/', createUser);
router.put('/like/:blogId', authenticateUser, likeBlog)
router.delete('/like/:blogId', authenticateUser, unlikeBlog)

module.exports = router;
