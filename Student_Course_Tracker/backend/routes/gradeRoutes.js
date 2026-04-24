const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getGrades, upsertGrade, getGPA, deleteGrade } = require('../controllers/gradeController');

router.use(protect);
router.get('/gpa', getGPA);
router.route('/').get(getGrades).post(upsertGrade);
router.delete('/:id', deleteGrade);

module.exports = router;
