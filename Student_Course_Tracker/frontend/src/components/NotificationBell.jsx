import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get('/notifications');
      setNotifications(data.notifications.slice(0, 8));
      setUnreadCount(data.unreadCount);
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    await axiosInstance.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await axiosInstance.put('/notifications/read-all');
    fetchNotifications();
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="notif-bell-wrapper" ref={ref}>
      <button
        id="notification-bell"
        className="notif-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">🎉 You&apos;re all caught up!</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                  onClick={() => !n.isRead && markRead(n._id)}
                >
                  <div className={`notif-dot ${n.isRead ? 'read' : ''}`} />
                  <div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notif-footer">
            <Link to="/notifications" onClick={() => setOpen(false)}>View all notifications →</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
