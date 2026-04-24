const express = require('express');
const router = express.Router();
const {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// All course routes are protected
router.use(protect);

router.route('/').get(getCourses).post(createCourse);
router.route('/:id').get(getCourseById).put(updateCourse).delete(deleteCourse);

module.exports = router;
