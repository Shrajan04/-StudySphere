const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    remindAt: { type: Date, required: true },
    isNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reminderSchema.index({ userId: 1, isNotified: 1, remindAt: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
