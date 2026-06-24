const Question = require('../models/Question');

// @desc    Get questions with optional filters (category, isCustom)
// @route   GET api/questions
// @access  Private
exports.getQuestions = async (req, res) => {
  try {
    const { category, isCustom } = req.query;
    let query = {};

    if (category) {
      query.category = { $regex: new RegExp('^' + category.trim() + '$', 'i') };
    }

    if (isCustom !== undefined) {
      query.isCustom = isCustom === 'true';
    }

    const questions = await Question.find(query);
    res.json(questions);
  } catch (err) {
    console.error('getQuestions Controller Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving questions.' });
  }
};

// @desc    Create a custom question (Admin-only)
// @route   POST api/questions
// @access  Private/Admin
exports.createQuestion = async (req, res) => {
  try {
    const {
      category,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation
    } = req.body;

    if (!category || !questionText || !optionA || !optionB || !correctAnswer) {
      return res.status(400).json({ message: 'Please provide all required question fields.' });
    }

    const newQuestion = new Question({
      category: category.trim(),
      questionText: questionText.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: (optionC || '-').trim(),
      optionD: (optionD || '-').trim(),
      correctAnswer,
      explanation: (explanation || '').trim(),
      isCustom: true,
      isFavorite: false
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (err) {
    console.error('createQuestion Controller Error:', err.message);
    res.status(500).json({ message: 'Server error saving custom question.' });
  }
};

// @desc    Update a question (Admin-only)
// @route   PUT api/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res) => {
  try {
    const {
      category,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
      isFavorite
    } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question model not found.' });
    }

    if (category) question.category = category.trim();
    if (questionText) question.questionText = questionText.trim();
    if (optionA) question.optionA = optionA.trim();
    if (optionB) question.optionB = optionB.trim();
    if (optionC !== undefined) question.optionC = optionC.trim();
    if (optionD !== undefined) question.optionD = optionD.trim();
    if (correctAnswer) question.correctAnswer = correctAnswer;
    if (explanation !== undefined) question.explanation = explanation.trim();
    if (isFavorite !== undefined) question.isFavorite = !!isFavorite;

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (err) {
    console.error('updateQuestion Controller Error:', err.message);
    res.status(500).json({ message: 'Server error updating question.' });
  }
};

// @desc    Delete a question (Admin-only)
// @route   DELETE api/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question model not found.' });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question successfully deleted.' });
  } catch (err) {
    console.error('deleteQuestion Controller Error:', err.message);
    res.status(550).json({ message: 'Server error deleting question.' });
  }
};

// @desc    Toggle favorite status (Admin-only)
// @route   POST api/questions/:id/favorite
// @access  Private/Admin
exports.toggleFavorite = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question model not found.' });
    }

    question.isFavorite = !question.isFavorite;
    await question.save();
    res.json(question);
  } catch (err) {
    console.error('toggleFavorite Controller Error:', err.message);
    res.status(500).json({ message: 'Server error toggling favorite status.' });
  }
};

// @desc    Bulk import questions (Admin-only)
// @route   POST api/questions/import
// @access  Private/Admin
exports.bulkImportQuestions = async (req, res) => {
  try {
    const rawList = req.body;

    if (!Array.isArray(rawList)) {
      return res.status(400).json({ message: 'Request body must be an array of questions.' });
    }

    const questionsToInsert = [];
    rawList.forEach(item => {
      if (!item) return;
      const qText = item.questionText || item.question || '';
      if (item.category && qText && item.optionA && item.optionB) {
        questionsToInsert.push({
          category: String(item.category).trim(),
          questionText: String(qText).trim(),
          optionA: String(item.optionA).trim(),
          optionB: String(item.optionB).trim(),
          optionC: String(item.optionC || '-').trim(),
          optionD: String(item.optionD || '-').trim(),
          correctAnswer: (item.correctAnswer || 'A').toUpperCase(),
          explanation: String(item.explanation || '').trim(),
          isFavorite: false,
          isCustom: true
        });
      }
    });

    if (questionsToInsert.length === 0) {
      return res.status(400).json({ message: 'No valid questions found to import.' });
    }

    const result = await Question.insertMany(questionsToInsert);
    res.json({
      message: 'Questions bulk imported successfully.',
      count: result.length
    });
  } catch (err) {
    console.error('bulkImportQuestions Controller Error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed on some imported questions: ' + err.message
      });
    }
    res.status(500).json({ 
      message: 'Server error importing questions: ' + err.message
    });
  }
};

// @desc    Clear all questions or questions of a specific category (Admin-only)
// @route   DELETE api/questions
// @access  Private/Admin
exports.clearQuestions = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) {
      query.category = { $regex: new RegExp('^' + category.trim() + '$', 'i') };
    }

    const result = await Question.deleteMany(query);
    res.json({
      message: `Successfully deleted ${result.deletedCount} questions.`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('clearQuestions Controller Error:', err.message);
    res.status(500).json({ message: 'Server error clearing questions: ' + err.message });
  }
};
