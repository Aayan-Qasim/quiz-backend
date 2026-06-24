const Question = require('../models/Question');

// @desc    Get all distinct category names
// @route   GET api/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = await Question.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error('getCategories Controller Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving category names.' });
  }
};

// @desc    Perform category operations: rename, duplicate, delete (Admin-only)
// @route   POST api/categories/operation
// @access  Private/Admin
exports.performCategoryOperation = async (req, res) => {
  try {
    const { oldName, newName, mode } = req.body;

    if (!oldName || !mode) {
      return res.status(400).json({ message: 'Please provide both oldName and mode parameters.' });
    }

    const targetOld = oldName.trim();
    const targetNew = newName ? newName.trim() : '';

    if (mode === 'delete') {
      const result = await Question.deleteMany({
        category: { $regex: new RegExp('^' + targetOld + '$', 'i') }
      });
      return res.json({
        message: `Successfully deleted category "${targetOld}" and its ${result.deletedCount} questions.`,
        deletedCount: result.deletedCount
      });
    }

    if (mode === 'rename') {
      if (!targetNew) {
        return res.status(400).json({ message: 'A new name is required for renaming operations.' });
      }

      const result = await Question.updateMany(
        { category: { $regex: new RegExp('^' + targetOld + '$', 'i') } },
        { category: targetNew }
      );

      return res.json({
        message: `Successfully renamed category "${targetOld}" to "${targetNew}". Affected ${result.modifiedCount} questions.`,
        modifiedCount: result.modifiedCount
      });
    }

    if (mode === 'duplicate') {
      if (!targetNew) {
        return res.status(400).json({ message: 'A target category name is required for duplication operations.' });
      }

      const questionsToDuplicate = await Question.find({
        category: { $regex: new RegExp('^' + targetOld + '$', 'i') }
      });

      if (questionsToDuplicate.length === 0) {
        return res.status(404).json({ message: `No questions found under category "${targetOld}" to duplicate.` });
      }

      const newQuestions = questionsToDuplicate.map(q => {
        const obj = q.toObject();
        delete obj._id;
        delete obj.id;
        return {
          ...obj,
          category: targetNew,
          isCustom: true
        };
      });

      const result = await Question.insertMany(newQuestions);
      return res.json({
        message: `Successfully duplicated category "${targetOld}" to "${targetNew}". Created ${result.length} new questions.`,
        insertedCount: result.length
      });
    }

    res.status(400).json({ message: `Operation mode "${mode}" is invalid. Use rename, duplicate, or delete.` });
  } catch (err) {
    console.error('performCategoryOperation Controller Error:', err.message);
    res.status(500).json({ message: 'Server error performing category operation.' });
  }
};
