import React from 'react';
import { useSafeApp } from '../context/AppContext';

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
  const safeApp = useSafeApp();
  const resolvedTheme = safeApp?.resolvedTheme || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'dark');
  const isAppPerformingAction = safeApp?.isAppPerformingAction || false;
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

  // Height rules calibrated for prominent, crisp brand visibility
  const getHeightClass = () => {
    switch (size) {
      case 'sm':
        return 'h-7 sm:h-8';
      case 'lg':
        return 'h-11 sm:h-14';
      case 'hero':
        return 'h-14 sm:h-20';
      case 'md':
      default:
        return 'h-9 sm:h-10.5';
    }
  };

  const getIconClass = () => {
    switch (size) {
      case 'sm':
        return 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5';
      case 'lg':
        return 'w-12 h-12 sm:w-14 sm:h-14';
      case 'hero':
        return 'w-16 h-16 sm:w-20 sm:h-20';
      case 'md':
      default:
        return 'w-9 h-9 sm:w-11 sm:h-11';
    }
  };

  // Harmonized Mode Filtering & Glow:
  // In Dark Mode: subtle teal portal luminescence and crisp white letters
  // In Light Mode: crisp contrast
  const filterStyleClass = isDark
    ? 'filter brightness-[1.02] drop-shadow-[0_0_8px_rgba(20,190,184,0.25)]'
    : 'filter brightness-[1.0] drop-shadow-[0_1px_2px_rgba(7,56,61,0.08)]';

  if (variant === 'mark-only') {
    return (
      <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
        {shouldBreathe && (
          <div className="absolute inset-0 rounded-full bg-[#14BEB8]/20 blur-sm animate-ping opacity-30 pointer-events-none" />
        )}
        <img
          src="/ofis-icon.svg"
          alt="OFIS Emblem"
          className={`${getIconClass()} object-contain transition-all duration-300 hover:scale-105 ${filterStyleClass} ${getBreathingClass()}`}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Automatic Theme Switcher for Horizontal Logo:
  // Dark mode -> /ofis-logo-dark.svg (crisp white text + teal portal)
  // Light mode -> /ofis-logo.svg (dark architectural #07383D text + teal portal)
  const logoSrc = isDark ? '/ofis-logo-dark.svg' : '/ofis-logo.svg';

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {shouldBreathe && (
        <div className="absolute -inset-1 bg-gradient-to-r from-[#006B70]/20 via-[#14BEB8]/25 to-[#FFA987]/20 blur-xs rounded-xl animate-pulse pointer-events-none" />
      )}
      <img
        src={logoSrc}
        alt="OFIS"
        className={`${getHeightClass()} w-auto max-w-[240px] sm:max-w-[320px] object-contain transition-all duration-300 hover:scale-[1.015] ${filterStyleClass} ${getBreathingClass()}`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
