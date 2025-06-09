// server/routes/notification.js
const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get notifications for logged in user/business
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.id,
      recipientType: req.user.role
    }).sort({ date: -1 });

    res.json(notifications);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });

    if (notification.recipientId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
