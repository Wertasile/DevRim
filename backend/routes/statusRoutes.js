var express = require('express');
const { getUserStatus } = require('../controllers/statusController');
const authenticateUser = require('../functions/auth');
var router = express.Router();


router.get("/:userId", authenticateUser ,getUserStatus)

module.exports = router