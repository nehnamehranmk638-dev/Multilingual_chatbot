import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  icon,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-[#f4a340]/40';

  const sizeStyles = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-3 gap-2',
    lg: 'text-base px-8 py-3.5 gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#f4a340] text-white hover:bg-[#e8933a] shadow-sm hover:shadow',
    secondary:
      'bg-transparent border border-[#2d2d2d] text-[#2d2d2d] hover:bg-[#2d2d2d] hover:text-white',
    destructive:
      'bg-[#e85d4a] text-white hover:bg-[#d64a37] shadow-sm',
    ghost:
      'bg-transparent text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-black/5',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
