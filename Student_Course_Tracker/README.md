# 🎓 Student Course Tracker

A full-stack MERN-style app for students to manage courses, assignments, grades, reminders, notifications, and discussion posts.

---

## 🧱 Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs
- HTTP: Axios
- Charts: Recharts
- Styling: Vanilla CSS

---

## 📁 Project Structure

```
Student_Course_Tracker/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── assignmentController.js
│   │   ├── gradeController.js
│   │   ├── notificationController.js
│   │   ├── postController.js
│   │   └── reminderController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Assignment.js
│   │   ├── Comment.js
│   │   ├── Course.js
│   │   ├── Grade.js
│   │   ├── Notification.js
│   │   ├── Post.js
│   │   ├── Reminder.js
│   │   └── User.js
│   ├── routes/
│   │   ├── assignmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── gradeRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── postRoutes.js
│   │   └── reminderRoutes.js
│   ├── server.js
│   └── .env
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/axios.js
    │   ├── assets/
    │   ├── components/
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## 🔧 Prerequisites

- Node.js v18 or later
- MongoDB running locally, or a MongoDB Atlas connection

---

## 🚀 Run Locally

### 1. Configure Backend

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_course_tracker
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

Backend API: `http://localhost:5000`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend UI: `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint                | Access  | Description            |
|--------|-------------------------|---------|------------------------|
| POST   | `/api/auth/register`    | Public  | Register a new user    |
| POST   | `/api/auth/login`       | Public  | Log in a user          |
| GET    | `/api/auth/me`          | Private | Get authenticated user |

### Courses

| Method | Endpoint              | Access  | Description                    |
|--------|-----------------------|---------|--------------------------------|
| GET    | `/api/courses`        | Private | List courses                   |
| POST   | `/api/courses`        | Private | Create a course                |
| GET    | `/api/courses/:id`    | Private | Get course details             |
| PUT    | `/api/courses/:id`    | Private | Update a course                |
| DELETE | `/api/courses/:id`    | Private | Delete a course                |

### Assignments

| Method | Endpoint                                | Access  | Description                      |
|--------|-----------------------------------------|---------|----------------------------------|
| GET    | `/api/assignments`                      | Private | List assignments                 |
| GET    | `/api/assignments/stats`                | Private | Dashboard statistics             |
| GET    | `/api/assignments/course/:courseId`     | Private | Assignments for a course         |
| POST   | `/api/assignments`                      | Private | Create assignment                |
| PUT    | `/api/assignments/:id`                  | Private | Update or toggle assignment      |
| DELETE | `/api/assignments/:id`                  | Private | Delete assignment                |

### Grades

| Method | Endpoint             | Access  | Description                   |
|--------|----------------------|---------|-------------------------------|
| GET    | `/api/grades`        | Private | Get grade records             |
| POST   | `/api/grades`        | Private | Create / update grades        |
| GET    | `/api/grades/gpa`    | Private | Get GPA summary               |
| DELETE | `/api/grades/:id`    | Private | Delete a grade record         |

### Notifications

| Method | Endpoint                          | Access  | Description                    |
|--------|-----------------------------------|---------|--------------------------------|
| GET    | `/api/notifications`              | Private | Get notifications              |
| PUT    | `/api/notifications/:id/read`     | Private | Mark notification as read      |
| PUT    | `/api/notifications/read-all`     | Private | Mark all notifications read    |

### Reminders

| Method | Endpoint             | Access  | Description               |
|--------|----------------------|---------|---------------------------|
| GET    | `/api/reminders`     | Private | List reminders            |
| POST   | `/api/reminders`     | Private | Create a reminder         |
| DELETE | `/api/reminders/:id` | Private | Delete a reminder         |

### Posts & Comments

| Method | Endpoint                                         | Access  | Description                        |
|--------|--------------------------------------------------|---------|------------------------------------|
| GET    | `/api/posts`                                     | Private | List posts                         |
| POST   | `/api/posts`                                     | Private | Create a post                      |
| DELETE | `/api/posts/:id`                                 | Private | Delete a post                      |
| GET    | `/api/posts/:postId/comments`                    | Private | Get comments for a post            |
| POST   | `/api/posts/:postId/comments`                    | Private | Add a comment                      |
| DELETE | `/api/posts/:postId/comments/:commentId`         | Private | Delete a comment                   |

---

## ✨ Features

- JWT authentication with bcrypt hashing
- Course management and progress tracking
- Assignment tracking with due dates and completion toggles
- Grade tracking with GPA summary
- Reminder creation and automated reminder checks
- Notification read status and bulk marking
- Discussion posts with comments support
- Responsive React UI built with Vite
- Backend API separated from frontend client

---

## Notes

- Keep secrets and credentials out of source control using `.env` files.
- Ensure `CLIENT_URL` matches the frontend development URL.
- The backend includes a cron job that checks reminders every minute.
