const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Group = require('../models/Group');

// Add expense to group
router.post('/', auth, async (req, res) => {
  try {
    const { description, amount, paidBy, group, splits, category, notes } = req.body;

    // Verify user is member of group
    const groupData = await Group.findById(group);
    if (!groupData) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    const isMember = groupData.members.some(m => m.user.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const expense = new Expense({
      description,
      amount,
      paidBy,
      group,
      splits,
      category,
      notes
    });

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get expenses for a group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all expenses for user (for dashboard)
router.get('/user', auth, async (req, res) => {
  try {
    const groups = await Group.find({ 'members.user': req.user.id });
    const groupIds = groups.map(g => g._id);

    const expenses = await Expense.find({ group: { $in: groupIds } })
      .populate('paidBy', 'name email avatar')
      .populate('group', 'name')
      .populate('splits.user', 'name email avatar');

    // Calculate balances
    let balances = {
      owedToMe: 0,
      iOwe: 0,
      totalBalance: 0
    };

    expenses.forEach(expense => {
      expense.splits.forEach(split => {
        if (split.user && split.user._id.toString() === req.user.id && expense.paidBy._id.toString() !== req.user.id) {
          balances.iOwe += split.amount;
        } else if (expense.paidBy._id.toString() === req.user.id && split.user && split.user._id.toString() !== req.user.id) {
          balances.owedToMe += split.amount;
        }
      });
    });

    balances.totalBalance = balances.owedToMe - balances.iOwe;

    res.json(balances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Settle up
router.post('/:expenseId/settle', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    const splitIndex = expense.splits.findIndex(
      s => s.user && s.user.toString() === userId
    );

    if (splitIndex === -1) {
      return res.status(404).json({ msg: 'Split not found' });
    }

    expense.splits[splitIndex].settled = true;
    await expense.save();

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;