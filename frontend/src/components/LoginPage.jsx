import React, { useState } from 'react';
import Input from '../app/components/ui/Input';
import Button from '../app/components/ui/Button';
import PageContainer from '../app/components/ui/PageContainer';
import { StarDoodle, SquiggleDoodle } from '../app/components/ui/Doodles';

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
      if (data.user.user_id) {
        localStorage.setItem('userId', data.user.user_id);
      }
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
    <div className="min-h-screen w-full bg-[#f5f1e8] text-[#1a1a1a] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Playful background doodles */}
      <StarDoodle className="absolute top-10 left-8 sm:left-24 text-[#f4a340] opacity-40 scale-125 pointer-events-none" />
      <SquiggleDoodle className="absolute bottom-12 left-10 sm:left-20 opacity-30 rotate-12 pointer-events-none" />
      <StarDoodle className="absolute bottom-16 right-10 sm:right-28 opacity-40 scale-110 pointer-events-none" />

      {/* Main Login Card within Centered PageContainer */}
      <PageContainer size="narrow" className="flex justify-center relative z-10">
        <div className="w-full bg-white rounded-3xl border border-[#e8e3d8] p-8 sm:p-10 shadow-sm transition-all duration-200">
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#f4a340]/15 flex items-center justify-center text-2xl mb-3 shadow-inner">
            🎓
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1a1a]">
            Welcome to IIIT Kottayam
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6b6b] mt-1 font-medium">
            Discover with Ease
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 rounded-xl bg-[#e85d4a]/10 border border-[#e85d4a]/20 p-3.5 text-xs sm:text-sm font-medium text-[#e85d4a] flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Container replacing <form> to permanently prevent browser autofill/address profiling */}
        <div
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="flex flex-col gap-4"
        >
          {/* Dummy hidden decoy inputs to absorb aggressive Chromium autofill scans */}
          <input type="text" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input type="password" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <Input
            label="Email Address"
            type="text"
            inputMode="email"
            id="field_login_id_z44"
            name="field_login_id_z44"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="nope"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            required
          />

          <Input
            label="Password"
            type="password"
            id="field_login_pw_w88"
            name="field_login_pw_w88"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            required
          />

          <Button
            type="button"
            onClick={handleSubmit}
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full mt-2 font-semibold shadow-md"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </div>

        {/* Footer Navigation Switchers */}
        <div className="mt-6 pt-5 border-t border-[#e8e3d8] flex flex-col items-center gap-2.5 text-xs sm:text-sm text-[#6b6b6b]">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onLoginSuccess(null, 'signup')}
              className="text-[#f4a340] font-semibold hover:underline cursor-pointer ml-1 inline-block"
            >
              Create account
            </button>
          </p>

          <p className="text-xs text-[#888888]">
            Staff or Faculty member?{' '}
            <button
              type="button"
              onClick={() => onLoginSuccess(null, 'admin-login')}
              className="text-[#1a1a1a] font-semibold hover:underline cursor-pointer ml-1 inline-block"
            >
              Admin Portal →
            </button>
          </p>
        </div>
      </div>
      </PageContainer>
    </div>
  );
}
