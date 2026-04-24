require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const postRoutes = require('./routes/postRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/posts', postRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Student Course Tracker API is running 🚀' });
});

// ── Error Handling ──────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // ── Cron: check reminders every minute ─────────────────────────────────────
  const { checkReminders } = require('./controllers/reminderController');
  cron.schedule('* * * * *', () => {
    checkReminders().catch((err) => console.error('Cron error:', err.message));
  });
  console.log('⏰ Reminder cron job started');
});
