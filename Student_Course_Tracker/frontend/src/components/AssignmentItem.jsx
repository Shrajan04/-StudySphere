const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

const AssignmentItem = ({ assignment, onToggle, onEdit, onDelete }) => {
  const isOverdue =
    assignment.status === 'pending' && new Date(assignment.dueDate) < new Date();

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className={`assignment-item ${assignment.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      {/* Toggle Checkbox */}
      <button
        className={`toggle-btn ${assignment.status === 'completed' ? 'toggled' : ''}`}
        onClick={() => onToggle(assignment)}
        title={assignment.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
      >
        {assignment.status === 'completed' ? '✓' : ''}
      </button>

      <div className="assignment-content">
        <div className="assignment-header-row">
          <h4 className="assignment-title">{assignment.title}</h4>
          <span
            className="priority-badge"
            style={{ background: PRIORITY_COLORS[assignment.priority] + '22', color: PRIORITY_COLORS[assignment.priority] }}
          >
            {assignment.priority}
          </span>
        </div>

        {assignment.description && (
          <p className="assignment-desc">{assignment.description}</p>
        )}

        <div className="assignment-meta">
          {assignment.course && (
            <span className="meta-tag course-tag">
              🎓 {assignment.course.courseCode}
            </span>
          )}
          <span className={`meta-tag due-tag ${isOverdue ? 'overdue-tag' : ''}`}>
            📅 {formatDate(assignment.dueDate)} {isOverdue && '⚠️ Overdue'}
          </span>
          <span className={`status-badge ${assignment.status}`}>
            {assignment.status}
          </span>
        </div>
      </div>

      <div className="assignment-actions">
        <button className="btn-icon" onClick={() => onEdit(assignment)} title="Edit">✏️</button>
        <button className="btn-icon btn-danger" onClick={() => onDelete(assignment._id)} title="Delete">🗑️</button>
      </div>
    </div>
  );
};

export default AssignmentItem;
