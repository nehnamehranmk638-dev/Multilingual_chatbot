import React, { useState } from 'react';
import Input from '../app/components/ui/Input';
import Button from '../app/components/ui/Button';
import PageContainer from '../app/components/ui/PageContainer';
import { StarDoodle, SquiggleDoodle } from '../app/components/ui/Doodles';

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
    <div className="min-h-screen w-full bg-[#f5f1e8] text-[#1a1a1a] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative doodles */}
      <StarDoodle className="absolute top-10 right-10 sm:right-24 text-[#f4a340] opacity-40 scale-125 pointer-events-none" />
      <SquiggleDoodle className="absolute bottom-12 left-10 sm:left-20 opacity-30 -rotate-12 pointer-events-none" />

      {/* Main Admin Login Card within Centered PageContainer */}
      <PageContainer size="narrow" className="flex justify-center relative z-10">
        <div className="w-full bg-white rounded-3xl border border-[#e8e3d8] p-8 sm:p-10 shadow-sm transition-all duration-200">
        {/* Header with Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2d2d2d] text-white flex items-center justify-center text-2xl mb-3 shadow-md">
            🏛️
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1a1a]">
            IIIT Kottayam
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6b6b] mt-1 font-medium">
            Staff &amp; Faculty Administration Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 rounded-xl bg-[#e85d4a]/10 border border-[#e85d4a]/20 p-3.5 text-xs sm:text-sm font-medium text-[#e85d4a] flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form with autofill prevention */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
          <Input
            label="Username or Official Email"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            name="admin_user_identifier"
            disabled={loading}
            autoFocus
            required
          />

          <Input
            label="Admin Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            name="admin_secret_key"
            disabled={loading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full mt-2 font-semibold shadow-md bg-[#2d2d2d] hover:bg-[#1a1a1a]"
          >
            {loading ? 'Authenticating…' : 'Access Portal'}
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 pt-5 border-t border-[#e8e3d8] text-center text-xs sm:text-sm text-[#6b6b6b]">
          <button
            type="button"
            onClick={() => {
              if (onNavigateToApp) onNavigateToApp('/login');
              else window.location.pathname = '/login';
            }}
            className="text-[#6b6b6b] hover:text-[#1a1a1a] font-medium transition-colors cursor-pointer"
          >
            ← Back to Student / Parent Portal
          </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
