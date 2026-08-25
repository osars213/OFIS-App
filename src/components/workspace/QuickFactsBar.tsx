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
          className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-[#141816] border border-[#1E2522] hover:border-[#00C878]/50 transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-[#00C878]/10 text-[#00C878]">
            <Star className="w-4 h-4 fill-[#00C878]" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-[#F2F2F2] font-mono">{space.rating}</span>
              <span className="text-[10px] text-[#718079]">({space.reviewsCount})</span>
            </div>
            <div className="text-[10px] text-[#00C878] font-medium group-hover:underline">
              Verified Reviews
            </div>
          </div>
        </button>

        {/* 2. Location & Distance */}
        <button
          type="button"
          onClick={onMapClick}
          className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-[#141816] border border-[#1E2522] hover:border-[#00C878]/50 transition-colors group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-[#00C878]/10 text-[#00C878]">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[#F2F2F2] truncate max-w-[130px]">
              {space.neighborhood}
            </div>
            <div className="text-[10px] text-[#9EABA3]">
              {space.city} • <span className="text-[#00C878]">View Map</span>
            </div>
          </div>
        </button>

        {/* 3. Internet Speed & Tier */}
        <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-[#141816] border border-[#1E2522]">
          <div className="p-1.5 rounded-xl bg-[#00C878]/10 text-[#00C878]">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F2F2F2] font-mono">
              {space.internetSpeedMbps} Mbps
            </div>
            <div className="text-[10px] text-[#718079] truncate max-w-[120px]">
              {space.internetIsp || 'Dedicated Fiber'}
            </div>
          </div>
        </div>

        {/* 4. Power Guarantee & Type */}
        <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-[#141816] border border-[#1E2522]">
          <div className="p-1.5 rounded-xl bg-[#00C878]/10 text-[#00C878]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#00C878] font-mono">
              {space.powerUptimeGuaranteePercent}% Uptime
            </div>
            <div className="text-[10px] text-[#718079] truncate max-w-[130px]">
              {space.powerType || 'Dual Generator + Solar'}
            </div>
          </div>
        </div>

        {/* 5. Capacity */}
        <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-[#141816] border border-[#1E2522]">
          <div className="p-1.5 rounded-xl bg-[#00C878]/10 text-[#00C878]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F2F2F2]">
              {space.capacity} Capacity
            </div>
            <div className="text-[10px] text-[#718079]">
              Seats & Suites
            </div>
          </div>
        </div>

        {/* 6. Operating Hours */}
        <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl bg-[#141816] border border-[#1E2522]">
          <div className="p-1.5 rounded-xl bg-[#00C878]/10 text-[#00C878]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F2F2F2] font-mono">
              {formatTime(space.operatingHours.open)} - {formatTime(space.operatingHours.close)}
            </div>
            <div className="text-[10px] text-[#718079]">
              {space.operatingHours.days}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
