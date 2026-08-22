import React from 'react';
import ofisWordmark from '../assets/ofis-wordmark.png';

export type OFISWordmarkSize = 'xs' | 'sm' | 'small' | 'md' | 'medium' | 'lg' | 'large' | 'xl';

export interface OFISWordmarkProps {
  className?: string;
  size?: OFISWordmarkSize;
  iconOnly?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

export const OFISWordmark: React.FC<OFISWordmarkProps> = ({
  className = '',
  size = 'md',
  iconOnly = false,
  animated = false,
  onClick,
}) => {
  const normalizedSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = ((): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
    if (size === 'small' || size === 'sm') return 'sm';
    if (size === 'xs') return 'xs';
    if (size === 'large' || size === 'lg') return 'lg';
    if (size === 'xl') return 'xl';
    return 'md';
  })();

  const sizeClasses = {
    xs: {
      imgClass: 'h-6 sm:h-7 w-auto object-contain',
      iconClass: 'h-6 w-6 object-contain',
    },
    sm: {
      imgClass: 'h-7 sm:h-8 w-auto object-contain',
      iconClass: 'h-8 w-8 object-contain',
    },
    md: {
      imgClass: 'h-10 sm:h-11 w-auto object-contain',
      iconClass: 'h-10 w-10 object-contain',
    },
    lg: {
      imgClass: 'h-12 sm:h-14 md:h-16 w-auto object-contain',
      iconClass: 'h-14 w-14 object-contain',
    },
    xl: {
      imgClass: 'h-16 sm:h-20 md:h-24 w-auto object-contain',
      iconClass: 'h-20 w-20 object-contain',
    },
  }[normalizedSize];

  if (iconOnly) {
    return (
      <div
        id="ofis-icon-container"
        className={`inline-flex items-center justify-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <img
          src="/ofis-icon.png"
          alt="OFIS"
          className={`${sizeClasses.iconClass} block select-none ${animated ? 'transition-transform duration-300 hover:scale-105' : ''}`}
        />
      </div>
    );
  }

  return (
    <div
      id="ofis-wordmark-container"
      className={`inline-flex items-center justify-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      aria-label="OFIS"
      title="OFIS"
    >
      <img
        src={ofisWordmark}
        alt="OFIS"
        className={`${sizeClasses.imgClass} block select-none ${
          animated ? 'transition-transform duration-200 hover:scale-[1.02]' : ''
        }`}
      />
    </div>
  );
};

export default OFISWordmark;
