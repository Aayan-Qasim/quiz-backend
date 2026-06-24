const User = require('../models/User');
const QuizResult = require('../models/QuizResult');

// @desc    Get weekly leaderboard (users sorted by points earned in the last 7 days)
// @route   GET api/leaderboard/weekly
// @access  Private
exports.getWeeklyLeaderboard = async (req, res) => {
  try {
    const activeUsers = await User.find({ role: { $ne: 'admin' } });
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyResults = await QuizResult.find({ quizDate: { $gte: oneWeekAgo } });

    const pointsMap = {};
    weeklyResults.forEach(r => {
      const uId = r.userId.toString();
      if (!pointsMap[uId]) {
        pointsMap[uId] = 0;
      }
      pointsMap[uId] += (r.score * 10);
    });

    const leaderboard = activeUsers.map(u => {
      const uId = u._id.toString();
      const weeklyPoints = pointsMap[uId] !== undefined ? pointsMap[uId] : Math.min(u.totalPoints, Math.floor(u.totalPoints * 0.75));
      
      return {
        id: uId,
        name: u.name,
        email: u.email,
        level: u.level,
        streak: u.streak,
        profileImageUri: u.profileImageUri,
        weeklyPoints,
        totalPoints: u.totalPoints
      };
    });

    leaderboard.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    res.json(leaderboard);
  } catch (err) {
    console.error('getWeeklyLeaderboard Controller Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving weekly leaderboard.' });
  }
};

// @desc    Get all-time leaderboard (users sorted by total points)
// @route   GET api/leaderboard/alltime
// @access  Private
exports.getAllTimeLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .sort({ totalPoints: -1 });

    const leaderboard = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      level: u.level,
      streak: u.streak,
      profileImageUri: u.profileImageUri,
      totalPoints: u.totalPoints
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error('getAllTimeLeaderboard Controller Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving all-time leaderboard.' });
  }
};
