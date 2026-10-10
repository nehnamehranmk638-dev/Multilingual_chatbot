import React, { useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function AdminLoginPage({ onAdminLoginSuccess, onNavigateToApp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Admin authentication failed.');
      }

      // Store admin session
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      if (onAdminLoginSuccess) {
        onAdminLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin-auth-page">
      <div className="auth-card admin-auth-card">
        <div className="auth-logo">🏛️</div>
        <h2 className="auth-title">IIIT Kottayam</h2>
        <p className="auth-subtitle">Admin Portal</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="admin-username">
              Username or Official Email
            </label>
            <input
              id="admin-username"
              type="text"
              className="auth-input admin-auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="admin-password">
              Admin Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="auth-input admin-auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-btn admin-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="auth-switch">
          <a
            href="/login"
            className="auth-link"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateToApp) onNavigateToApp('/login');
              else window.location.pathname = '/login';
            }}
          >
            ← Back to Student / Parent Portal
          </a>
        </div>
      </div>
    </div>
  );
}
