const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/adminAuth');
const { getAllResults, getUserResults, submitQuizResult } = require('../controllers/results');

// @route   GET api/results
router.get('/', adminAuth, getAllResults);

// @route   GET api/results/user/:userId
router.get('/user/:userId', auth, getUserResults);

// @route   POST api/results
router.post('/', auth, submitQuizResult);

module.exports = router;
