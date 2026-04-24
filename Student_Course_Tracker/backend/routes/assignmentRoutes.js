const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getDashboardStats,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

// All assignment routes are protected
router.use(protect);

router.get('/stats', getDashboardStats);
router.route('/').get(getAssignments).post(createAssignment);
router.get('/course/:courseId', getAssignmentsByCourse);
router.route('/:id').put(updateAssignment).delete(deleteAssignment);

module.exports = router;
