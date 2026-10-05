import React from 'react';
import { 
  Star, 
  MapPin, 
  Users, 
  Wifi, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Volume2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Space } from '../../types';

interface QuickFactsBarProps {
  space: Space;
  formatTime: (timeStr?: string | null) => string;
  onReviewsClick?: () => void;
  onMapClick?: () => void;
}

export const QuickFactsBar: React.FC<QuickFactsBarProps> = ({
  space,
  formatTime,
  onReviewsClick,
  onMapClick,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-1.5 scrollbar-none">
      <div className="flex items-center space-x-2.5 min-w-max">
        
        {/* 1. Rating Pill */}
        <button
          type="button"
          onClick={onReviewsClick}
          className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/50 transition-colors group cursor-pointer shadow-2xs"
        >
          <div className="p-1.5 rounded-xl bg-[#FFA987]/20 text-[#FFA987]">
            <Star className="w-4 h-4 fill-[#FFA987] text-[#FFA987]" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-[#12383B] dark:text-white font-mono">{space.rating}</span>
              <span className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">({space.reviewsCount})</span>
            </div>
            <div className="text-[10px] text-[#006B70] dark:text-[#28D2CB] font-medium group-hover:underline">
              Verified Reviews
            </div>
          </div>
        </button>

        {/* 2. Location & Distance */}
        <button
          type="button"
          onClick={onMapClick}
          className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/50 transition-colors group cursor-pointer shadow-2xs"
        >
          <div className="p-1.5 rounded-xl bg-[#FFA987]/15 text-[#FFA987]">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[#12383B] dark:text-white truncate max-w-[130px]">
              {space.neighborhood}
            </div>
            <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">
              {space.city} • <span className="text-[#006B70] dark:text-[#FFA987]">View Map</span>
            </div>
          </div>
        </button>

        {/* 3. Internet Speed & Tier */}
        <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-2xs">
          <div className="p-1.5 rounded-xl bg-[#FFA987]/15 text-[#FFA987]">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#12383B] dark:text-white font-mono">
              {space.internetSpeedMbps} Mbps
            </div>
            <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] truncate max-w-[120px]">
              {space.internetIsp || 'Dedicated Fiber'}
            </div>
          </div>
        </div>

        {/* 4. Power Guarantee & Type */}
        <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-2xs">
          <div className="p-1.5 rounded-xl bg-[#FFA987]/15 text-[#FFA987]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#006B70] dark:text-[#28D2CB] font-mono">
              {space.powerUptimeGuaranteePercent}% Uptime
            </div>
            <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] truncate max-w-[130px]">
              {space.powerType || 'Dual Generator + Solar'}
            </div>
          </div>
        </div>

        {/* 5. Capacity */}
        <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-2xs">
          <div className="p-1.5 rounded-xl bg-[#FFA987]/15 text-[#FFA987]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#12383B] dark:text-white">
              {space.capacity} Capacity
            </div>
            <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">
              Seats & Suites
            </div>
          </div>
        </div>

        {/* 6. Operating Hours */}
        <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-2xs">
          <div className="p-1.5 rounded-xl bg-[#FFA987]/15 text-[#FFA987]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#12383B] dark:text-white font-mono">
              {formatTime(space.operatingHours.open)} - {formatTime(space.operatingHours.close)}
            </div>
            <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">
              {space.operatingHours.days}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
