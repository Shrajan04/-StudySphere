const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

/**
 * @desc    Get all assignments for the logged-in user
 * @route   GET /api/assignments
 * @access  Private
 */
const getAssignments = asyncHandler(async (req, res) => {
  const { status, courseId, sortBy } = req.query;

  const query = { user: req.user._id };

  if (status && ['pending', 'completed'].includes(status)) {
    query.status = status;
  }
  if (courseId) {
    query.course = courseId;
  }

  const sortOption = sortBy === 'dueDate' ? { dueDate: 1 } : { createdAt: -1 };

  const assignments = await Assignment.find(query)
    .populate('course', 'courseName courseCode')
    .sort(sortOption);

  res.json({ success: true, count: assignments.length, assignments });
});

/**
 * @desc    Get assignments for a specific course
 * @route   GET /api/assignments/course/:courseId
 * @access  Private
 */
const getAssignmentsByCourse = asyncHandler(async (req, res) => {
  // Verify the course belongs to this user
  const course = await Course.findById(req.params.courseId);
  if (!course || course.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view these assignments');
  }

  const assignments = await Assignment.find({
    course: req.params.courseId,
    user: req.user._id,
  }).sort({ dueDate: 1 });

  res.json({ success: true, count: assignments.length, assignments });
});

/**
 * @desc    Create an assignment
 * @route   POST /api/assignments
 * @access  Private
 */
const createAssignment = asyncHandler(async (req, res) => {
  const { courseId, title, description, dueDate, status, priority } = req.body;

  if (!courseId || !title || !dueDate) {
    res.status(400);
    throw new Error('Please provide courseId, title, and dueDate');
  }

  // Verify the course belongs to this user
  const course = await Course.findById(courseId);
  if (!course || course.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to add assignment to this course');
  }

  const assignment = await Assignment.create({
    course: courseId,
    user: req.user._id,
    title,
    description,
    dueDate,
    status: status || 'pending',
    priority: priority || 'medium',
  });

  const populated = await assignment.populate('course', 'courseName courseCode');
  res.status(201).json({ success: true, assignment: populated });
});

/**
 * @desc    Update an assignment (including marking complete)
 * @route   PUT /api/assignments/:id
 * @access  Private
 */
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  if (assignment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this assignment');
  }

  const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('course', 'courseName courseCode');

  res.json({ success: true, assignment: updated });
});

/**
 * @desc    Delete an assignment
 * @route   DELETE /api/assignments/:id
 * @access  Private
 */
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  if (assignment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this assignment');
  }

  await assignment.deleteOne();
  res.json({ success: true, message: 'Assignment deleted' });
});

/**
 * @desc    Get dashboard stats
 * @route   GET /api/assignments/stats
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalCourses, totalAssignments, completedAssignments, upcomingAssignments] =
    await Promise.all([
      Course.countDocuments({ user: userId }),
      Assignment.countDocuments({ user: userId }),
      Assignment.countDocuments({ user: userId, status: 'completed' }),
      Assignment.find({
        user: userId,
        status: 'pending',
        dueDate: { $gte: new Date() },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate('course', 'courseName courseCode'),
    ]);

  const pendingAssignments = totalAssignments - completedAssignments;
  const completionRate =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

  res.json({
    success: true,
    stats: {
      totalCourses,
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      completionRate,
    },
    upcomingAssignments,
  });
});

module.exports = {
  getAssignments,
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getDashboardStats,
};
