const { getSummary, getHistory, getRecommendation } = require("../controllers/userAnalyticsController");
const authenticateUser = require("../functions/auth");
// const protect =require("../functions/auth")

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/summary', authenticateUser, getSummary)
router.get('/history', authenticateUser, getHistory)
router.get('/recommendations', authenticateUser, getRecommendation)


module.exports = router;
