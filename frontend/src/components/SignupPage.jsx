import React, { useState } from 'react';
import Input from '../app/components/ui/Input';
import Button from '../app/components/ui/Button';
import PageContainer from '../app/components/ui/PageContainer';
import { StarDoodle, CircleDoodle, SquiggleDoodle } from '../app/components/ui/Doodles';

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
      if (data.user.user_id) {
        localStorage.setItem('userId', data.user.user_id);
      }
      localStorage.setItem('userMode', data.user.role);
      onSignupSuccess(data.user);
    } catch {
      setError('Unable to connect to server. Is the Django backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f1e8] text-[#1a1a1a] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Playful background doodles */}
      <StarDoodle className="absolute top-8 right-12 sm:right-28 text-[#f4a340] opacity-40 scale-125 pointer-events-none" />
      <SquiggleDoodle className="absolute bottom-10 left-8 sm:left-24 opacity-30 -rotate-6 pointer-events-none" />
      <CircleDoodle className="absolute top-20 left-10 sm:left-20 opacity-30 pointer-events-none" />

      {/* Main Signup Card within Centered PageContainer */}
      <PageContainer size="narrow" className="flex justify-center relative z-10 my-6">
        <div className="w-full bg-white rounded-3xl border border-[#e8e3d8] p-8 sm:p-10 shadow-sm transition-all duration-200">
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#f4a340]/15 flex items-center justify-center text-2xl mb-3 shadow-inner">
            🎓
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1a1a]">
            Create Account
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6b6b] mt-1 font-medium">
            Your Gateway to IIIT Kottayam
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 rounded-xl bg-[#e85d4a]/10 border border-[#e85d4a]/20 p-3.5 text-xs sm:text-sm font-medium text-[#e85d4a] flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={set('email')}
            autoComplete="off"
            required
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={form.confirm_password}
            onChange={set('confirm_password')}
            autoComplete="new-password"
            required
          />

          {/* Role Selection Segmented Controls */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs sm:text-sm font-semibold text-[#1a1a1a]">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-[#faf8f3] rounded-2xl border border-[#e8e3d8]">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: 'student' }))}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  form.role === 'student'
                    ? 'bg-[#2d2d2d] text-white shadow-sm'
                    : 'text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-black/5'
                }`}
              >
                <span>👤</span>
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: 'parent' }))}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  form.role === 'parent'
                    ? 'bg-[#2d2d2d] text-white shadow-sm'
                    : 'text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-black/5'
                }`}
              >
                <span>👨‍👩‍👧</span>
                <span>Parent</span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full mt-2 font-semibold shadow-md"
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-[#e8e3d8] text-center text-xs sm:text-sm text-[#6b6b6b]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onSignupSuccess(null, 'login')}
            className="text-[#f4a340] font-semibold hover:underline cursor-pointer ml-1 inline-block"
          >
            Sign In
          </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
