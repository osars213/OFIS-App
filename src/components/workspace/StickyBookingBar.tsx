import React from 'react';
import { Space, NextAvailableSlot } from '../../types';
import { Clock, ChevronRight, MessageSquare, Navigation, Zap, ShieldCheck } from 'lucide-react';

interface StickyBookingBarProps {
  space: Space;
  formatPrice: (amountNgn?: number | null, options?: { perHour?: boolean; perDay?: boolean }) => string;
  selectedDate?: string;
  selectedTime?: string;
  nextSlot?: NextAvailableSlot;
  isAvailableNow: boolean;
  onBookNow: () => void;
  onContactHost?: () => void;
  onDirections?: () => void;
}

export const StickyBookingBar: React.FC<StickyBookingBarProps> = ({
  space,
  formatPrice,
  selectedDate,
  selectedTime,
  nextSlot,
  isAvailableNow,
  onBookNow,
  onContactHost,
  onDirections,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-[#1E2522] py-3.5 px-4 sm:px-8 shadow-2xl transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Price & Selected Slot Indicator */}
        <div className="flex items-center space-x-4 min-w-0">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-[#00C878] font-mono tracking-tight">
                {formatPrice(space.pricePerHour)}
              </span>
              <span className="text-xs text-[#718079]">/ hour</span>
            </div>
            
            <div className="flex items-center space-x-2 text-[11px] text-[#9EABA3]">
              <span className="hidden sm:inline font-mono">
                Full Day: {formatPrice(space.pricePerDay || space.pricePerHour * 8)}
              </span>
              <span className="hidden sm:inline text-[#718079]">•</span>
              
              {/* Selected Slot / Live Status */}
              <div className="flex items-center space-x-1 font-medium text-[#F2F2F2]">
                {selectedDate && selectedTime ? (
                  <>
                    <Clock className="w-3 h-3 text-[#00C878]" />
                    <span className="text-[#00C878] font-bold">{selectedDate} @ {selectedTime}</span>
                  </>
                ) : isAvailableNow ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C878] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C878]" />
                    </span>
                    <span className="text-[#00C878] font-bold">Instant Pass Available</span>
                  </>
                ) : nextSlot ? (
                  <>
                    <Clock className="w-3 h-3 text-[#00C878]" />
                    <span>Next: {nextSlot.label}</span>
                  </>
                ) : (
                  <span>Instant Confirmation</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {onContactHost && (
            <button
              type="button"
              onClick={onContactHost}
              className="p-3 rounded-2xl bg-[#141816] hover:bg-[#18201B] border border-[#232D28] text-[#9EABA3] hover:text-[#00C878] transition-colors active:scale-95 hidden sm:flex items-center justify-center"
              title="Message Host"
              aria-label="Message Host"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          {onDirections && (
            <button
              type="button"
              onClick={onDirections}
              className="p-3 rounded-2xl bg-[#141816] hover:bg-[#18201B] border border-[#232D28] text-[#9EABA3] hover:text-[#00C878] transition-colors active:scale-95 hidden sm:flex items-center justify-center"
              title="Directions"
              aria-label="Get Directions"
            >
              <Navigation className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onBookNow}
            className="px-5 sm:px-8 py-3.5 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 flex items-center space-x-2 cursor-pointer"
          >
            <span>
              {selectedDate && selectedTime ? `Book Slot (${selectedTime})` : 'Book Instant Pass'}
            </span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

      </div>
    </div>
  );
};
