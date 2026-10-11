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
  name,
  autoComplete = 'nope',
  onFocus,
  onPointerDown,
  ...props
}: InputProps) {
  const inputId = id || (name ? `inp_${name}` : undefined);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.hasAttribute('readonly')) {
      e.target.removeAttribute('readonly');
    }
    if (onFocus) onFocus(e);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (target.hasAttribute('readonly')) {
      target.removeAttribute('readonly');
    }
    if (onPointerDown) onPointerDown(e);
  };

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <span className="text-xs sm:text-sm font-semibold text-[#1a1a1a] select-none pointer-events-none">
          {label}
        </span>
      )}

      <input
        id={inputId}
        name={name}
        readOnly
        onFocus={handleFocus}
        onPointerDown={handlePointerDown}
        autoComplete={autoComplete || 'nope'}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
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
