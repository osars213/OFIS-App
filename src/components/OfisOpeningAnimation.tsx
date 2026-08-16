import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OfisOpeningAnimationProps {
  onComplete: () => void;
  onSkip?: () => void;
}

/**
 * OFIS Official Cinematic Startup Animation
 * Strictly operates on the official locked logo asset (/ofis-logo.png).
 *
 * Sequence:
 * Stage 1 (0.0 - 0.6s): Near-black screen. The exact door-shaped O from the official logo appears in the centre.
 * Stage 2 (0.6 - 1.2s): Soft green light emerges underneath the door (light spilling from inside a room).
 * Stage 3 (1.2 - 1.8s): The door opens; radiant green light spills forward across the floor.
 * Stage 4 (1.8 - 2.4s): Remaining F + location-pin I + S appear smoothly from the light and settle into exact logo position.
 * Stage 5 (2.4 - 3.0s): Complete official OFIS logo remains crisp and visible briefly.
 * Transition (3.1s): Smooth fade-out into the physical space explorer.
 */
export const OfisOpeningAnimation: React.FC<OfisOpeningAnimationProps> = ({
  onComplete,
  onSkip,
}) => {
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;

  useEffect(() => {
    // Stage 1: Door O appears (0 - 0.6s)
    const t1 = setTimeout(() => setStage(2), 600);

    // Stage 2: Soft light underneath door (0.6 - 1.2s)
    const t2 = setTimeout(() => setStage(3), 1200);

    // Stage 3: Door opens & light expands (1.2 - 1.8s)
    const t3 = setTimeout(() => setStage(4), 1800);

    // Stage 4: F + I + S emerge smoothly from the light (1.8 - 2.4s)
    const t4 = setTimeout(() => setStage(5), 2400);

    // Stage 5: Settle & hold complete logo briefly (2.4 - 3.0s)
    const t5 = setTimeout(() => setStage(6), 3100);

    // Complete transition into application
    const t6 = setTimeout(() => {
      onCompleteRef.current();
    }, 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  const handleDismiss = () => {
    if (onSkipRef.current) {
      onSkipRef.current();
    } else {
      onCompleteRef.current();
    }
  };

  return (
    <motion.div
      id="ofis-startup-cinematic-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === 6 ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className={`fixed inset-0 z-[100] bg-[#070707] flex flex-col items-center justify-center overflow-hidden select-none cursor-default ${
        stage === 6 ? 'pointer-events-none' : ''
      }`}
      onClick={handleDismiss}
    >
      {/* Background Volumetric Room Ambience */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: stage >= 2 ? (stage >= 3 ? 0.9 : 0.5) : 0.15,
        }}
        transition={{ duration: 0.6 }}
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 55%, rgba(0, 200, 120, 0.16) 0%, rgba(0, 200, 120, 0.03) 50%, rgba(7, 7, 7, 0) 80%)',
        }}
      />

      {/* Stage Area */}
      <div className="relative flex flex-col items-center justify-center px-4 w-full max-w-xl">
        
        {/* Soft Floor Reflection & Spilling Light Underneath Door */}
        <motion.div
          animate={{
            opacity: stage === 1 ? 0 : stage === 2 ? 0.55 : stage >= 3 ? 0.95 : 0,
            scaleX: stage === 1 ? 0.2 : stage === 2 ? 0.8 : stage === 3 ? 1.6 : 1.2,
            scaleY: stage >= 3 ? 1.3 : 0.8,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute bottom-6 w-56 sm:w-72 h-14 bg-[#00C878]/45 blur-2xl rounded-full pointer-events-none"
        />

        {/* Forward Beaming Light Cone (Stage 3 & 4) */}
        <motion.div
          animate={{
            opacity: stage === 3 || stage === 4 ? 0.75 : 0,
            scale: stage === 3 || stage === 4 ? 1.2 : 0.8,
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-gradient-to-t from-[#00C878]/25 via-transparent to-transparent blur-xl pointer-events-none"
        />

        {/* Official Logo Container with Precision Masking Transition */}
        <div className="relative flex items-center justify-center h-24 sm:h-32">
          
          {/* STAGE 1, 2, 3: Centered Doorway 'O' Crop of the Official Logo */}
          {stage < 4 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{
                opacity: 1,
                scale: stage === 3 ? 1.04 : 1,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                width: '78px',
                height: '90px',
              }}
            >
              {/* Official Logo aligned to show strictly the Doorway O */}
              <img
                src="/ofis-logo.png"
                alt="OFIS Doorway"
                className="h-20 sm:h-24 w-auto max-w-none object-left object-cover pointer-events-none drop-shadow-[0_0_25px_rgba(0,200,120,0.5)]"
                style={{
                  transform: 'translateX(0px)',
                }}
              />

              {/* Light spill layer when door opens in Stage 3 */}
              {stage === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-[#00C878]/20 mix-blend-screen pointer-events-none"
                />
              )}
            </motion.div>
          ) : (
            /* STAGE 4 & 5: Full Official Logo Reveal (F + I + S emerging smoothly from the light) */
            <motion.div
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative flex items-center justify-center"
            >
              {/* Mask expansion from door to full width */}
              <motion.div
                initial={{ clipPath: 'inset(0 72% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center drop-shadow-[0_0_35px_rgba(0,200,120,0.45)]"
              >
                <img
                  src="/ofis-logo.png"
                  alt="OFIS"
                  className="h-20 sm:h-24 w-auto object-contain pointer-events-none"
                />
              </motion.div>

              {/* Glowing sweep effect across letters */}
              <motion.div
                initial={{ left: '15%', opacity: 1 }}
                animate={{ left: '95%', opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-[#00E58B]/60 to-transparent blur-sm pointer-events-none"
              />
            </motion.div>
          )}
        </div>

        {/* Tagline Fade in Stage 5 */}
        <div className="h-6 mt-4 flex items-center justify-center">
          <AnimatePresence>
            {stage >= 5 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#00C878] uppercase"
              >
                Physical Spaces
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Skip Button */}
      <button
        type="button"
        id="skip-startup-animation-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (onSkip) onSkip();
          else onComplete();
        }}
        className="absolute bottom-6 right-6 px-3 py-1.5 rounded-full border border-[#262626] bg-[#141414]/80 text-[#9A9A9A] hover:text-white hover:border-[#00C878]/50 text-[11px] font-medium transition-all backdrop-blur-md cursor-pointer"
      >
        Skip intro
      </button>
    </motion.div>
  );
};
