const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const { getDashboardStats } = require('../controllers/analytics');

// @route   GET api/analytics/dashboard
router.get('/dashboard', adminAuth, getDashboardStats);

module.exports = router;
