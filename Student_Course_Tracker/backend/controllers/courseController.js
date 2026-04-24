const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

/**
 * @desc    Get all courses for the logged-in user
 * @route   GET /api/courses
 * @access  Private
 */
const getCourses = asyncHandler(async (req, res) => {
  const { search } = req.query;

  // Build query — filter by user
  const query = { user: req.user._id };

  // Search by courseName or courseCode
  if (search) {
    query.$or = [
      { courseName: { $regex: search, $options: 'i' } },
      { courseCode: { $regex: search, $options: 'i' } },
      { instructor: { $regex: search, $options: 'i' } },
    ];
  }

  const courses = await Course.find(query).sort({ createdAt: -1 });

  // Attach progress to each course
  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      const total = await Assignment.countDocuments({ course: course._id });
      const completed = await Assignment.countDocuments({
        course: course._id,
        status: 'completed',
      });
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { ...course.toObject(), progress, totalAssignments: total, completedAssignments: completed };
    })
  );

  res.json({ success: true, count: courses.length, courses: coursesWithProgress });
});

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private
 */
const createCourse = asyncHandler(async (req, res) => {
  const { courseName, courseCode, instructor, semester, description, credits } = req.body;

  if (!courseName || !courseCode || !instructor || !semester) {
    res.status(400);
    throw new Error('Please provide courseName, courseCode, instructor, and semester');
  }

  const course = await Course.create({
    user: req.user._id,
    courseName,
    courseCode,
    instructor,
    semester,
    description,
    credits,
  });

  res.status(201).json({ success: true, course });
});

/**
 * @desc    Get a single course by ID (with assignments)
 * @route   GET /api/courses/:id
 * @access  Private
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Ownership check
  if (course.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this course');
  }

  const assignments = await Assignment.find({ course: course._id }).sort({ dueDate: 1 });
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  res.json({
    success: true,
    course: { ...course.toObject(), progress, totalAssignments: total, completedAssignments: completed },
    assignments,
  });
});

/**
 * @desc    Update a course
 * @route   PUT /api/courses/:id
 * @access  Private
 */
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this course');
  }

  const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, course: updated });
});

/**
 * @desc    Delete a course (and its assignments)
 * @route   DELETE /api/courses/:id
 * @access  Private
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }

  // Cascade delete assignments belonging to this course
  await Assignment.deleteMany({ course: course._id });
  await course.deleteOne();

  res.json({ success: true, message: 'Course and its assignments deleted' });
});

module.exports = { getCourses, createCourse, getCourseById, updateCourse, deleteCourse };
