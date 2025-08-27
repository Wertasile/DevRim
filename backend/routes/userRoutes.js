const userController = require("../controllers/userController");
const authenticateUser = require("../functions/auth");
// const protect =require("../functions/auth")

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/logout', authenticateUser, userController.logoutUser);
router.post('/login', userController.loginUser);
router.get('/:userid', userController.fetchUser,);
router.post('/', userController.createUser);

module.exports = router;
