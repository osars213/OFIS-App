import React from 'react';
import { FloorPlanSeat } from '../types';
import { Check, ShieldAlert } from 'lucide-react';

interface FloorPlanProps {
  seats: FloorPlanSeat[];
  selectedSeatId?: string;
  onSelectSeat: (seat: FloorPlanSeat) => void;
  formatPrice: (amount: number) => string;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({
  seats,
  selectedSeatId,
  onSelectSeat,
  formatPrice,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] uppercase tracking-wider font-mono">
          Interactive Floor Layout &amp; Seat Picker
        </h4>
        <div className="flex items-center space-x-3 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span>Occupied</span>
          </div>
        </div>
      </div>

      <div className="relative aspect-[16/9] w-full bg-[#F8FAFC] dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden p-4">
        {/* Visual Zones */}
        <div className="absolute top-2 left-2 text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">Zone A: Quiet Focus Bay</div>
        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">Zone B: Acoustic Pods</div>

        {/* Seat Nodes */}
        {seats.map((seat) => {
          const isSelected = selectedSeatId === seat.id;
          const isAvailable = seat.status === 'available';

          return (
            <button
              key={seat.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectSeat(seat)}
              style={{
                top: `${seat.y}%`,
                left: `${seat.x}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0F766E] text-white border-[#0F766E] scale-110 shadow-lg z-20 font-bold'
                  : isAvailable
                  ? 'bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] border-[#E5E7EB] dark:border-[#374151] hover:border-[#0F766E] hover:scale-105 z-10 shadow-2xs'
                  : 'bg-gray-100 dark:bg-gray-800/60 text-[#9CA3AF] dark:text-gray-500 border-transparent cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center space-x-1">
                <span>{seat.label}</span>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
