const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  optionA: {
    type: String,
    required: true,
    trim: true
  },
  optionB: {
    type: String,
    required: true,
    trim: true
  },
  optionC: {
    type: String,
    required: true,
    trim: true
  },
  optionD: {
    type: String,
    required: true,
    trim: true
  },
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  explanation: {
    type: String,
    default: '',
    trim: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isCustom: {
    type: Boolean,
    default: true
  }
});

// Transform _id to id when converting to JSON
questionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Question', questionSchema);
