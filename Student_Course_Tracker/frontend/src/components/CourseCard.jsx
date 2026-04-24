import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const progressColor =
    course.progress >= 75 ? '#10b981' : course.progress >= 40 ? '#f59e0b' : '#6366f1';

  // Get gradient based on progress
  const gradientClass =
    course.progress >= 75
      ? 'gradient-green'
      : course.progress >= 40
      ? 'gradient-yellow'
      : 'gradient-blue';

  return (
    <div className={`course-card ${gradientClass}`} onClick={() => navigate(`/courses/${course._id}`)}>
      <div className="course-card-glow"></div>
      
      <div className="course-card-header">
        <span className="course-code">{course.courseCode}</span>
        <div className="course-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-icon btn-edit"
            title="Edit"
            onClick={() => onEdit(course)}
          >
            ✏️
          </button>
          <button
            className="btn-icon btn-delete"
            title="Delete"
            onClick={() => onDelete(course._id)}
          >
            🗑️
          </button>
        </div>
      </div>

      <h3 className="course-name">{course.courseName}</h3>
      
      <div className="course-meta">
        <p className="course-instructor">👤 {course.instructor}</p>
        <p className="course-semester">📅 {course.semester}</p>
      </div>

      <div className="course-divider"></div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span>Progress</span>
          <span style={{ color: progressColor, fontWeight: 700 }}>{course.progress}%</span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${course.progress}%`, background: progressColor }}
          />
        </div>
        <p className="progress-label">
          {course.completedAssignments}/{course.totalAssignments} assignments
        </p>
      </div>

      {/* Credits Badge */}
      <div className="course-footer">
        <span className="credits-badge">⭐ {course.credits} credits</span>
      </div>
    </div>
  );
};

export default CourseCard;
