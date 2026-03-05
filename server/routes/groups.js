const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const Expense = require('../models/Expense');

// Create a group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, members, guests } = req.body;

    const group = new Group({
      name,
      description,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }, ...(members || []).map(m => ({ user: m }))],
      guests: guests || []
    });

    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all groups for user
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user.id
    }).populate('members.user', 'name email avatar');
    
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get group by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add member to group
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = group.members.find(
      m => m.user.toString() === req.user.id && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ msg: 'Only admins can add members' });
    }

    // Check if user already in group
    const existingMember = group.members.find(
      m => m.user.toString() === userId
    );

    if (existingMember) {
      return res.status(400).json({ msg: 'User already in group' });
    }

    group.members.push({ user: userId });
    await group.save();

    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add guest to group
router.post('/:id/guests', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    group.guests.push({ name, email, addedBy: req.user.id });
    await group.save();

    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;