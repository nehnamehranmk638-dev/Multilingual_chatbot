import React from 'react';
import { GraduationCap, Sparkles, Globe, BookOpen, ShieldCheck } from 'lucide-react';
import Button from './ui/Button';
import PageContainer from './ui/PageContainer';
import { SquiggleDoodle, StarDoodle, CircleDoodle, StudentHeroIllustration } from './ui/Doodles';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#f5f1e8] text-[#1a1a1a] flex flex-col justify-between overflow-x-hidden selection:bg-[#f4a340] selection:text-white">
      {/* Decorative Doodles positioned around the screen */}
      <div className="absolute top-20 left-8 sm:left-24 opacity-60 pointer-events-none">
        <SquiggleDoodle className="w-16 h-6 rotate-12" />
      </div>
      <div className="absolute top-28 right-8 sm:right-28 opacity-70 pointer-events-none">
        <StarDoodle className="w-8 h-8" />
      </div>
      <div className="absolute bottom-40 left-12 opacity-50 hidden sm:block pointer-events-none">
        <CircleDoodle className="w-10 h-10" />
      </div>
      <div className="absolute bottom-28 right-16 opacity-60 pointer-events-none">
        <SquiggleDoodle className="w-20 h-7 -rotate-6" />
      </div>

      {/* Main Centered Container */}
      <PageContainer size="xl" className="relative z-10 py-6 sm:py-8 flex-1 flex flex-col justify-between">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2">
          {/* Logo mark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4a340] flex items-center justify-center text-white shadow-sm">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a] tracking-tight">
              IIIT Kottayam
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('/login')}
              className="text-xs sm:text-sm px-4 sm:px-5 py-2"
            >
              Log In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/signup')}
              className="text-xs sm:text-sm px-4 sm:px-5 py-2 shadow-sm"
            >
              Sign Up
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="my-auto py-8 sm:py-10 flex flex-col items-center text-center">
          {/* Subtle Tag Pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#e8e3d8] rounded-full px-4 py-1.5 text-xs font-semibold text-[#f4a340] mb-5 sm:mb-6 shadow-2xs">
            <Sparkles size={14} className="text-[#f4a340]" />
            <span>Official Admission &amp; Campus Assistant</span>
          </div>

          {/* Heading */}
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#1a1a1a] tracking-tight max-w-3xl leading-[1.15]">
            Explore{' '}
            <span className="text-[#f4a340] underline decoration-[#f4a340]/40 decoration-wavy underline-offset-8">
              IIIT Kottayam
            </span>
          </h1>

          {/* Subheading Line 1 */}
          <p className="mt-4 sm:mt-5 text-base sm:text-xl font-bold text-[#1a1a1a] max-w-xl tracking-tight">
            Discover. Ask. Navigate. Belong.
          </p>

          {/* Subheading Line 2 */}
          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-[#6b6b6b] max-w-md font-normal leading-relaxed">
            designed to make every step of your IIIT Kottayam journey easier.
          </p>

          {/* Hero Illustration */}
          <div className="mt-6 sm:mt-8 transform hover:scale-[1.01] transition-transform">
            <StudentHeroIllustration className="max-w-[280px] sm:max-w-[340px] h-auto drop-shadow-sm" />
          </div>
        </main>

        {/* Feature Grid & About Section Container */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
          {/* 2x2 Feature Grid inside single rounded panel with thin dividers */}
          <section className="pt-4 pb-6">
            <div className="w-full bg-white rounded-3xl border border-[#e8e3d8] overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e8e3d8] border-b border-[#e8e3d8]">
                {/* Card 1: Trusted Source */}
                <div className="p-8 sm:p-10 flex items-start gap-5 bg-white text-left">
                  <div className="w-14 h-14 rounded-2xl bg-[#f4a340]/15 text-[#f4a340] flex items-center justify-center shrink-0">
                    <ShieldCheck size={26} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#f4a340] uppercase tracking-wider mb-1.5">
                      TRUSTED SOURCE
                    </div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a]">
                      Official Campus Information
                    </h3>
                  </div>
                </div>

                {/* Card 2: Campus Map */}
                <div className="p-8 sm:p-10 flex items-start gap-5 bg-white text-left">
                  <div className="w-14 h-14 rounded-2xl bg-[#f4a340]/15 text-[#f4a340] flex items-center justify-center shrink-0">
                    <BookOpen size={26} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#f4a340] uppercase tracking-wider mb-1.5">
                      CAMPUS MAP
                    </div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a]">
                      Find Your Way Around
                    </h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e8e3d8]">
                {/* Card 3: Multilingual */}
                <div className="p-8 sm:p-10 flex items-start gap-5 bg-white text-left">
                  <div className="w-14 h-14 rounded-2xl bg-[#f4a340]/15 text-[#f4a340] flex items-center justify-center shrink-0">
                    <Globe size={26} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#f4a340] uppercase tracking-wider mb-1.5">
                      MULTILINGUAL
                    </div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a]">
                      6 Languages Supported
                    </h3>
                  </div>
                </div>

                {/* Card 4: AI Assistance */}
                <div className="p-8 sm:p-10 flex items-start gap-5 bg-white text-left">
                  <div className="w-14 h-14 rounded-2xl bg-[#f4a340]/15 text-[#f4a340] flex items-center justify-center shrink-0">
                    <Sparkles size={26} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#f4a340] uppercase tracking-wider mb-1.5">
                      AI ASSISTANCE
                    </div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a]">
                      AI-Powered Answers
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About IIIT Kottayam Section */}
          <section className="mt-14 sm:mt-20 text-center">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#1a1a1a] mb-5">About IIIT Kottayam</h2>
            <p className="text-base sm:text-lg text-[#6b6b6b] leading-relaxed max-w-4xl mx-auto">
              The Indian Institute of Information Technology, Kottayam (IIIT Kottayam), established in 2015 and declared an Institution of National Importance in 2017, is a public-private partnership (PPP) engineering institute located on a picturesque 53-acre green campus in Valavoor, Pala, Kerala. Jointly funded by the Central Government, the Government of Kerala, and industry partners like CIAL and the Rolta Foundation, the institute offers undergraduate (B.Tech), postgraduate (M.Tech), and doctoral (Ph.D.) programs with a strong emphasis on Computer Science, Artificial Intelligence, Data Science, Cybersecurity, and Electronics and Communication Engineering. Driven by a modern curriculum, active research groups, and solid placement records, IIIT Kottayam serves as a growing hub for technological education and innovation in South India.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center pt-6 pb-2 text-xs text-[#8c8c8c]">
          &copy; {new Date().getFullYear()} Indian Institute of Information Technology Kottayam. All rights reserved.
        </footer>
      </PageContainer>
    </div>
  );
}
