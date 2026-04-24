const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReminders, createReminder, deleteReminder } = require('../controllers/reminderController');

router.use(protect);
router.route('/').get(getReminders).post(createReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
