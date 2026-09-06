import React, { useEffect, useState } from 'react';
import { OFISWordmark } from './OFISWordmark';

interface AppSplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onComplete,
  minDuration = 1800,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusMessage, setStatusMessage] = useState('Opening secure workspace network...');

  useEffect(() => {
    // Smooth progress simulation
    const pInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(pInterval);
          return 95;
        }
        const delta = Math.floor(Math.random() * 20) + 10;
        return Math.min(prev + delta, 95);
      });
    }, 280);

    const msgTimer1 = setTimeout(() => {
      setStatusMessage('Locating verified workspaces across Nigeria...');
    }, 600);

    const msgTimer2 = setTimeout(() => {
      setStatusMessage('Calibrating instant access & booking engines...');
    }, 1100);

    const completeTimer = setTimeout(() => {
      setProgress(100);
      setStatusMessage('Welcome to OFIS');
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 500); // 500ms fade transition
    }, minDuration);

    return () => {
      clearInterval(pInterval);
      clearTimeout(msgTimer1);
      clearTimeout(msgTimer2);
      clearTimeout(completeTimer);
    };
  }, [minDuration, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F17] text-[#111827] dark:text-[#F9FAFB] transition-all duration-500 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 filter blur-xs' : 'opacity-100'
      }`}
    >
      {/* Background Architectural Ambient Radial Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-lime-400/10 dark:bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Revolving Arcs */}
      <div className="absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] rounded-full border border-emerald-500/15 dark:border-emerald-500/25 animate-[ofis-spin-slow_24s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full border border-dashed border-lime-500/20 dark:border-lime-500/30 animate-[ofis-spin-reverse_30s_linear_infinite] pointer-events-none" />

      {/* Main Logo & Breathing Centerpiece */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-md w-full">
        {/* Breathing Logo Icon Emblem with Light Rays */}
        <div className="relative mb-6">
          {/* Breathing Glow Halo */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-emerald-500/30 to-lime-400/30 blur-xl animate-pulse" />
          
          <div className="relative p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 dark:border-emerald-500/30 shadow-2xl animate-bounce-subtle">
            <OFISWordmark 
              variant="mark-only" 
              size="hero" 
              isBreathing={true}
              breathingSpeed="medium"
            />
          </div>
        </div>

        {/* Master Brand Wordmark */}
        <div className="mb-4">
          <OFISWordmark 
            variant="compact" 
            size="lg" 
            isBreathing={true}
            breathingSpeed="slow"
          />
        </div>

        {/* Tagline */}
        <div className="flex flex-col items-center text-center space-y-0.5 mb-8">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.22em] text-slate-800 dark:text-slate-200">
            FIND THE RIGHT SPACE.
          </span>
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] text-emerald-600 dark:text-lime-400">
            BOOK IT WHEN YOU NEED IT.
          </span>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full max-w-xs space-y-2.5">
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-emerald-500/20">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-lime-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(74,222,128,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1">
            <span className="truncate pr-2">{statusMessage}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Assurance */}
      <div className="absolute bottom-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
        Physical Workspaces, Studios & Offices Across Nigeria
      </div>
    </div>
  );
};
