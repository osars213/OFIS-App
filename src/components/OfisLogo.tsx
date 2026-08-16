import React from 'react';

interface OfisLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  lightMode?: boolean;
}

/**
 * Canonical OFIS Logo Component
 * Strictly renders the official locked logo asset (/public/ofis-logo.png)
 * sourced directly from the brand identity file.
 */
export const OfisLogo: React.FC<OfisLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  // Exact height scales for the official logo asset
  const heightMap = {
    xs: 'h-5',
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
  };

  return (
    <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
      <img
        src="/ofis-logo.png"
        alt="OFIS - Physical Spaces"
        className={`${heightMap[size]} w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,200,120,0.3)] transition-transform`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

