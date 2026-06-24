const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

// Helper to calculate user's level based on points
function calculateLevel(p) {
  if (p >= 500) return 5;
  if (p >= 300) return 4;
  if (p >= 150) return 3;
  if (p >= 50) return 2;
  return 1;
}

// @desc    Get all quiz results with populated user info (Admin-only)
// @route   GET api/results
// @access  Private/Admin
exports.getAllResults = async (req, res) => {
  try {
    const results = await QuizResult.find()
      .populate('userId', 'name email')
      .sort({ quizDate: -1 });

    const formattedResults = results.map(r => {
      const obj = r.toJSON();
      if (r.userId) {
        obj.userName = r.userId.name;
        obj.userId = r.userId._id.toString();
      }
      return obj;
    });

    res.json(formattedResults);
  } catch (err) {
    console.error('getAllResults Controller Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving quiz history.' });
  }
};

// @desc    Get quiz results for a specific user
// @route   GET api/results/user/:userId
// @access  Private
exports.getUserResults = async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. You can only view your own quiz history.' });
    }

    const results = await QuizResult.find({ userId: req.params.userId })
      .sort({ quizDate: -1 });

    res.json(results);
  } catch (err) {
    console.error('getUserResults Controller Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving user quiz history.' });
  }
};

// @desc    Submit a new quiz result and update user stats
// @route   POST api/results
// @access  Private
exports.submitQuizResult = async (req, res) => {
  try {
    const { userId, category, score, totalQuestions, note, questionIds } = req.body;

    if (!userId || !category || score === undefined || !totalQuestions) {
      return res.status(400).json({ message: 'Please provide all required quiz result fields.' });
    }

    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. You cannot submit quiz results on behalf of another user.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile associated with result not found.' });
    }

    const newResult = new QuizResult({
      userId,
      category,
      score,
      totalQuestions,
      note: (note || '').trim(),
      questionIds: questionIds || []
    });

    const savedResult = await newResult.save();

    if (questionIds && Array.isArray(questionIds)) {
      if (!user.answeredQuestions) {
        user.answeredQuestions = [];
      }
      user.answeredQuestions.addToSet(...questionIds);
    }

    const pointsEarned = score * 10;
    const currentPoints = user.totalPoints || 0;
    const newPoints = currentPoints + pointsEarned;

    const now = Date.now();
    const lastQuizTime = user.lastQuizTime || 0;
    let streak = user.streak || 0;

    if (lastQuizTime > 0) {
      const diffHours = (now - lastQuizTime) / (1000 * 60 * 60);
      if (diffHours < 36) {
        streak = streak === 0 ? 1 : streak + 1;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    user.score = (user.score || 0) + score;
    user.totalPoints = newPoints;
    user.streak = streak;
    user.lastQuizTime = now;
    user.level = calculateLevel(newPoints);

    await user.save();
    res.status(201).json(savedResult);
  } catch (err) {
    console.error('submitQuizResult Controller Error:', err.message);
    res.status(500).json({ message: 'Server error processing quiz result submission.' });
  }
};
