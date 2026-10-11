import React from 'react';

export function SquiggleDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      width="64"
      height="24"
      viewBox="0 0 64 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12C8 4 14 20 20 12C26 4 32 20 38 12C44 4 50 20 56 12C59 8 62 10 63 12"
        stroke="#f4a340"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 2L18.5 12L28.5 9.5L21 16L28.5 22.5L18.5 20L16 30L13.5 20L3.5 22.5L11 16L3.5 9.5L13.5 12L16 2Z"
        fill="#f4a340"
        fillOpacity="0.4"
        stroke="#f4a340"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CircleDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke="#e8e3d8"
        strokeWidth="2.5"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

export function StudentHeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`select-none ${className}`}
      width="360"
      height="300"
      viewBox="0 0 360 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft shadow base */}
      <ellipse cx="180" cy="270" rx="140" ry="14" fill="#e8e3d8" fillOpacity="0.8" />
      
      {/* Desk / table */}
      <rect x="50" y="210" width="260" height="10" rx="5" fill="#2d2d2d" />
      <rect x="80" y="220" width="8" height="50" rx="4" fill="#2d2d2d" />
      <rect x="272" y="220" width="8" height="50" rx="4" fill="#2d2d2d" />
      
      {/* Laptop */}
      <rect x="135" y="180" width="90" height="30" rx="4" fill="#1a1a1a" />
      <rect x="140" y="184" width="80" height="22" rx="2" fill="#faf8f3" />
      <path d="M125 210H235L225 214H135L125 210Z" fill="#6b6b6b" />
      <circle cx="180" cy="195" r="3" fill="#f4a340" />

      {/* Coffee Mug */}
      <rect x="250" y="190" width="18" height="20" rx="4" fill="#f4a340" />
      <path d="M268 195C272 195 273 203 268 205" stroke="#f4a340" strokeWidth="2.5" />

      {/* Student Figure */}
      {/* Body / Sweater */}
      <path
        d="M140 145C140 135 155 125 180 125C205 125 220 135 220 145L225 210H135L140 145Z"
        fill="#f4a340"
      />
      {/* Collar */}
      <path d="M170 125L180 135L190 125" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

      {/* Head */}
      <circle cx="180" cy="95" r="24" fill="#ffdfba" />
      
      {/* Hair */}
      <path
        d="M156 95C156 75 168 65 180 65C195 65 204 75 204 92C204 96 195 86 180 86C166 86 158 92 156 95Z"
        fill="#1a1a1a"
      />

      {/* Glasses */}
      <rect x="166" y="90" width="11" height="8" rx="2" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      <rect x="183" y="90" width="11" height="8" rx="2" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      <line x1="177" y1="94" x2="183" y2="94" stroke="#1a1a1a" strokeWidth="2" />

      {/* Smile */}
      <path d="M176 106C178 108 182 108 184 106" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />

      {/* Graduation Cap accent floating above or near */}
      <g transform="translate(195, 35)">
        <polygon points="20,5 38,15 20,25 2,15" fill="#2d2d2d" />
        <rect x="14" y="24" width="12" height="7" rx="3" fill="#2d2d2d" />
        <path d="M38 15L42 24" stroke="#f4a340" strokeWidth="2" strokeLinecap="round" />
        <circle cx="42" cy="25" r="2" fill="#f4a340" />
      </g>

      {/* Decorative Doodles floating */}
      <g transform="translate(60, 80)">
        <path d="M0 10C5 0 10 20 15 10" stroke="#f4a340" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
      <g transform="translate(280, 110)">
        <circle cx="8" cy="8" r="6" stroke="#2d2d2d" strokeWidth="2" strokeDasharray="2 3" fill="none" />
      </g>
      <g transform="translate(80, 150)">
        <path d="M4 0L8 12L0 12Z" fill="#e8e3d8" />
      </g>
    </svg>
  );
}
