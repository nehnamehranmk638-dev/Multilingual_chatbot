import React, { useState } from 'react';

const API = 'http://127.0.0.1:8000/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }
      // Persist token + user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      // Keep compatibility with existing userMode key the app already reads
      localStorage.setItem('userMode', data.user.role);
      onLoginSuccess(data.user);
    } catch {
      setError('Unable to connect to server. Is the Django backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎓</div>
        <h1 className="auth-title">IIIT Kottayam</h1>
        <p className="auth-subtitle">AI Admission &amp; Campus Assistant</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <a href="/signup" className="auth-link" onClick={(e) => { e.preventDefault(); onLoginSuccess(null, 'signup'); }}>
            Create account
          </a>
        </p>

        <p className="auth-switch" style={{ marginTop: '10px', fontSize: '0.8rem' }}>
          Staff / Faculty?{' '}
          <a href="/admin/login" className="auth-link" onClick={(e) => { e.preventDefault(); onLoginSuccess(null, 'admin-login'); }}>
            Admin Portal →
          </a>
        </p>
      </div>
    </div>
  );
}
