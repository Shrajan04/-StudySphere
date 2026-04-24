import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY_FORM = { courseId: '', score: '', notes: '' };

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [gpa, setGpa] = useState({ gpa: 0, totalCredits: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [gRes, gpaRes, cRes] = await Promise.all([
        axiosInstance.get('/grades'),
        axiosInstance.get('/grades/gpa'),
        axiosInstance.get('/courses'),
      ]);
      setGrades(gRes.data.grades);
      setGpa(gpaRes.data.gpa);
      setCourses(cRes.data.courses);
    } catch {
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openModal = (grade = null) => {
    if (grade) {
      setEditingId(grade._id);
      setForm({ courseId: grade.courseId?._id || '', score: grade.score, notes: grade.notes || '' });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post('/grades', form);
      toast.success('Grade saved!');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save grade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grade?')) return;
    try {
      await axiosInstance.delete(`/grades/${id}`);
      toast.success('Grade removed');
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const gpaPct = Math.round((gpa.gpa / 4.0) * 100);

  const gradeColor = (g) => {
    const map = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' };
    return map[g] || '#6366f1';
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Grades 🏆</h1>
          <p className="page-subtitle">{grades.length} course{grades.length !== 1 ? 's' : ''} graded</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>+ Add Grade</button>
      </div>

      {/* GPA Hero */}
      <div className="gpa-hero">
        <div className="gpa-ring" style={{ '--pct': `${gpaPct}%` }}>
          <span className="gpa-number">{gpa.gpa.toFixed(2)}</span>
        </div>
        <div className="gpa-meta">
          <h2>Cumulative GPA</h2>
          <p>{gpa.count} courses · {gpa.totalCredits} total credits</p>
          <p style={{ marginTop: 8 }}>
            {gpa.gpa >= 3.7 ? '🌟 Dean\'s List'
              : gpa.gpa >= 3.0 ? '✅ Good Standing'
              : gpa.gpa >= 2.0 ? '📘 Satisfactory'
              : '⚠️ At Risk'}
          </p>
        </div>
      </div>

      {/* Grades Table */}
      {grades.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No grades recorded yet</h3>
          <p>Add your first grade to start tracking GPA</p>
          <button className="btn-primary" onClick={() => openModal()}>+ Add Grade</button>
        </div>
      ) : (
        <div className="grades-table-wrapper">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Progress</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g._id}>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{g.courseId?.courseName || '—'}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: 'var(--accent)' }}>{g.courseId?.courseCode}</span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{g.score}%</td>
                  <td>
                    <span
                      className={`grade-letter grade-${g.grade}`}
                      style={{ background: gradeColor(g.grade) }}
                    >
                      {g.grade}
                    </span>
                  </td>
                  <td>
                    <div className="score-bar-bg">
                      <div className="score-bar-fill" style={{ width: `${g.score}%` }} />
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: 180 }}>{g.notes || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => openModal(g)} title="Edit">✏️</button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(g._id)} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Grade' : 'Add Grade'}</h2>
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
                <label>Score (0–100) *</label>
                <input
                  type="number" min="0" max="100"
                  placeholder="e.g. 87"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner-sm" /> : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;
