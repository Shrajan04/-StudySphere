const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['deadline', 'course_update', 'grade', 'reminder', 'system'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
