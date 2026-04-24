const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.json({ success: true, notifications, unreadCount });
});

// PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findById(req.params.id);
  if (!n || n.userId.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  n.isRead = true;
  await n.save();
  res.json({ success: true, notification: n });
});

// PUT /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

// Internal helper — used by cron job and other controllers
const createNotification = async (userId, message, type = 'system') => {
  try {
    await Notification.create({ userId, message, type });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

module.exports = { getNotifications, markRead, markAllRead, createNotification };
