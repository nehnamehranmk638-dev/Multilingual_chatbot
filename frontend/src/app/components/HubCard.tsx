import React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface HubCardProps {
  icon: LucideIcon;
  accentColor: 'blue' | 'emerald' | 'amber';
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}

const colorStyles = {
  blue: {
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-400',
    footerText: 'text-blue-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    footerText: 'text-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
    footerText: 'text-amber-400',
  },
};

export default function HubCard({
  icon: Icon,
  accentColor,
  title,
  description,
  actionLabel,
  onClick,
}: HubCardProps) {
  const currentTheme = colorStyles[accentColor] || colorStyles.blue;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="relative flex flex-col items-start text-left p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer group select-none outline-none focus-visible:border-white/30"
    >
      {/* Icon container */}
      <div
        className={`w-11 h-11 rounded-xl ${currentTheme.iconBg} flex items-center justify-center mb-4`}
      >
        <Icon size={20} className={currentTheme.iconText} />
      </div>

      {/* Title */}
      <h3 className="text-white font-medium text-base sm:text-lg">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
        {description}
      </p>

      {/* Footer row */}
      <div
        className={`mt-5 flex items-center gap-1.5 ${currentTheme.footerText} text-sm font-medium`}
      >
        <span>{actionLabel}</span>
        <ArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </div>
    </div>
  );
}
