const { logUserAction } = require("../controllers/logController");
const authenticateUser = require("../functions/auth");
// const protect =require("../functions/auth")

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', authenticateUser, logUserAction)

module.exports = router;
