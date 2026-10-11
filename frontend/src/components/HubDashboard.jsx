import React, { useState, useEffect } from 'react';
import { MessageSquare, MapPin, MessageSquarePlus, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import PageContainer from '../app/components/ui/PageContainer';
import { StarDoodle, SquiggleDoodle } from '../app/components/ui/Doodles';

const WELCOMING_QUOTES = [
  "Every expert was once a beginner.",
  "Your journey at IIIT Kottayam starts with a single question.",
  "Curiosity is the first step to belonging.",
  "Great things never come from comfort zones.",
  "Discover knowledge. Build community. Create the future.",
  "Every big achievement begins with the decision to try.",
  "Welcome to a community of thinkers, creators, and innovators.",
  "Step in with curiosity, step forward with confidence.",
  "The future belongs to those who ask bold questions.",
  "Your path through campus starts here — explore with ease.",
];

export default function HubDashboard({
  currentUser,
  selectedLanguage,
  onOpenChat,
  onOpenMap,
  onOpenFeedback,
  onRequestLogout,
  onChangeLanguage,
}) {
  const isStudent = currentUser?.role === 'student';
  const isParent = currentUser?.role === 'parent';
  const roleLabel = isStudent ? 'Student' : isParent ? 'Parent' : (currentUser?.role || 'Guest');
  const userName = currentUser?.name?.trim() || '';

  // Select a random quote on component mount
  const [quote, setQuote] = useState('');
  useEffect(() => {
    const randomQuote = WELCOMING_QUOTES[Math.floor(Math.random() * WELCOMING_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f5f1e8] text-[#1a1a1a] font-['Inter',sans-serif] flex flex-col justify-start relative overflow-x-hidden">
      {/* Decorative doodles */}
      <StarDoodle className="absolute top-12 right-12 text-[#f4a340] opacity-40 scale-125 pointer-events-none" />
      <SquiggleDoodle className="absolute bottom-12 left-12 opacity-30 rotate-12 pointer-events-none" />

      <PageContainer size="medium" className="py-6 sm:py-10 flex-1 flex flex-col relative z-10">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-3 sm:py-4">
          {/* Left cluster */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4a340] flex items-center justify-center text-white text-lg shadow-sm">
              🎓
            </div>
            <div>
              <span className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a] tracking-tight">
                IIIT Kottayam
              </span>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {/* Role Chip */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#e8e3d8] rounded-full px-3.5 py-1.5 text-xs font-medium text-[#2d2d2d] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#f4a340]" />
              <span>{roleLabel} {userName ? `• ${userName}` : ''}</span>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={onRequestLogout}
              className="w-9 h-9 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center text-[#6b6b6b] hover:text-[#e85d4a] hover:border-[#e85d4a]/30 transition-all cursor-pointer shadow-2xs"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Welcome Section with Rotating Tagline */}
        <section className="text-center pt-8 sm:pt-12 pb-8 sm:pb-10">
          {/* Rotating Quote pill */}
          {quote && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-[#e8e3d8] text-xs sm:text-sm text-[#6b6b6b] italic mb-4 shadow-2xs animate-fade-in">
              <Sparkles size={13} className="text-[#f4a340] shrink-0 not-italic" />
              <span>"{quote}"</span>
            </div>
          )}

          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1a1a1a] tracking-tight">
            Welcome{userName ? `, ${userName}` : ' to IIIT Kottayam'}
          </h1>
          <p className="text-[#6b6b6b] text-sm sm:text-base mt-2.5 font-medium max-w-lg mx-auto">
            What would you like to explore today?
          </p>
        </section>

        {/* Vertically Stacked Cards (Spacious, Rounded Panels with Natural Scrolling) */}
        <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full pb-16">
          {/* Card 1: Chatbot */}
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenChat}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenChat()}
            className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-white border border-[#e8e3d8] hover:border-[#f4a340] hover:shadow-xl transition-all duration-200 cursor-pointer select-none text-left min-h-[250px]"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#f4a340]/15 text-[#f4a340] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-3">
                Admission Chatbot
              </h3>
              <p className="text-sm sm:text-base text-[#6b6b6b] leading-relaxed max-w-2xl">
                Ask questions about admissions, fees, eligibility criteria, cutoffs, scholarships, and seat allocations in 6 Indian languages.
              </p>
            </div>

            <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#f4a340] group-hover:translate-x-1.5 transition-transform mt-8">
              <span>Start chatting</span>
              <ArrowRight size={20} />
            </div>
          </div>

          {/* Card 2: Campus Map */}
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenMap}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenMap()}
            className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-white border border-[#e8e3d8] hover:border-[#2d2d2d] hover:shadow-xl transition-all duration-200 cursor-pointer select-none text-left min-h-[250px]"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#2d2d2d]/10 text-[#2d2d2d] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <MapPin size={32} />
              </div>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-3">
                Campus Map &amp; Navigator
              </h3>
              <p className="text-sm sm:text-base text-[#6b6b6b] leading-relaxed max-w-2xl">
                Explore academic blocks, classroom numbers (BC304, AA101), student mess, sports grounds, and faculty cabin locations with ease.
              </p>
            </div>

            <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#2d2d2d] group-hover:translate-x-1.5 transition-transform mt-8">
              <span>Explore map</span>
              <ArrowRight size={20} />
            </div>
          </div>

          {/* Card 3: Give Feedback */}
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenFeedback}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenFeedback()}
            className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-white border border-[#e8e3d8] hover:border-[#f4a340] hover:shadow-xl transition-all duration-200 cursor-pointer select-none text-left min-h-[250px]"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#f4a340]/15 text-[#f4a340] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                <MessageSquarePlus size={32} />
              </div>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-3">
                Share Feedback
              </h3>
              <p className="text-sm sm:text-base text-[#6b6b6b] leading-relaxed max-w-2xl">
                Rate your admission assistant experience or report issues directly to help our team improve campus services.
              </p>
            </div>

            <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#f4a340] group-hover:translate-x-1.5 transition-transform mt-8">
              <span>Give feedback</span>
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
