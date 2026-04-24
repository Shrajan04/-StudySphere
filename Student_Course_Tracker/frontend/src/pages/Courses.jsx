import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import CourseCard from '../components/CourseCard';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  courseName: '', courseCode: '', instructor: '', semester: '', description: '', credits: 3,
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/courses${q ? `?search=${q}` : ''}`);
      setCourses(data.courses);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchCourses(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setForm({
      courseName: course.courseName,
      courseCode: course.courseCode,
      instructor: course.instructor,
      semester: course.semester,
      description: course.description || '',
      credits: course.credits || 3,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCourse) {
        await axiosInstance.put(`/courses/${editingCourse._id}`, form);
        toast.success('Course updated!');
      } else {
        await axiosInstance.post('/courses', form);
        toast.success('Course created!');
      }
      setShowModal(false);
      fetchCourses(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course and all its assignments?')) return;
    try {
      await axiosInstance.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses(search);
    } catch {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Courses 🎓</h1>
          <p className="page-subtitle">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>+ New Course</button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by name, code, or instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          id="course-search"
        />
        {search && (
          <button className="clear-search" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>{search ? 'No courses match your search' : 'No courses yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Add your first course to get started'}</p>
          {!search && <button className="btn-primary" onClick={openCreateModal}>+ Add Course</button>}
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
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
              <h2>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Course Name *</label>
                  <input type="text" placeholder="e.g. Data Structures" value={form.courseName}
                    onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Course Code *</label>
                  <input type="text" placeholder="e.g. CS301" value={form.courseCode}
                    onChange={(e) => setForm({ ...form, courseCode: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Instructor *</label>
                  <input type="text" placeholder="Professor name" value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Semester *</label>
                  <input type="text" placeholder="e.g. Fall 2024" value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credits</label>
                  <input type="number" min="1" max="6" value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Optional course description" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner-sm" /> : editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
