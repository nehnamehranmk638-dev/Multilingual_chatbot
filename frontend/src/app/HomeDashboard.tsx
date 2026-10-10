import React from 'react';
import {
  GraduationCap,
  LogOut,
  MessageCircle,
  Compass,
  MessageSquareHeart,
} from 'lucide-react';
import HubCard from './components/HubCard';
import '../styles/fonts.css';

interface User {
  name?: string;
  email?: string;
  role?: string;
}

interface HomeDashboardProps {
  currentUser?: User | null;
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  onNavigateToChat: () => void;
  onOpenCampusMap: () => void;
  onOpenFeedback: () => void;
  onLogout: () => void;
}

export default function HomeDashboard({
  currentUser,
  onNavigateToChat,
  onOpenCampusMap,
  onOpenFeedback,
  onLogout,
}: HomeDashboardProps) {
  const studentName = currentUser?.name?.trim() || 'Student';

  return (
    <div className="min-h-screen w-full bg-[#0a0e1a] p-0 font-['Inter',sans-serif] text-slate-100 antialiased selection:bg-indigo-500/30 flex flex-col justify-start">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col">
        {/* Header Bar */}
        <header className="flex items-center justify-between py-3 sm:py-4">
          {/* Left cluster */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-white font-semibold text-base sm:text-lg tracking-tight">
              IIIT Kottayam
            </span>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role pill */}
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
              <span>Student • {studentName}</span>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={onLogout}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Welcome Section */}
        <section className="text-center pt-8 sm:pt-12 pb-10 sm:pb-14">
          <h1
            className="text-white font-semibold tracking-tight"
            style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}
          >
            Welcome to IIIT Kottayam
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            What would you like to do today?
          </p>
        </section>

        {/* Hub Cards Grid */}
        <main className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 px-1">
          {/* Card 1 — Chatbot */}
          <HubCard
            icon={MessageCircle}
            accentColor="blue"
            title="Chatbot"
            description="Ask about admissions, fees, eligibility, hostel, and more — in your language."
            actionLabel="Start chatting"
            onClick={onNavigateToChat}
          />

          {/* Card 2 — Campus Map */}
          <HubCard
            icon={Compass}
            accentColor="emerald"
            title="Campus Map"
            description="Find faculty cabins, academic blocks, hostels, and campus facilities."
            actionLabel="Open map"
            onClick={onOpenCampusMap}
          />

          {/* Card 3 — Give Feedback */}
          <HubCard
            icon={MessageSquareHeart}
            accentColor="amber"
            title="Give Feedback"
            description="Tell us what's working and what we can improve."
            actionLabel="Share feedback"
            onClick={onOpenFeedback}
          />
        </main>
      </div>
    </div>
  );
}
