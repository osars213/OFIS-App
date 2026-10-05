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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07383D] text-[#F8FAFC] transition-all duration-500 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 filter blur-xs' : 'opacity-100'
      }`}
    >
      {/* Background Architectural Ambient Radial Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#0F766E]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#14B8A6]/8 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Revolving Arcs */}
      <div className="absolute w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full border border-[#0F766E]/20 animate-[ofis-spin-slow_28s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full border border-dashed border-[#F4A261]/20 animate-[ofis-spin-reverse_36s_linear_infinite] pointer-events-none" />

      {/* Main Logo & Breathing Centerpiece */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-md w-full">
        {/* Breathing Logo Icon Emblem with Light Rays */}
        <div className="relative mb-5">
          <div className="absolute -inset-3 rounded-2xl bg-[#0F766E]/20 blur-lg" />
          
          <div className="relative p-3.5 rounded-2xl bg-[#1F2937]/90 border border-[#374151] shadow-2xl">
            <OFISWordmark 
              variant="mark-only" 
              size="hero" 
              theme="dark"
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
            theme="dark"
            isBreathing={true}
            breathingSpeed="slow"
          />
        </div>

        {/* Tagline */}
        <div className="flex flex-col items-center text-center space-y-1 mb-7">
          <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.24em] text-[#14BEB8]">
            <span>WORK</span>
            <span className="text-[#FFA987]">•</span>
            <span>MEET</span>
            <span className="text-[#FFA987]">•</span>
            <span>CREATE</span>
            <span className="text-[#FFA987]">•</span>
            <span>RECORD</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
            ON-DEMAND WORKSPACES & STUDIOS ACROSS NIGERIA
          </span>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full max-w-xs space-y-2.5">
          <div className="h-1.5 w-full bg-[#1F2937] rounded-full overflow-hidden p-0.5 border border-[#374151]">
            <div 
              className="h-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] px-1">
            <span className="truncate pr-2">{statusMessage}</span>
            <span className="font-bold text-[#14B8A6]">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Assurance */}
      <div className="absolute bottom-6 text-center text-[10px] text-[#64748B] font-medium tracking-wide">
        Work • Meet • Create • Record — On-Demand Workspaces & Studios Across Nigeria
      </div>
    </div>
  );
};
