const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/adminAuth');
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleFavorite,
  bulkImportQuestions,
  clearQuestions
} = require('../controllers/questions');

// @route   GET api/questions
router.get('/', auth, getQuestions);

// @route   POST api/questions
router.post('/', adminAuth, createQuestion);

// @route   PUT api/questions/:id
router.put('/:id', adminAuth, updateQuestion);

// @route   DELETE api/questions/:id
router.delete('/:id', adminAuth, deleteQuestion);

// @route   DELETE api/questions (Clear all or category)
router.delete('/', adminAuth, clearQuestions);

// @route   POST api/questions/:id/favorite
router.post('/:id/favorite', adminAuth, toggleFavorite);

// @route   POST api/questions/import
router.post('/import', adminAuth, bulkImportQuestions);

module.exports = router;
