import React from 'react';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (langCode: string) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

export default function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
}: LanguageSwitcherProps) {
  return (
    <div className="flex justify-center sm:justify-end gap-1.5 mt-10 sm:mt-14 flex-wrap px-1">
      {LANGUAGES.map((lang) => {
        const isActive = (currentLanguage || 'en') === lang.code;

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onLanguageChange(lang.code)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${
              isActive
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
