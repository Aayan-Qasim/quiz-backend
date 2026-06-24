const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/adminAuth');
const { getCategories, performCategoryOperation } = require('../controllers/categories');

// @route   GET api/categories
router.get('/', auth, getCategories);

// @route   POST api/categories/operation
router.post('/operation', adminAuth, performCategoryOperation);

module.exports = router;
