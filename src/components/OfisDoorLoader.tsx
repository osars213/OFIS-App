import React from 'react';
import { motion } from 'motion/react';

interface OfisDoorLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * Compact OFIS Micro-Animation: Door-shaped O → subtle green light → brief door opening
 * Ideal for search loading, filter changes, page transitions, and card loading states (0.7-1.2s).
 */
export const OfisDoorLoader: React.FC<OfisDoorLoaderProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const dimensions = {
    sm: { width: 'w-7 h-10', border: 'border-2', glow: 'w-16 h-4', text: 'text-[11px]' },
    md: { width: 'w-10 h-15', border: 'border-[2.5px]', glow: 'w-24 h-6', text: 'text-xs' },
    lg: { width: 'w-14 h-20', border: 'border-3', glow: 'w-32 h-8', text: 'text-sm' },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center py-6 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Floor glow spill */}
        <motion.div
          animate={{
            opacity: [0.3, 0.85, 0.4],
            scaleX: [0.8, 1.3, 0.9],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute -bottom-3 ${dimensions.glow} bg-[#00C878]/40 blur-md rounded-full pointer-events-none`}
        />

        {/* Door-shaped O */}
        <div
          className={`relative ${dimensions.width} rounded-t-full ${dimensions.border} border-[#00C878] bg-[#0A0A0A] shadow-[0_0_18px_rgba(0,200,120,0.35)] flex items-center justify-center overflow-hidden`}
        >
          {/* Inner Light Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#00C878]/30 via-[#00C878]/10 to-[#00C878]/40" />

          {/* Animated 3D Door Leaf */}
          <motion.div
            animate={{
              rotateY: [0, -65, 0],
              opacity: [1, 0.85, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: [0.25, 1, 0.5, 1],
            }}
            style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
            className="absolute inset-0.5 rounded-t-full bg-[#161616] border border-[#00C878]/50 flex items-center justify-end pr-0.5"
          >
            <div className="w-1 h-1 rounded-full bg-[#00C878]" />
          </motion.div>
        </div>
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className={`mt-3 font-medium text-stone-300 ${dimensions.text} tracking-wide`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};
