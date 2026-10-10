import React, { useState } from 'react';

const API = 'http://127.0.0.1:8000/api';

export default function SignupPage({ onSignupSuccess }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm_password: '', role: 'student',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirm_password, role } = form;
    if (!name.trim())                    return setError('Full name is required.');
    if (!email.trim())                   return setError('Email is required.');
    if (password.length < 6)            return setError('Password must be at least 6 characters.');
    if (password !== confirm_password)  return setError('Passwords do not match.');

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, confirm_password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed.');
        return;
      }
      // Persist token + user info (auto-login after signup)
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userMode', data.user.role);
      onSignupSuccess(data.user);
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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join IIIT Kottayam AI Assistant</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">Full Name</label>
          <input className="auth-input" type="text"
            value={form.name} onChange={set('name')} autoComplete="name" required />

          <label className="auth-label">Email</label>
          <input className="auth-input" type="email"
            value={form.email} onChange={set('email')} autoComplete="email" required />

          <label className="auth-label">Password</label>
          <input className="auth-input" type="password"
            value={form.password} onChange={set('password')} autoComplete="new-password" required />

          <label className="auth-label">Confirm Password</label>
          <input className="auth-input" type="password"
            value={form.confirm_password} onChange={set('confirm_password')} autoComplete="new-password" required />

          <label className="auth-label">I am a:</label>
          <div className="auth-role-row">
            <label className={`auth-role-option ${form.role === 'student' ? 'selected' : ''}`}>
              <input type="radio" name="role" value="student"
                checked={form.role === 'student'} onChange={set('role')} />
              <span>👤 Student</span>
            </label>
            <label className={`auth-role-option ${form.role === 'parent' ? 'selected' : ''}`}>
              <input type="radio" name="role" value="parent"
                checked={form.role === 'parent'} onChange={set('role')} />
              <span>👨‍👩‍👧 Parent</span>
            </label>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <a href="/login" className="auth-link" onClick={(e) => { e.preventDefault(); onSignupSuccess(null, 'login'); }}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
