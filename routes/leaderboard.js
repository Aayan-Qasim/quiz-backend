const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/adminAuth');
const { getWeeklyLeaderboard, getAllTimeLeaderboard } = require('../controllers/leaderboard');

// @route   GET api/leaderboard/weekly
router.get('/weekly', auth, getWeeklyLeaderboard);

// @route   GET api/leaderboard/alltime
router.get('/alltime', auth, getAllTimeLeaderboard);

module.exports = router;
