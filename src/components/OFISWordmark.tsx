import React from 'react';
import { useApp } from '../context/AppContext';
import ofisLogoLight from '../assets/ofis-logo.png';
import ofisLogoDark from '../assets/ofis-logo-dark.png';
import ofisIcon from '../assets/ofis-icon.png';

interface OFISWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
  variant?: 'compact' | 'mark-only';
  theme?: 'dark' | 'light' | 'auto';
  isBreathing?: boolean;
  breathingSpeed?: 'slow' | 'medium' | 'fast';
}

export const OFISWordmark: React.FC<OFISWordmarkProps> = ({
  className = '',
  size = 'md',
  variant = 'compact',
  theme = 'auto',
  isBreathing = false,
  breathingSpeed = 'medium',
}) => {
  const { resolvedTheme, isAppPerformingAction } = useApp();
  const currentTheme = theme === 'auto' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  // Determine if breathing animation should be active (either explicitly requested or when global app action is ongoing)
  const shouldBreathe = isBreathing || isAppPerformingAction;

  const getBreathingClass = () => {
    if (!shouldBreathe) return '';
    switch (breathingSpeed) {
      case 'slow':
        return 'animate-[ofis-breathe-slow_3s_ease-in-out_infinite]';
      case 'fast':
        return 'animate-[ofis-breathe-fast_1.2s_ease-in-out_infinite]';
      case 'medium':
      default:
        return 'animate-[ofis-breathe_2s_ease-in-out_infinite]';
    }
  };

  // Height rules calibrated for crisp optical clarity (-10% to -15% header size for premium balance)
  const getHeightClass = () => {
    switch (size) {
      case 'sm':
        return 'h-6 sm:h-6.5';
      case 'lg':
        return 'h-9 sm:h-11';
      case 'hero':
        return 'h-12 sm:h-16';
      case 'md':
      default:
        return 'h-7 sm:h-8';
    }
  };

  const getIconClass = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 sm:w-6.5 sm:h-6.5';
      case 'lg':
        return 'w-10 h-10 sm:w-12 sm:h-12';
      case 'hero':
        return 'w-14 h-14 sm:w-16 sm:h-16';
      case 'md':
      default:
        return 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5';
    }
  };

  if (variant === 'mark-only') {
    return (
      <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
        {shouldBreathe && (
          <div className="absolute inset-0 rounded-full bg-teal-500/15 blur-sm animate-ping opacity-30 pointer-events-none" />
        )}
        <div className="reflective-emblem-wrap p-0.5">
          <img
            src={ofisIcon}
            alt="OFIS Emblem"
            className={`${getIconClass()} object-contain transition-all duration-300 hover:scale-105 ${getBreathingClass()}`}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    );
  }

  // Master Brand Logo (Pixel-perfect authentic artwork with full door glow and zero patch artifacts):
  // Dark mode -> ofisLogoDark (crisp white text + radiant teal/peach portal + glowing floor beam)
  // Light mode -> ofisLogoLight (deep teal text + vibrant teal/peach portal + warm floor glow)
  const logoSrc = isDark ? ofisLogoDark : ofisLogoLight;

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {shouldBreathe && (
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/15 via-[#F4A261]/15 to-teal-500/15 blur-xs rounded-xl animate-pulse pointer-events-none" />
      )}
      <img
        src={logoSrc}
        alt="OFIS"
        className={`${getHeightClass()} w-auto max-w-[190px] sm:max-w-[240px] object-contain transition-all duration-300 hover:scale-[1.015] ${getBreathingClass()}`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

