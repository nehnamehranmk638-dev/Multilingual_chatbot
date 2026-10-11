import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({
  children,
  className = '',
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-[#e8e3d8] shadow-sm p-6 sm:p-8 transition-all duration-200 ${
        hoverable
          ? 'hover:shadow-md hover:border-[#f4a340]/40 hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
