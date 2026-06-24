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
  clearQuestions,
  getTestQuestionsSession
} = require('../controllers/questions');

// @route   GET api/questions
router.get('/', auth, getQuestions);

// @route   GET api/questions/test-session
router.get('/test-session', auth, getTestQuestionsSession);

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
