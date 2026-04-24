import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import AssignmentItem from '../components/AssignmentItem';
import toast from 'react-hot-toast';

const EMPTY_FORM = { title: '', description: '', dueDate: '', status: 'pending', priority: 'medium' };

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await axiosInstance.get(`/courses/${id}`);
      setCourse(data.course);
      setAssignments(data.assignments);
    } catch {
      toast.error('Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreateModal = () => {
    setEditingAssignment(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (a) => {
    setEditingAssignment(a);
    setForm({
      title: a.title,
      description: a.description || '',
      dueDate: a.dueDate.split('T')[0],
      status: a.status,
      priority: a.priority,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAssignment) {
        await axiosInstance.put(`/assignments/${editingAssignment._id}`, form);
        toast.success('Assignment updated!');
      } else {
        await axiosInstance.post('/assignments', { ...form, courseId: id });
        toast.success('Assignment added!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (a) => {
    const newStatus = a.status === 'completed' ? 'pending' : 'completed';
    try {
      await axiosInstance.put(`/assignments/${a._id}`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (aId) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await axiosInstance.delete(`/assignments/${aId}`);
      toast.success('Assignment deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const progressColor = course.progress >= 75 ? '#10b981' : course.progress >= 40 ? '#f59e0b' : '#6366f1';

  return (
    <div className="page">
      {/* Back */}
      <Link to="/courses" className="back-link">← Back to Courses</Link>

      {/* Header */}
      <div className="course-detail-header">
        <div>
          <div className="course-code-badge">{course.courseCode}</div>
          <h1 className="page-title">{course.courseName}</h1>
          <p className="course-meta-info">
            👤 {course.instructor} &nbsp;·&nbsp; 📅 {course.semester} &nbsp;·&nbsp; 📚 {course.credits} credits
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>+ Add Assignment</button>
      </div>

      {/* Progress */}
      <div className="card progress-card">
        <div className="progress-header">
          <span>Course Progress</span>
          <strong style={{ color: progressColor }}>{course.progress}%</strong>
        </div>
        <div className="progress-bar-bg lg">
          <div className="progress-bar-fill" style={{ width: `${course.progress}%`, background: progressColor }} />
        </div>
        <div className="progress-stats">
          <span>✅ {course.completedAssignments} completed</span>
          <span>⏳ {course.totalAssignments - course.completedAssignments} pending</span>
        </div>
      </div>

      {/* Assignments */}
      <div className="section-header">
        <h2>Assignments ({assignments.length})</h2>
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No assignments yet</h3>
          <p>Add your first assignment for this course</p>
          <button className="btn-primary" onClick={openCreateModal}>+ Add Assignment</button>
        </div>
      ) : (
        <div className="assignment-list">
          {assignments.map((a) => (
            <AssignmentItem
              key={a._id}
              assignment={a}
              onToggle={handleToggle}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAssignment ? 'Edit Assignment' : 'Add Assignment'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" placeholder="Assignment title" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Optional details" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date *</label>
                  <input type="date" value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner-sm" /> : editingAssignment ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
