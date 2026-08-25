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
        <h4 className="text-xs font-bold text-[#F2F2F2] uppercase tracking-wider font-mono">
          Interactive Floor Layout & Seat Picker
        </h4>
        <div className="flex items-center space-x-3 text-[11px] text-[#718079]">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C878]" />
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#232D28]" />
            <span>Occupied</span>
          </div>
        </div>
      </div>

      <div className="relative aspect-[16/9] w-full bg-[#18201B] rounded-2xl border border-[#232D28] overflow-hidden p-4">
        {/* Visual Zones */}
        <div className="absolute top-2 left-2 text-[10px] font-mono text-[#718079]">Zone A: Quiet Focus Bay</div>
        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-[#718079]">Zone B: Acoustic Pods</div>

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
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                isSelected
                  ? 'bg-[#00C878] text-[#0D0D0D] border-[#00C878] scale-110 shadow-lg z-20 font-bold'
                  : isAvailable
                  ? 'bg-[#141816] text-[#F2F2F2] border-[#232D28] hover:border-[#00C878] hover:scale-105 z-10'
                  : 'bg-[#0D0D0D]/60 text-[#718079] border-transparent cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center space-x-1">
                <span>{seat.label}</span>
                {isSelected && <Check className="w-3 h-3 text-[#0D0D0D]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
