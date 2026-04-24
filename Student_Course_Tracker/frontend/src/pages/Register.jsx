import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    const result = await register(form.name, form.email, form.password);
    setSubmitting(false);
    if (result.success) {
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page-light">
      <div className="auth-card-light">
        <div className="auth-brand-light">
          <span className="brand-icon-lg">�</span>
          <h1>StudySphere</h1>
          <p>Create your StudySphere account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-light">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary-light" disabled={submitting}>
            {submitting ? <span className="spinner-sm-dark" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-light">
          Already have an account?{' '}
          <Link to="/login" className="auth-link-light">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
