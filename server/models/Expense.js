const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  splits: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    guestName: String,
    amount: Number,
    percentage: Number,
    settled: {
      type: Boolean,
      default: false
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'entertainment', 'utilities', 'other'],
    default: 'other'
  },
  receipt: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);