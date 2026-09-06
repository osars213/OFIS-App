import React, { useEffect, useRef } from 'react';
import { Clock, X, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { convertTimeTo12Hour } from '../utils/timeFormat';

export interface VerticalTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

// Generate intervals every 30 minutes
export const TIME_INTERVALS: { id: string; label24: string; periodNote?: string }[] = [
  { id: 'any', label24: 'Any Time' },
  ...Array.from({ length: 48 }, (_, i) => {
    const totalMinutes = i * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedHour = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const timeStr = `${formattedHour}:${formattedMinutes}`;
    
    let periodNote = 'Early Morning';
    if (hours >= 8 && hours < 12) periodNote = 'Morning Work Sprint';
    else if (hours >= 12 && hours < 14) periodNote = 'Midday Peak';
    else if (hours >= 14 && hours < 18) periodNote = 'Afternoon Focus';
    else if (hours >= 18 && hours < 22) periodNote = 'Evening Session';
    else if (hours >= 22 || hours < 6) periodNote = 'Overnight / 24-7 Hub';

    return {
      id: timeStr,
      label24: timeStr,
      periodNote
    };
  })
];

export const VerticalTimePicker: React.FC<VerticalTimePickerProps> = ({
  isOpen,
  onClose,
  selectedTime,
  onSelectTime,
}) => {
  const { timeFormat, setTimeFormat, formatTime } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to selected time when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (activeItemRef.current && scrollContainerRef.current) {
          activeItemRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedTime]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          id="vertical-time-picker-modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.2, 0.0, 0, 1.0] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#111827]">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] dark:bg-[#16A34A]/20 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">Select Start Time</h3>
                <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-mono">30-minute intervals</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Format Toggle Pill */}
              <div className="flex items-center bg-[#F1F5F9] dark:bg-[#111827] p-0.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151]">
                <button
                  type="button"
                  id="picker-time-format-12h"
                  onClick={() => setTimeFormat('12h')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    timeFormat === '12h'
                      ? 'bg-[#16A34A] text-white shadow-2xs'
                      : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
                  }`}
                >
                  12h
                </button>
                <button
                  type="button"
                  id="picker-time-format-24h"
                  onClick={() => setTimeFormat('24h')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    timeFormat === '24h'
                      ? 'bg-[#16A34A] text-white shadow-2xs'
                      : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
                  }`}
                >
                  24h
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors cursor-pointer"
                aria-label="Close time picker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Selection Badge Banner */}
          <div className="px-5 py-2.5 bg-[#F8FAFC] dark:bg-[#111827] border-b border-[#E5E7EB] dark:border-[#374151] flex items-center justify-between">
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium">Currently Selected:</span>
            <span className="text-xs font-mono font-bold text-[#16A34A] bg-[#DCFCE7] dark:bg-[#16A34A]/20 px-2.5 py-0.5 rounded-lg border border-[#16A34A]/30">
              {formatTime(selectedTime)}
            </span>
          </div>

          {/* Vertical Scroll Wheel / Snap List */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 scroll-smooth snap-y snap-mandatory overscroll-contain"
            style={{ maxHeight: '340px' }}
          >
            {TIME_INTERVALS.map((item) => {
              const isSelected = selectedTime === item.id;
              const displayLabel = item.id === 'any' ? 'Any Time' : formatTime(item.id);

              return (
                <button
                  key={item.id}
                  ref={isSelected ? activeItemRef : null}
                  type="button"
                  onClick={() => {
                    onSelectTime(item.id);
                    onClose();
                  }}
                  className={`w-full snap-center flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#16A34A] text-white font-bold shadow-md scale-[1.01]'
                      : 'bg-white dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#374151] text-[#111827] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-base font-mono font-bold tracking-wide ${isSelected ? 'text-white' : 'text-[#111827] dark:text-[#F9FAFB]'}`}>
                      {displayLabel}
                    </span>
                    {item.periodNote && (
                      <span className={`text-[10px] uppercase font-mono tracking-wider ${isSelected ? 'text-white/80 font-semibold' : 'text-[#6B7280] dark:text-[#9CA3AF]'}`}>
                        {item.periodNote}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-white text-[#16A34A] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#9CA3AF] opacity-50" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer with Quick Preset & Done */}
          <div className="p-4 border-t border-[#E5E7EB] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#111827] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onSelectTime('any');
                onClose();
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors cursor-pointer"
            >
              Reset to Any Time
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Done</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
