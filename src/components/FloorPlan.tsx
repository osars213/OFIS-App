import React from 'react';
import { SpaceSeat } from '../types';
import { Check, User, Lock } from 'lucide-react';

interface FloorPlanProps {
  seats: SpaceSeat[];
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
}) => {
  return (
    <div className="bg-[#141816] rounded-2xl border border-[#232D28] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-[#F2F2F2]">Interactive Floor Plan</h4>
          <p className="text-xs text-[#9EABA3]">Pick your exact window desk or sound booth</p>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-[#1A231E] border border-[#00C878]" />
            <span className="text-[#9EABA3]">Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-[#00C878]" />
            <span className="text-[#00C878] font-bold">Selected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-[#232D28] opacity-50" />
            <span className="text-[#718079]">Occupied</span>
          </div>
        </div>
      </div>

      {/* Visual Floor Canvas */}
      <div className="relative w-full aspect-[16/9] bg-[#0E1210] rounded-xl border border-[#1E2522] p-4 overflow-hidden flex items-center justify-center">
        {/* Ambient Room layout hints */}
        <div className="absolute top-2 left-4 text-[10px] uppercase font-mono tracking-widest text-[#35433C]">
          Window Zone (Natural Light)
        </div>
        <div className="absolute bottom-2 right-4 text-[10px] uppercase font-mono tracking-widest text-[#35433C]">
          Acoustic Phone Booths
        </div>

        {/* Seats container */}
        <div className="w-full h-full relative">
          {seats.map((seat) => {
            const isSelected = selectedSeatIds.includes(seat.id);
            const isOccupied = seat.status === 'occupied' || seat.status === 'reserved';

            return (
              <button
                key={seat.id}
                type="button"
                disabled={isOccupied}
                onClick={() => onToggleSeat(seat.id)}
                style={{
                  left: `${seat.x}%`,
                  top: `${seat.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute p-2 rounded-xl text-xs flex flex-col items-center justify-center transition-all duration-150 ${
                  isOccupied
                    ? 'bg-[#181F1B] border border-[#232D28] text-[#718079] cursor-not-allowed opacity-50'
                    : isSelected
                    ? 'bg-[#00C878] text-[#0D0D0D] font-bold ring-4 ring-[#00C878]/30 shadow-lg scale-110 z-10'
                    : 'bg-[#161D19] border border-[#232D28] hover:border-[#00C878] text-[#F2F2F2] hover:scale-105'
                }`}
                title={`${seat.label} - ₦${seat.pricePerHour.toLocaleString()}/hr`}
              >
                {isOccupied ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : isSelected ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#00C878]" />
                )}
                <span className="text-[10px] mt-0.5 whitespace-nowrap">{seat.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
