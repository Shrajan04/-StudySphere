import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import AssignmentItem from '../components/AssignmentItem';
import toast from 'react-hot-toast';

const EMPTY_FORM = { courseId: '', title: '', description: '', dueDate: '', status: 'pending', priority: 'medium' };

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [courseFilter, setCourseFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (courseFilter) params.append('courseId', courseFilter);
      if (sortBy) params.append('sortBy', sortBy);
      const { data } = await axiosInstance.get(`/assignments?${params}`);
      setAssignments(data.assignments);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await axiosInstance.get('/courses');
      setCourses(data.courses);
    } catch {}
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { fetchAssignments(); }, [statusFilter, sortBy, courseFilter]);

  const openCreateModal = () => {
    setEditingAssignment(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (a) => {
    setEditingAssignment(a);
    setForm({
      courseId: a.course?._id || '',
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
        await axiosInstance.post('/assignments', form);
        toast.success('Assignment created!');
      }
      setShowModal(false);
      fetchAssignments();
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
      fetchAssignments();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await axiosInstance.delete(`/assignments/${id}`);
      toast.success('Deleted');
      fetchAssignments();
    } catch { toast.error('Failed to delete'); }
  };

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const completedCount = assignments.filter((a) => a.status === 'completed').length;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">All Assignments 📝</h1>
          <p className="page-subtitle">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>+ New Assignment</button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="status-filter">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Course</label>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} id="course-filter">
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} id="sort-filter">
            <option value="createdAt">Newest First</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
        {(statusFilter || courseFilter) && (
          <button className="btn-secondary btn-sm" onClick={() => { setStatusFilter(''); setCourseFilter(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No assignments found</h3>
          <p>Try adjusting filters or add a new assignment</p>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Course *</label>
                <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName}</option>
                  ))}
                </select>
              </div>
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
                  {submitting ? <span className="spinner-sm" /> : editingAssignment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
