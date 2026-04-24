const asyncHandler = require('express-async-handler');
const Grade = require('../models/Grade');
const Course = require('../models/Course');

// GET /api/grades — all grades for user
const getGrades = asyncHandler(async (req, res) => {
  const grades = await Grade.find({ userId: req.user._id })
    .populate('courseId', 'courseName courseCode credits')
    .sort({ createdAt: -1 });
  res.json({ success: true, grades });
});

// POST /api/grades — create or update (upsert) per course
const upsertGrade = asyncHandler(async (req, res) => {
  const { courseId, score, notes } = req.body;
  if (!courseId || score === undefined) {
    res.status(400); throw new Error('courseId and score are required');
  }
  // Ownership check
  const course = await Course.findById(courseId);
  if (!course || course.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  const grade = await Grade.findOneAndUpdate(
    { userId: req.user._id, courseId },
    { score, notes },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  // Trigger pre-save hook manually for upsert (mongoose quirk)
  grade.score = score;
  await grade.save();

  const populated = await grade.populate('courseId', 'courseName courseCode credits');
  res.status(201).json({ success: true, grade: populated });
});

// GET /api/grades/gpa — weighted GPA aggregation
const getGPA = asyncHandler(async (req, res) => {
  const result = await Grade.aggregate([
    { $match: { userId: req.user._id } },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    {
      $project: {
        score: 1,
        grade: 1,
        credits: '$course.credits',
        courseName: '$course.courseName',
        courseCode: '$course.courseCode',
        gradePoints: {
          $switch: {
            branches: [
              { case: { $gte: ['$score', 90] }, then: 4.0 },
              { case: { $gte: ['$score', 80] }, then: 3.0 },
              { case: { $gte: ['$score', 70] }, then: 2.0 },
              { case: { $gte: ['$score', 60] }, then: 1.0 },
            ],
            default: 0.0,
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalCredits: { $sum: '$credits' },
        weightedPoints: { $sum: { $multiply: ['$gradePoints', '$credits'] } },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        gpa: {
          $cond: [
            { $gt: ['$totalCredits', 0] },
            { $round: [{ $divide: ['$weightedPoints', '$totalCredits'] }, 2] },
            0,
          ],
        },
        totalCredits: 1,
        count: 1,
      },
    },
  ]);

  const gpa = result[0] || { gpa: 0, totalCredits: 0, count: 0 };
  res.json({ success: true, gpa });
});

// DELETE /api/grades/:id
const deleteGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findById(req.params.id);
  if (!grade) { res.status(404); throw new Error('Grade not found'); }
  if (grade.userId.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  await grade.deleteOne();
  res.json({ success: true, message: 'Grade deleted' });
});

module.exports = { getGrades, upsertGrade, getGPA, deleteGrade };
