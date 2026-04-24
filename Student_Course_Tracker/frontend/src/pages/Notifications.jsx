import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/notifications');
      setNotifications(data.notifications);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    await axiosInstance.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await axiosInstance.put('/notifications/read-all');
    toast.success('All marked as read');
    fetchNotifications();
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const typeIcon = (type) => {
    const map = { deadline: '⏰', grade: '🏆', reminder: '🔔', course_update: '📚', system: '💡' };
    return map[type] || '💡';
  };
  const typeColor = (type) => {
    const map = { deadline: '#ef4444', grade: '#10b981', reminder: '#f59e0b', course_update: '#6366f1', system: '#3b82f6' };
    return map[type] || '#6366f1';
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications 🔔</h1>
          <p className="page-subtitle">{unread} unread · {notifications.length} total</p>
        </div>
        {unread > 0 && (
          <button className="btn-secondary" onClick={markAllRead}>✓ Mark All Read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>No notifications yet</h3>
          <p>Notifications about deadlines and updates will appear here</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.map((n, i) => (
            <div
              key={n._id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '16px 20px',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                background: !n.isRead ? 'rgba(99,102,241,0.04)' : 'transparent',
                cursor: !n.isRead ? 'pointer' : 'default',
                transition: 'var(--transition)',
              }}
              onClick={() => !n.isRead && markRead(n._id)}
            >
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                background: `${typeColor(n.type)}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {typeIcon(n.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {n.message}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 12, background: `${typeColor(n.type)}18`,
                    color: typeColor(n.type), textTransform: 'capitalize',
                  }}>
                    {n.type.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</span>
                </div>
              </div>

              {/* Unread dot */}
              {!n.isRead && (
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)', flexShrink: 0, marginTop: 6,
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
