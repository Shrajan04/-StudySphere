import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(form.email, form.password);
    setSubmitting(false);
    if (result.success) {
      toast.success('Welcome back! 🎉');
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
          <p>Sign in to your StudySphere account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-light">
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
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary-light" disabled={submitting}>
            {submitting ? <span className="spinner-sm-dark" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-light">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-link-light">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
