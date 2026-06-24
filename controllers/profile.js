const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, isAdmin: user.isAdmin },
    process.env.JWT_SECRET || 'quizmaster_secret_key_change_me_in_production',
    { expiresIn: '30d' }
  );
}

// Helper to calculate user's level based on points
function calculateLevel(p) {
  if (p >= 500) return 5;
  if (p >= 300) return 4;
  if (p >= 150) return 3;
  if (p >= 50) return 2;
  return 1;
}

// @desc    Authenticate user & get token (Login)
// @route   POST api/profile/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ message: 'User associated with this email address does not exist.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Check password spelling.' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user
    });
  } catch (err) {
    console.error('loginUser Controller Error:', err.message);
    res.status(550).json({ message: 'Server error during authentication.' });
  }
};

// @desc    Register a new user (Postman only)
// @route   POST api/profile/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      return res.status(400).json({ message: 'User already exists with this email address.' });
    }

    const role = isAdmin ? 'admin' : 'user';

    user = new User({
      name: name.trim(),
      email: cleanEmail,
      password,
      isAdmin: !!isAdmin,
      role
    });

    await user.save();
    const token = generateToken(user);

    res.status(201).json({
      token,
      user
    });
  } catch (err) {
    console.error('registerUser Controller Error:', err.message);
    res.status(500).json({ message: 'Server error during user registration.' });
  }
};

// @desc    Get all student users (Admin-only)
// @route   GET api/profile
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } });
    res.json(users);
  } catch (err) {
    console.error('getAllUsers Controller Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving user listing.' });
  }
};

// @desc    Get user profile by ID
// @route   GET api/profile/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('getUserProfile Controller Error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.status(550).json({ message: 'Server error retrieving profile.' });
  }
};

// @desc    Update user profile by ID
// @route   PUT api/profile/:id
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
    }

    const { name, email, profileImageUri, password, phone, gender } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    if (name) user.name = name.trim();
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ message: 'Email is already in use by another account.' });
      }
      user.email = cleanEmail;
    }
    if (profileImageUri !== undefined) user.profileImageUri = profileImageUri;
    if (password) user.password = password;
    if (phone !== undefined) user.phone = phone.trim();
    if (gender !== undefined) user.gender = gender;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('updateUserProfile Controller Error:', err.message);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

// @desc    Manually adjust user stats (Admin-only)
// @route   POST api/profile/adjust-stats/:id
// @access  Private/Admin
exports.adjustUserStats = async (req, res) => {
  try {
    const { totalPoints, streak, level } = req.body;

    if (totalPoints === undefined || streak === undefined) {
      return res.status(400).json({ message: 'Please provide both totalPoints and streak parameters.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    user.totalPoints = totalPoints;
    user.streak = streak;
    user.level = (level !== undefined && level > 0) ? level : calculateLevel(totalPoints);
    user.score = Math.floor(totalPoints / 10);

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('adjustUserStats Controller Error:', err.message);
    res.status(500).json({ message: 'Server error adjusting user statistics.' });
  }
};
