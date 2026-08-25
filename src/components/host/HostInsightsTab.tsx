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
        <h2 className="text-xl font-bold text-[#F2F2F2]">Hub Performance & Booking Analytics</h2>
        <p className="text-xs text-[#718079]">
          Insights into visitor discovery, peak occupancy hours, top amenities, and verified guest satisfaction
        </p>
      </div>

      {/* High-Level Conversion & Discovery Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Total Impressions */}
        <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span>Monthly Views</span>
            <Eye className="w-4 h-4 text-[#00C878]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F2F2F2]">12,480</div>
          <p className="text-[10px] text-[#00C878] font-bold">+38% vs last month</p>
        </div>

        {/* Unique Visitors */}
        <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span>Unique Searchers</span>
            <Users className="w-4 h-4 text-[#00C878]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F2F2F2]">3,820</div>
          <p className="text-[10px] text-[#00C878] font-bold">+24% new professionals</p>
        </div>

        {/* Booking Conversion Rate */}
        <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span>Conversion Rate</span>
            <Percent className="w-4 h-4 text-[#00C878]" />
          </div>
          <div className="text-2xl font-extrabold text-[#00C878] font-mono">14.8%</div>
          <p className="text-[10px] text-[#9EABA3]">Top 5% among Lagos Hubs</p>
        </div>

        {/* Average Guest Rating */}
        <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span>Satisfaction</span>
            <Star className="w-4 h-4 fill-[#00C878] text-[#00C878]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F2F2F2] font-mono">4.96 ★</div>
          <p className="text-[10px] text-[#00C878] font-bold">142 verified reviews</p>
        </div>

      </div>

      {/* Middle Grid: Peak Hours Chart & Amenity Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Peak Hourly Occupancy Chart */}
        <div className="p-6 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#00C878]" />
              <h3 className="text-sm font-bold text-[#F2F2F2]">Peak Hourly Demand Distribution</h3>
            </div>
            <span className="text-xs text-[#718079]">Peak: 10:00 - 15:00</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-1.5 pt-4">
            {hourlyBookingDistribution.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[9px] font-mono text-[#718079] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.percent}%
                </span>
                <div 
                  className={`w-full rounded-t-lg transition-all ${
                    item.percent >= 90
                      ? 'bg-[#00C878]'
                      : item.percent >= 70
                      ? 'bg-[#00C878]/70'
                      : 'bg-[#18201B] border border-[#232D28]'
                  }`}
                  style={{ height: `${item.percent}%` }}
                />
                <span className="text-[9px] text-[#718079] truncate">{item.hour}</span>
              </div>
            ))}
          </div>
          
          <div className="text-[11px] text-[#718079] flex items-center justify-between pt-2 border-t border-[#1E2522]">
            <span>Peak capacity utilization: 10:00 - 15:00</span>
            <span className="text-[#00C878] font-bold">96% Utilization</span>
          </div>
        </div>

        {/* Most Demanded Amenities */}
        <div className="p-6 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#00C878]" />
              <h3 className="text-sm font-bold text-[#F2F2F2]">Most Searched Amenities by Guests</h3>
            </div>
            <span className="text-xs text-[#718079]">Based on OFIS Search queries</span>
          </div>

          <div className="space-y-3">
            {topDemandedAmenities.map((amenity, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-1.5 text-[#F2F2F2]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00C878]" />
                    <span className="truncate max-w-[240px]">{amenity.name}</span>
                  </div>
                  <span className="font-mono text-[#00C878] font-bold">{amenity.demandScore}%</span>
                </div>
                <div className="w-full bg-[#18201B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00C878] h-full" style={{ width: `${amenity.demandScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Guest Ratings Breakdown Scorecard */}
      <div className="p-6 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#00C878]" />
            <h3 className="text-sm font-bold text-[#F2F2F2]">Verified Guest Feedback Scorecard</h3>
          </div>
          <span className="text-xs text-[#00C878] font-bold">100% Verified Reservations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] text-center space-y-1">
            <div className="text-xs text-[#718079]">Power Reliability</div>
            <div className="text-xl font-bold font-mono text-[#00C878]">4.98 ★</div>
            <p className="text-[10px] text-[#9EABA3]">Zero blackout downtime</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] text-center space-y-1">
            <div className="text-xs text-[#718079]">Internet Speed</div>
            <div className="text-xl font-bold font-mono text-[#00C878]">4.95 ★</div>
            <p className="text-[10px] text-[#9EABA3]">Avg: 480 Mbps download</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] text-center space-y-1">
            <div className="text-xs text-[#718079]">Noise / Quiet Zones</div>
            <div className="text-xl font-bold font-mono text-[#00C878]">4.88 ★</div>
            <p className="text-[10px] text-[#9EABA3]">Acoustics rating</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] text-center space-y-1">
            <div className="text-xs text-[#718079]">Staff & Hospitality</div>
            <div className="text-xl font-bold font-mono text-[#00C878]">4.96 ★</div>
            <p className="text-[10px] text-[#9EABA3]">Fast concierge check-in</p>
          </div>
        </div>
      </div>

    </div>
  );
};
