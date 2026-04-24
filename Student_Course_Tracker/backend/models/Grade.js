const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String }, // auto-computed
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

gradeSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Auto-compute letter grade before save
gradeSchema.pre('save', function (next) {
  const s = this.score;
  if (s >= 90) this.grade = 'A';
  else if (s >= 80) this.grade = 'B';
  else if (s >= 70) this.grade = 'C';
  else if (s >= 60) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
