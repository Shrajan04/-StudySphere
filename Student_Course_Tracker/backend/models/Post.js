const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

postSchema.index({ courseId: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
