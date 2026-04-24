import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard',    label: 'Dashboard',    icon: '📊' },
    { to: '/courses',      label: 'Courses',      icon: '🎓' },
    { to: '/assignments',  label: 'Assignments',  icon: '📝' },
    { to: '/grades',       label: 'Grades',       icon: '🏆' },
    { to: '/discussion',   label: 'Discussion',   icon: '💬' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">�</span>
        <span className="brand-name">StudySphere</span>
      </div>

      {/* Desktop Nav Links */}
      <div className="navbar-links">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            <span>{link.icon}</span> {link.label}
          </Link>
        ))}
      </div>

      {/* User Info */}
      {user && (
        <div className="navbar-user">
          <NotificationBell />
          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <span className="user-name">{user.name}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Mobile Hamburger */}
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <button className="btn-logout-mobile" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
