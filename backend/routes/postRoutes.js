const postsController = require("../controllers/postsController")

var express = require('express');
const authenticateUser = require("../functions/auth");
var router = express.Router();

/* GET users listing. */
router.get('/', authenticateUser, postsController.fetchPosts);
router.get('/:id', authenticateUser, postsController.fetchUserPosts);
router.post('/', authenticateUser, postsController.createPost);
router.post('/:id', postsController.getPost);
router.put('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

module.exports = router;