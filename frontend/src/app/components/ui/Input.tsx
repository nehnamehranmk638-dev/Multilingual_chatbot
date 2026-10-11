import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs sm:text-sm font-semibold text-[#1a1a1a]"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`w-full rounded-xl border border-[#e8e3d8] bg-[#faf8f3] px-4 py-3 text-sm sm:text-base text-[#1a1a1a] placeholder:!text-[#9b9b9b] placeholder:opacity-100 outline-none transition-all duration-200 focus:border-[#f4a340] focus:ring-2 focus:ring-[#f4a340]/20 disabled:bg-[#f2ece1] disabled:text-[#888888] ${
          error ? 'border-[#e85d4a] focus:border-[#e85d4a] focus:ring-[#e85d4a]/20' : ''
        } ${className}`}
        {...props}
      />

      {error ? (
        <span className="text-xs font-medium text-[#e85d4a]">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#6b6b6b]">{helperText}</span>
      ) : null}
    </div>
  );
}
