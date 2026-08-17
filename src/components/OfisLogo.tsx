import React from 'react';

interface OfisLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  lightMode?: boolean;
  iconOnly?: boolean;
  useImage?: boolean;
}

/**
 * Official OFIS Brand Identity Logo Component
 * Locked to official Google Drive Asset (1I7UzJitqCPYwzVzFCjF8f25_XY6julYs)
 */
export const OfisLogo: React.FC<OfisLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  lightMode = false,
  iconOnly = false,
  useImage = true,
}) => {
  const [imageError, setImageError] = React.useState(false);

  // Height & scale mappings for different container sizes
  const scaleMap = {
    xs: { h: 'h-6', imgH: 'h-6', iconW: 20, iconH: 24, fontSize: 'text-sm', subSize: 'text-[7px]', gap: 'gap-1.5' },
    sm: { h: 'h-8', imgH: 'h-8', iconW: 24, iconH: 28, fontSize: 'text-lg', subSize: 'text-[8px]', gap: 'gap-2' },
    md: { h: 'h-10', imgH: 'h-10', iconW: 30, iconH: 36, fontSize: 'text-2xl', subSize: 'text-[9px]', gap: 'gap-2.5' },
    lg: { h: 'h-12', imgH: 'h-12', iconW: 38, iconH: 44, fontSize: 'text-3xl', subSize: 'text-[10px]', gap: 'gap-3' },
    xl: { h: 'h-16', imgH: 'h-16', iconW: 50, iconH: 58, fontSize: 'text-4xl', subSize: 'text-xs', gap: 'gap-3.5' },
  };

  const currentScale = scaleMap[size] || scaleMap.md;
  const textColor = lightMode ? 'text-neutral-900' : 'text-white';
  const tagColor = '#00C878';

  // If using direct official image asset
  if (useImage && !imageError && !iconOnly) {
    return (
      <div className={`inline-flex items-center select-none shrink-0 ${className}`} aria-label="OFIS Physical Spaces">
        <img
          src="/ofis-logo.png"
          alt="OFIS • Physical Spaces"
          className={`${currentScale.imgH} w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,200,120,0.25)] transition-transform hover:scale-[1.02]`}
          onError={() => setImageError(true)}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none shrink-0 ${currentScale.gap} ${className}`}
      aria-label="OFIS Physical Spaces"
    >
      {/* Signature Arched Doorway Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={currentScale.iconW}
          height={currentScale.iconH}
          viewBox="0 0 36 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_12px_rgba(0,200,120,0.35)] transition-transform hover:scale-105"
        >
          <defs>
            <linearGradient id={`ofisGreenGrad-${size}`} x1="0" y1="0" x2="36" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E58B" />
              <stop offset="100%" stopColor="#00C878" />
            </linearGradient>
            <linearGradient id={`ofisInnerGlow-${size}`} x1="18" y1="4" x2="18" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00C878" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#00C878" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Floor Reflection glow */}
          <ellipse cx="18" cy="41" rx="14" ry="2.5" fill="#00C878" fillOpacity="0.6" />

          {/* Main Arched Door Frame */}
          <path
            d="M3 40V16C3 7.71573 9.71573 1 18 1C26.2843 1 33 7.71573 33 16V40H3Z"
            fill={lightMode ? '#FFFFFF' : '#0A0A0A'}
            stroke={`url(#ofisGreenGrad-${size})`}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Inner Room Glow */}
          <path
            d="M6.5 39V16.5C6.5 10.1487 11.6487 5 18 5C24.3513 5 29.5 10.1487 29.5 16.5V39H6.5Z"
            fill={`url(#ofisInnerGlow-${size})`}
          />

          {/* Door panel ajar / open perspective slice */}
          <path
            d="M6 39V17C6 10.3726 11.3726 5 18 5C20.5 5 22.8 5.8 24.5 7.2L12 12.5V39H6Z"
            fill={lightMode ? '#F0FDF4' : '#141414'}
            stroke="#00C878"
            strokeWidth="1.2"
            strokeOpacity="0.75"
          />

          {/* Door handle / luminous keypoint */}
          <circle cx="21" cy="25" r="2" fill="#00C878" />
          <circle cx="21" cy="25" r="3.5" stroke="#00C878" strokeWidth="0.8" strokeOpacity="0.6" />
        </svg>
      </div>

      {/* Typography: "OFIS" + "PHYSICAL SPACES" */}
      {!iconOnly && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-wider ${textColor} ${currentScale.fontSize}`}
              style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
            >
              OFIS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C878] shadow-[0_0_8px_#00C878]" />
          </div>

          {showTagline && (
            <span
              className={`font-extrabold tracking-[0.22em] uppercase ${currentScale.subSize} -mt-0.5`}
              style={{
                color: tagColor,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >
              Physical Spaces
            </span>
          )}
        </div>
      )}
    </div>
  );
};
