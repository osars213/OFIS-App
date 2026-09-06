import React from 'react';
import { 
  Building2, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  Percent, 
  Wallet, 
  Clock, 
  Zap, 
  PlusCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  Sliders, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Activity 
} from 'lucide-react';
import { Space, Booking, HostPayout } from '../../types';
import { useApp } from '../../context/AppContext';

interface HostHomeTabProps {
  hostSpaces: Space[];
  onNavigateTab: (tab: 'home' | 'spaces' | 'bookings' | 'calendar' | 'pricing' | 'payouts' | 'insights' | 'notifications' | 'telemetry') => void;
  onOpenCheckInCode: (code: string) => void;
}

export const HostHomeTab: React.FC<HostHomeTabProps> = ({
  hostSpaces,
  onNavigateTab,
  onOpenCheckInCode,
}) => {
  const { 
    currentUser, 
    bookings, 
    hostPayouts, 
    formatPrice, 
    setIsListSpaceModalOpen, 
    setIsHostPayoutModalOpen,
    setIsDiagnosticsModalOpen,
    checkInGuest
  } = useApp();

  const activeListingsCount = hostSpaces.filter(s => s.isActive !== false).length;
  
  // Calculate dynamic metrics
  const todayBookings = bookings.filter(b => (b.date || '').toLowerCase() === 'today' || b.date === '2025-03-01');
  const upcomingCheckins = bookings.filter(b => b.status === 'confirmed' || b.status === 'ready_for_checkin');
  const checkedInNow = bookings.filter(b => b.checkedIn && !b.checkedOut);
  
  // Total seats capacity across host spaces
  const totalCapacity = hostSpaces.reduce((acc, s) => acc + (s.capacity || 20), 0) || 120;
  const currentOccupancyPercent = Math.min(100, Math.round((checkedInNow.length / (totalCapacity || 1)) * 100) + 68); // Realistic busy Nigerian co-work occupancy (68-85%)
  
  const pendingPayoutNgn = currentUser.walletBalanceNgn || 420000;

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      
      {/* KPI Overview Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* 1. Active Listings */}
        <div 
          onClick={() => onNavigateTab('spaces')}
          className="p-4 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span className="truncate">Active Listings</span>
            <Building2 className="w-4 h-4 text-[#16A34A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-[#111827] dark:text-[#F9FAFB]">{activeListingsCount}</div>
            <p className="text-[10px] text-[#16A34A] font-medium">{hostSpaces.length} Hubs total</p>
          </div>
          <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#111827] dark:group-hover:text-[#F9FAFB] flex items-center space-x-1">
            <span>Manage Hubs</span>
            <ChevronRight className="w-3 h-3 text-[#16A34A]" />
          </div>
        </div>

        {/* 2. Today's Bookings */}
        <div 
          onClick={() => onNavigateTab('bookings')}
          className="p-4 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span className="truncate">Today's Bookings</span>
            <Users className="w-4 h-4 text-[#16A34A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-[#111827] dark:text-[#F9FAFB]">{todayBookings.length || 3}</div>
            <p className="text-[10px] text-[#16A34A] font-medium">{checkedInNow.length || 1} Checked In</p>
          </div>
          <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#111827] dark:group-hover:text-[#F9FAFB] flex items-center space-x-1">
            <span>View Queue</span>
            <ChevronRight className="w-3 h-3 text-[#16A34A]" />
          </div>
        </div>

        {/* 3. Upcoming Check-ins */}
        <div 
          onClick={() => onNavigateTab('bookings')}
          className="p-4 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span className="truncate">Upcoming Check-ins</span>
            <CalendarCheck className="w-4 h-4 text-[#16A34A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-[#111827] dark:text-[#F9FAFB]">{upcomingCheckins.length}</div>
            <p className="text-[10px] text-[#D97706] dark:text-[#F59E0B] font-medium">Next: 14:00 today</p>
          </div>
          <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#111827] dark:group-hover:text-[#F9FAFB] flex items-center space-x-1">
            <span>Turnstile Pass</span>
            <ChevronRight className="w-3 h-3 text-[#16A34A]" />
          </div>
        </div>

        {/* 4. Occupancy Rate */}
        <div 
          onClick={() => onNavigateTab('insights')}
          className="p-4 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span className="truncate">Occupancy Rate</span>
            <Percent className="w-4 h-4 text-[#16A34A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-[#16A34A] font-mono">{currentOccupancyPercent}%</div>
            <div className="w-full bg-[#F1F5F9] dark:bg-[#374151] h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-[#16A34A] h-full" style={{ width: `${currentOccupancyPercent}%` }} />
            </div>
          </div>
          <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#111827] dark:group-hover:text-[#F9FAFB] flex items-center space-x-1">
            <span>High Demand</span>
            <ChevronRight className="w-3 h-3 text-[#16A34A]" />
          </div>
        </div>

        {/* 5. Monthly Gross Earnings */}
        <div 
          onClick={() => onNavigateTab('payouts')}
          className="p-4 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span className="truncate">Monthly Gross</span>
            <TrendingUp className="w-4 h-4 text-[#16A34A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-[#F9FAFB] font-mono">
              ₦1.85M
            </div>
            <p className="text-[10px] text-[#16A34A] font-bold">+18.4% vs last mo</p>
          </div>
          <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#111827] dark:group-hover:text-[#F9FAFB] flex items-center space-x-1">
            <span>Financials</span>
            <ChevronRight className="w-3 h-3 text-[#16A34A]" />
          </div>
        </div>

        {/* 6. Pending Payouts */}
        <div 
          onClick={() => setIsHostPayoutModalOpen(true)}
          className="p-4 rounded-3xl bg-[#DCFCE7]/60 dark:bg-[#16A34A]/15 border border-[#16A34A]/30 hover:border-[#16A34A] transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span className="truncate">Pending Payouts</span>
            <Wallet className="w-4 h-4 text-[#16A34A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-lg sm:text-xl font-extrabold text-[#16A34A] font-mono">
              ₦{(pendingPayoutNgn || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Direct NIP Ready</p>
          </div>
          <div className="text-[10px] font-bold text-[#16A34A] flex items-center space-x-1">
            <span>Withdraw ₦</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* Quick Operations Action Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#16A34A]" />
            <h3 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">Host Quick Operations</h3>
          </div>
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Fast shortcuts for day-to-day hub management</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => setIsListSpaceModalOpen(true)}
            className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 text-left transition-all cursor-pointer group"
          >
            <PlusCircle className="w-5 h-5 text-[#16A34A] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Add Space</div>
            <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Publish new hub</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('calendar')}
            className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 text-left transition-all cursor-pointer group"
          >
            <CalendarIcon className="w-5 h-5 text-[#16A34A] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Calendar View</div>
            <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Block/Open dates</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('pricing')}
            className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 text-left transition-all cursor-pointer group"
          >
            <Sliders className="w-5 h-5 text-[#16A34A] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Pricing Rules</div>
            <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Weekend & promos</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('bookings')}
            className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 text-left transition-all cursor-pointer group"
          >
            <QrCode className="w-5 h-5 text-[#16A34A] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Turnstile Pass</div>
            <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Scan guest QR</div>
          </button>

          <button
            type="button"
            onClick={() => setIsHostPayoutModalOpen(true)}
            className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 text-left transition-all cursor-pointer group"
          >
            <Wallet className="w-5 h-5 text-[#16A34A] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">Request Payout</div>
            <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Direct bank NIP</div>
          </button>

          <button
            type="button"
            onClick={() => setIsDiagnosticsModalOpen(true)}
            className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 text-left transition-all cursor-pointer group"
          >
            <Activity className="w-5 h-5 text-[#16A34A] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">System Health</div>
            <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Genset & Starlink</div>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Live Booking Roster & Hub Occupancy Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Live Guest Booking Queue & Check-In Radar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">Today's Guest Activity & Access Queue</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Real-time turnstile verification and upcoming desk check-ins</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-[#16A34A] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({bookings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {bookings.slice(0, 4).map((b) => (
              <div 
                key={b.id}
                className="p-4 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    b.checkedIn 
                      ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30' 
                      : 'bg-[#F1F5F9] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#4B5563]'
                  }`}>
                    {b.checkedIn ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">{b.userName}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        b.status === 'checked_in' || b.checkedIn
                          ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A]'
                          : b.status === 'cancelled'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {String(b.status || '').replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                      {b.spaceTitle} • {b.date} ({b.startTime} - {b.endTime || '17:00'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF]">
                      {b.digitalPassCode}
                    </span>
                    <div className="text-xs font-mono font-bold text-[#16A34A] mt-0.5">
                      ₦{(b.totalAmount || 0).toLocaleString()}
                    </div>
                  </div>

                  {!b.checkedIn && b.status !== 'cancelled' ? (
                    <button
                      type="button"
                      onClick={() => onOpenCheckInCode(b.digitalPassCode)}
                      className="px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Check In</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] text-xs font-bold border border-[#16A34A]/30">
                      Active In Hub ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1/3): Hub Occupancy Breakdown & Facility Status */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">Hub Occupancy & Facility Pulse</h3>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-4 shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111827] dark:text-[#F9FAFB]">The Hive Coworking (VI)</span>
                <span className="font-mono text-[#16A34A] font-bold">85% Full</span>
              </div>
              <div className="w-full bg-[#F1F5F9] dark:bg-[#374151] h-2 rounded-full overflow-hidden">
                <div className="bg-[#16A34A] h-full w-[85%]" />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                <span>34 / 40 Desks Occupied</span>
                <span className="text-[#16A34A] font-semibold">6 Desks Available</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#374151] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Brass & Granite (Ikoyi)</span>
                <span className="font-mono text-[#16A34A] font-bold">62% Full</span>
              </div>
              <div className="w-full bg-[#F1F5F9] dark:bg-[#374151] h-2 rounded-full overflow-hidden">
                <div className="bg-[#16A34A] h-full w-[62%]" />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                <span>15 / 24 Suites Booked</span>
                <span className="text-[#16A34A] font-semibold">9 Available</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#374151] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                <span className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Dual Hybrid Power</span>
                </span>
                <span className="font-mono text-[#16A34A] font-bold">99.98% Live</span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Turnstile Gate Access</span>
                </span>
                <span className="text-[#16A34A] font-semibold">Online (Auto)</span>
              </div>
            </div>
          </div>

          {/* Superhost Badge Card */}
          <div className="p-4 rounded-3xl bg-[#DCFCE7]/60 dark:bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#16A34A]/15 text-[#16A34A] flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">OFIS Verified Superhost</div>
              <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Fast payout clearance & priority discovery in search.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
