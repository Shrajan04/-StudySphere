import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import AssignmentItem from '../components/AssignmentItem';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [statsRes, gpaRes, notifRes] = await Promise.all([
        axiosInstance.get('/assignments/stats'),
        axiosInstance.get('/grades/gpa'),
        axiosInstance.get('/notifications'),
      ]);
      setStats(statsRes.data.stats);
      setUpcoming(statsRes.data.upcomingAssignments);
      setGpa(gpaRes.data.gpa);
      setRecentNotifs(notifRes.data.notifications.slice(0, 4));
    } catch {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleToggle = async (assignment) => {
    try {
      const newStatus = assignment.status === 'completed' ? 'pending' : 'completed';
      await axiosInstance.put(`/assignments/${assignment._id}`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchAll();
    } catch {
      toast.error('Failed to update assignment');
    }
  };

  const getGradeStanding = (g) => {
    if (!g || g.count === 0) return { label: 'No grades yet', color: 'var(--text-muted)' };
    if (g.gpa >= 3.7) return { label: "Dean's List ??", color: '#22c55e' };
    if (g.gpa >= 3.0) return { label: 'Good Standing ?', color: '#38bdf8' };
    if (g.gpa >= 2.0) return { label: 'Satisfactory ??', color: '#facc15' };
    return { label: 'At Risk ??', color: '#fb7185' };
  };

  const standing = getGradeStanding(gpa);

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;

  return (
    <div className="dashboard-page">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome back, <span className="hero-name">{user?.name?.split(' ')[0]}</span>! ??
            </h1>
            <p className="hero-subtitle">Your academic journey continues here</p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-number">{stats?.totalCourses ?? 0}</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">{stats?.completionRate ?? 0}%</div>
              <div className="stat-label">Complete</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">{gpa?.gpa?.toFixed(1) ?? '0.0'}</div>
              <div className="stat-label">GPA</div>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/courses" className="action-card">
          <div className="action-icon">??</div>
          <div className="action-text">
            <h3>Add Course</h3>
            <p>Start a new academic journey</p>
          </div>
        </Link>
        <Link to="/assignments" className="action-card">
          <div className="action-icon">??</div>
          <div className="action-text">
            <h3>New Assignment</h3>
            <p>Track your upcoming tasks</p>
          </div>
        </Link>
        <Link to="/grades" className="action-card">
          <div className="action-icon">??</div>
          <div className="action-text">
            <h3>Record Grade</h3>
            <p>Update your academic progress</p>
          </div>
        </Link>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-main">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Progress Overview */}
          <div className="dashboard-card progress-card">
            <div className="card-header">
              <h2 className="card-title">Academic Progress</h2>
              <div className="progress-ring">
                <svg width="80" height="80">
                  <circle
                    cx="40" cy="40" r="35"
                    stroke="var(--border)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40" cy="40" r="35"
                    stroke="url(#progressGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - (stats?.completionRate ?? 0) / 100)}`}
                    transform="rotate(-90 40 40)"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="progress-text">
                  <div className="progress-percent">{stats?.completionRate ?? 0}%</div>
                  <div className="progress-label">Complete</div>
                </div>
              </div>
            </div>

            <div className="progress-stats">
              <div className="progress-stat">
                <span className="stat-value">{stats?.completedAssignments ?? 0}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="progress-stat">
                <span className="stat-value">{stats?.pendingAssignments ?? 0}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="progress-stat">
                <span className="stat-value">{stats?.totalAssignments ?? 0}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
          </div>

          {/* GPA Card */}
          <div className="dashboard-card gpa-card">
            <div className="card-header">
              <h2 className="card-title">GPA Overview</h2>
              <div className="gpa-badge" style={{ background: standing.color }}>
                {standing.label}
              </div>
            </div>

            {gpa && gpa.count > 0 ? (
              <div className="gpa-content">
                <div className="gpa-main">
                  <div className="gpa-score">{gpa.gpa.toFixed(2)}</div>
                  <div className="gpa-scale">/ 4.00</div>
                </div>
                <div className="gpa-details">
                  <div className="gpa-detail">
                    <span className="detail-value">{gpa.count}</span>
                    <span className="detail-label">Courses</span>
                  </div>
                  <div className="gpa-detail">
                    <span className="detail-value">{gpa.totalCredits}</span>
                    <span className="detail-label">Credits</span>
                  </div>
                </div>
                <div className="gpa-bar">
                  <div
                    className="gpa-fill"
                    style={{ width: `${(gpa.gpa / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="empty-gpa">
                <div className="empty-icon">??</div>
                <p>No grades recorded yet</p>
                <Link to="/grades" className="empty-link">Add your first grade ?</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Upcoming Assignments */}
          <div className="dashboard-card assignments-card">
            <div className="card-header">
              <h2 className="card-title">Upcoming Deadlines</h2>
              <Link to="/assignments" className="card-link">View all ?</Link>
            </div>

            {upcoming.length > 0 ? (
              <div className="assignments-list">
                {upcoming.slice(0, 3).map((assignment) => (
                  <div key={assignment._id} className="assignment-preview">
                    <div className="assignment-icon">
                      {assignment.priority === 'high' ? '??' :
                       assignment.priority === 'medium' ? '??' : '??'}
                    </div>
                    <div className="assignment-info">
                      <h4 className="assignment-title">{assignment.title}</h4>
                      <p className="assignment-course">{assignment.course?.courseName}</p>
                      <p className="assignment-due">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className={`assignment-toggle ${assignment.status}`}
                      onClick={() => handleToggle(assignment)}
                    >
                      {assignment.status === 'completed' ? '✓' : '○'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-assignments">
                <div className="empty-icon">??</div>
                <p>No upcoming deadlines!</p>
                <Link to="/assignments" className="empty-link">Add an assignment ?</Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
              <Link to="/notifications" className="card-link">View all ?</Link>
            </div>

            {recentNotifs.length > 0 ? (
              <div className="activity-list">
                {recentNotifs.map((notification) => (
                  <div key={notification._id} className="activity-item">
                    <div className="activity-dot" style={{
                      background: notification.type === 'deadline' ? '#fb7185' :
                                 notification.type === 'grade' ? '#22c55e' :
                                 notification.type === 'reminder' ? '#facc15' : '#38bdf8'
                    }}></div>
                    <div className="activity-content">
                      <p className="activity-message">{notification.message}</p>
                      <span className="activity-time">{timeAgo(notification.createdAt)}</span>
                    </div>
                    {!notification.isRead && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-activity">
                <div className="empty-icon">??</div>
                <p>All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
};

export default Dashboard;
