const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/adminAuth');
const {
  loginUser,
  registerUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  adjustUserStats
} = require('../controllers/profile');

// @route   POST api/profile/login
router.post('/login', loginUser);

// @route   POST api/profile/register
router.post('/register', registerUser);

// @route   GET api/profile
router.get('/', adminAuth, getAllUsers);

// @route   GET api/profile/:id
router.get('/:id', auth, getUserProfile);

// @route   PUT api/profile/:id
router.put('/:id', auth, updateUserProfile);

// @route   POST api/profile/adjust-stats/:id
router.post('/adjust-stats/:id', adminAuth, adjustUserStats);

module.exports = router;
