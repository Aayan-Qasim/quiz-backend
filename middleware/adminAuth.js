const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate and authorize administrator access
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No authorization token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Token is invalid, associated user not found.' });
    }

    if (!user.isAdmin && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Administrative rights required.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Admin Auth Middleware Error:', err.message);
    res.status(401).json({ message: 'Token is invalid or has expired.' });
  }
};

// General user authentication middleware for standard operations
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No authorization token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Token is invalid, associated user not found.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('User Auth Middleware Error:', err.message);
    res.status(401).json({ message: 'Token is invalid or has expired.' });
  }
};

module.exports = {
  adminAuth,
  auth
};
