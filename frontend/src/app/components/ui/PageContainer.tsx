import React from 'react';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Container width variant:
   * - 'narrow': max-w-md (for Login, Signup, Admin Login cards)
   * - 'medium': max-w-3xl or max-w-4xl (for Hub Dashboard)
   * - 'wide': max-w-6xl or max-w-7xl (for Landing Page, Admin Portal)
   * - 'full': max-w-7xl w-full
   */
  size?: 'narrow' | 'medium' | 'wide' | 'xl';
  className?: string;
}

const sizeClasses: Record<NonNullable<PageContainerProps['size']>, string> = {
  narrow: 'max-w-md w-full',
  medium: 'max-w-4xl w-full',
  wide: 'max-w-6xl w-full',
  xl: 'max-w-7xl w-full',
};

/**
 * Standardized PageContainer component ensuring consistent horizontal centering (mx-auto),
 * responsive horizontal padding (px-4 sm:px-6 lg:px-8), and breakpoint protection across all screens.
 */
export default function PageContainer({
  children,
  size = 'wide',
  className = '',
  style,
  ...props
}: PageContainerProps) {
  const chosenSizeClass = sizeClasses[size] || sizeClasses.wide;

  return (
    <div
      className={`${chosenSizeClass} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
