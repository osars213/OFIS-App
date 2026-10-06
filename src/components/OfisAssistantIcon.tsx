import React from 'react';

interface OfisAssistantIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const OfisAssistantIcon: React.FC<OfisAssistantIconProps> = ({
  className = '',
  size = 'md',
  animated = false,
}) => {
  const sizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${dimension} ${className}`}>
      {animated && (
        <span className="absolute inset-0 rounded-full bg-[#FFA987]/30 blur-xs animate-ping pointer-events-none" />
      )}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[#FFA987]"
      >
        {/* Outer Intelligent Orbit */}
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          className="opacity-60"
        />
        {/* Core Architectural Neural Diamond */}
        <path
          d="M12 3.5L14.2 9.8L20.5 12L14.2 14.2L12 20.5L9.8 14.2L3.5 12L9.8 9.8L12 3.5Z"
          fill="currentColor"
          fillOpacity="0.85"
        />
        {/* Radiant Inner Star */}
        <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
        <circle cx="12" cy="12" r="1.2" fill="#FFA987" />
        {/* Satellite Signal Sparks */}
        <circle cx="18" cy="6" r="1" fill="#FFD0BD" />
        <circle cx="6" cy="18" r="1" fill="#FFD0BD" />
      </svg>
    </span>
  );
};
