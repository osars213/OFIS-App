import React, { useState } from 'react';

interface OFISWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
}

export const OFISWordmark: React.FC<OFISWordmarkProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { height: 'h-6 sm:h-7', text: 'text-lg', dot: 'text-lg', sub: 'text-[9px]' };
      case 'lg':
        return { height: 'h-10 sm:h-12', text: 'text-2xl sm:text-3xl', dot: 'text-2xl sm:text-3xl', sub: 'text-xs' };
      case 'hero':
        return { height: 'h-14 sm:h-16', text: 'text-4xl sm:text-5xl', dot: 'text-4xl sm:text-5xl', sub: 'text-sm' };
      case 'md':
      default:
        return { height: 'h-8 sm:h-9', text: 'text-xl sm:text-2xl', dot: 'text-xl sm:text-2xl', sub: 'text-[10px]' };
    }
  };

  const dims = getDimensions();

  return (
    <div className={`inline-flex items-center space-x-2 select-none ${className}`}>
      {!imageError ? (
        <img
          src="/ofis-logo.png"
          alt="OFIS Logo"
          className={`${dims.height} w-auto object-contain`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex items-center space-x-1">
          <span className={`font-black tracking-tighter text-[#F2F2F2] font-mono ${dims.text}`}>
            OFIS
          </span>
          <span className={`font-black text-[#00C878] ${dims.dot}`}>•</span>
        </div>
      )}

      {showTagline && (
        <span className={`text-[#718079] font-medium hidden sm:inline ${dims.sub}`}>
          Physical Spaces
        </span>
      )}
    </div>
  );
};
