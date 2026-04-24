const asyncHandler = require('express-async-handler');
const Reminder = require('../models/Reminder');
const Assignment = require('../models/Assignment');
const { createNotification } = require('./notificationController');

// GET /api/reminders
const getReminders = asyncHandler(async (req, res) => {
  const reminders = await Reminder.find({ userId: req.user._id })
    .populate('assignmentId', 'title dueDate course')
    .sort({ remindAt: 1 });
  res.json({ success: true, reminders });
});

// POST /api/reminders
const createReminder = asyncHandler(async (req, res) => {
  const { assignmentId, remindAt } = req.body;
  if (!assignmentId || !remindAt) {
    res.status(400); throw new Error('assignmentId and remindAt are required');
  }
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment || assignment.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  const reminder = await Reminder.create({ userId: req.user._id, assignmentId, remindAt });
  res.status(201).json({ success: true, reminder });
});

// DELETE /api/reminders/:id
const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) { res.status(404); throw new Error('Reminder not found'); }
  if (reminder.userId.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  await reminder.deleteOne();
  res.json({ success: true, message: 'Reminder deleted' });
});

// Called by cron job every minute — fires notifications for due reminders
const checkReminders = async () => {
  const now = new Date();
  const due = await Reminder.find({ isNotified: false, remindAt: { $lte: now } })
    .populate('assignmentId', 'title');
  for (const reminder of due) {
    const title = reminder.assignmentId?.title || 'Assignment';
    await createNotification(reminder.userId, `⏰ Reminder: "${title}" is due soon!`, 'reminder');
    reminder.isNotified = true;
    await reminder.save();
  }
  if (due.length > 0) console.log(`✅ Processed ${due.length} reminder(s)`);
};

module.exports = { getReminders, createReminder, deleteReminder, checkReminders };
