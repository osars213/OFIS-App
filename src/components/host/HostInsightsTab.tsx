import React from 'react';
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Percent, 
  Zap, 
  Wifi, 
  Star, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Award,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Space } from '../../types';
import { useApp } from '../../context/AppContext';

interface HostInsightsTabProps {
  hostSpaces: Space[];
}

export const HostInsightsTab: React.FC<HostInsightsTabProps> = ({ hostSpaces }) => {
  const { allSpaces } = useApp();

  const hourlyBookingDistribution = [
    { hour: '08:00', percent: 35 },
    { hour: '09:00', percent: 68 },
    { hour: '10:00', percent: 92 },
    { hour: '11:00', percent: 96 },
    { hour: '12:00', percent: 84 },
    { hour: '13:00', percent: 76 },
    { hour: '14:00', percent: 90 },
    { hour: '15:00', percent: 88 },
    { hour: '16:00', percent: 70 },
    { hour: '17:00', percent: 52 },
    { hour: '18:00', percent: 38 },
  ];

  const topDemandedAmenities = [
    { name: 'Starlink / Fiber Internet (500Mbps+)', demandScore: 98, isEquipped: true },
    { name: '24/7 Power (Dual Auto Genset)', demandScore: 96, isEquipped: true },
    { name: 'Ergonomic Desk & Herman Miller Chair', demandScore: 89, isEquipped: true },
    { name: 'Private Soundproof Podcast Studio', demandScore: 82, isEquipped: true },
    { name: 'Dedicated Boardroom Video Conferencing', demandScore: 78, isEquipped: true },
    { name: 'Specialty Espresso & Cafeteria Bar', demandScore: 72, isEquipped: true },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">Hub Performance & Booking Analytics</h2>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          Insights into visitor discovery, peak occupancy hours, top amenities, and verified guest satisfaction
        </p>
      </div>

      {/* High-Level Conversion & Discovery Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Total Impressions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span>Monthly Views</span>
            <Eye className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827] dark:text-[#F9FAFB]">12,480</div>
          <p className="text-[10px] text-[#0F766E] dark:text-[#14B8A6] font-bold">+38% vs last month</p>
        </div>

        {/* Unique Visitors */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span>Unique Searchers</span>
            <Users className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827] dark:text-[#F9FAFB]">3,820</div>
          <p className="text-[10px] text-[#0F766E] dark:text-[#14B8A6] font-bold">+24% new professionals</p>
        </div>

        {/* Booking Conversion Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span>Conversion Rate</span>
            <Percent className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F766E] dark:text-[#14B8A6] font-mono">14.8%</div>
          <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Top 5% among Lagos Hubs</p>
        </div>

        {/* Average Guest Rating */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span>Satisfaction</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827] dark:text-[#F9FAFB] font-mono">4.96 ★</div>
          <p className="text-[10px] text-[#0F766E] dark:text-[#14B8A6] font-bold">142 verified reviews</p>
        </div>

      </div>

      {/* Middle Grid: Peak Hours Chart & Amenity Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Peak Hourly Occupancy Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">Peak Hourly Demand Distribution</h3>
            </div>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Peak: 10:00 - 15:00</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-1.5 pt-4">
            {hourlyBookingDistribution.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[9px] font-mono text-[#6B7280] dark:text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.percent}%
                </span>
                <div 
                  className={`w-full rounded-t-lg transition-all ${
                    item.percent >= 90
                      ? 'bg-[#0F766E] dark:bg-[#14B8A6]'
                      : item.percent >= 70
                      ? 'bg-[#0F766E]/70 dark:bg-[#14B8A6]/70'
                      : 'bg-[#F1F5F9] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151]'
                  }`}
                  style={{ height: `${item.percent}%` }}
                />
                <span className="text-[9px] text-[#6B7280] dark:text-[#9CA3AF] truncate">{item.hour}</span>
              </div>
            ))}
          </div>
          
          <div className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] flex items-center justify-between pt-2 border-t border-[#E5E7EB] dark:border-[#374151]">
            <span>Peak capacity utilization: 10:00 - 15:00</span>
            <span className="text-[#0F766E] dark:text-[#14B8A6] font-bold">96% Utilization</span>
          </div>
        </div>

        {/* Most Demanded Amenities */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">Most Demanded Amenities</h3>
            </div>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Based on search queries</span>
          </div>

          <div className="space-y-3">
            {topDemandedAmenities.map((amenity, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-1.5 text-[#111827] dark:text-[#F9FAFB]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                    <span className="truncate max-w-[240px]">{amenity.name}</span>
                  </div>
                  <span className="font-mono text-[#0F766E] dark:text-[#14B8A6] font-bold">{amenity.demandScore}%</span>
                </div>
                <div className="w-full bg-[#F1F5F9] dark:bg-[#111827] h-1.5 rounded-full overflow-hidden border border-[#E5E7EB]/50 dark:border-transparent">
                  <div className="bg-[#0F766E] dark:bg-[#14B8A6] h-full rounded-full" style={{ width: `${amenity.demandScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Guest Ratings Breakdown Scorecard */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            <h3 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">Verified Guest Feedback Scorecard</h3>
          </div>
          <span className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-bold">100% Verified Reservations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-center space-y-1">
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Power Reliability</div>
            <div className="text-xl font-bold font-mono text-[#0F766E] dark:text-[#14B8A6]">4.98 ★</div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Zero blackout downtime</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-center space-y-1">
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Internet Speed</div>
            <div className="text-xl font-bold font-mono text-[#0F766E] dark:text-[#14B8A6]">4.95 ★</div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Avg: 480 Mbps download</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-center space-y-1">
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Noise / Quiet Zones</div>
            <div className="text-xl font-bold font-mono text-[#0F766E] dark:text-[#14B8A6]">4.88 ★</div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Acoustics rating</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-center space-y-1">
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Staff & Hospitality</div>
            <div className="text-xl font-bold font-mono text-[#0F766E] dark:text-[#14B8A6]">4.96 ★</div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Fast concierge check-in</p>
          </div>
        </div>
      </div>

    </div>
  );
};
