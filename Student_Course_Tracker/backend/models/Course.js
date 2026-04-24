const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [100, 'Course name cannot exceed 100 characters'],
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true,
      maxlength: [20, 'Course code cannot exceed 20 characters'],
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
      maxlength: [100, 'Instructor name cannot exceed 100 characters'],
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    credits: {
      type: Number,
      default: 3,
      min: 1,
      max: 6,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: populate assignments for progress calculation
courseSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'course',
});

module.exports = mongoose.model('Course', courseSchema);
