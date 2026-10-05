import React from 'react';
import { Space, NextAvailableSlot } from '../../types';
import { Clock, ChevronRight, MessageSquare, Navigation, Zap, ShieldCheck } from 'lucide-react';
import { getSpacePricing, formatSpaceRate } from '../../utils/pricing';

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
  const pricing = getSpacePricing(space);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#07383D]/95 backdrop-blur-xl border-t border-[#E2ECEB] dark:border-[#166D74] py-3.5 px-4 sm:px-8 shadow-lg dark:shadow-2xl transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Price & Selected Slot Indicator */}
        <div className="flex items-center space-x-4 min-w-0">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-[#006B70] dark:text-[#28D2CB] font-mono tracking-tight reflective-price">
                {formatPrice(pricing.rate)}
              </span>
              <span className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">/ {pricing.period}</span>
              {pricing.basis === 'person' && (
                <span className="text-[10px] text-[#006B70] dark:text-[#28D2CB] font-mono bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 px-1.5 py-0.5 rounded border border-[#14BEB8]/30">
                  per seat
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">
              {space.pricePerDay && pricing.period === 'hour' && (
                <>
                  <span className="hidden sm:inline font-mono">
                    Full Day: {formatPrice(space.pricePerDay)}
                  </span>
                  <span className="hidden sm:inline text-[#9CA3AF] dark:text-[#94A3B8]">•</span>
                </>
              )}
              
              {/* Selected Slot / Live Status */}
              <div className="flex items-center space-x-1 font-medium text-[#12383B] dark:text-white">
                {selectedDate && selectedTime ? (
                  <>
                    <Clock className="w-3 h-3 text-[#FFA987]" />
                    <span className="text-[#006B70] dark:text-[#28D2CB] font-bold">{selectedDate} @ {selectedTime}</span>
                  </>
                ) : isAvailableNow ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFA987] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFA987]" />
                    </span>
                    <span className="text-[#006B70] dark:text-[#28D2CB] font-bold">Instant Pass Available</span>
                  </>
                ) : nextSlot ? (
                  <>
                    <Clock className="w-3 h-3 text-[#FFA987]" />
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
              className="p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-[#28D2CB] transition-colors active:scale-95 hidden sm:flex items-center justify-center cursor-pointer shadow-2xs"
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
              className="p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-[#28D2CB] transition-colors active:scale-95 hidden sm:flex items-center justify-center cursor-pointer shadow-2xs"
              title="Directions"
              aria-label="Get Directions"
            >
              <Navigation className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onBookNow}
            className="px-5 sm:px-8 py-3.5 rounded-2xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center space-x-2 cursor-pointer"
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
