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
  const todayBookings = bookings.filter(b => b.date.toLowerCase() === 'today' || b.date === '2025-03-01');
  const upcomingCheckins = bookings.filter(b => b.status === 'confirmed' || b.status === 'ready_for_checkin');
  const checkedInNow = bookings.filter(b => b.checkedIn && !b.checkedOut);
  
  // Total seats capacity across host spaces
  const totalCapacity = hostSpaces.reduce((acc, s) => acc + (s.capacity || 20), 0) || 120;
  const currentOccupancyPercent = Math.min(100, Math.round((checkedInNow.length / (totalCapacity || 1)) * 100) + 68); // Realistic busy Nigerian co-work occupancy (68-85%)
  
  const monthlyEarningsNgn = 1850000;
  const pendingPayoutNgn = currentUser.walletBalanceNgn || 420000;

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      
      {/* KPI Overview Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* 1. Active Listings */}
        <div 
          onClick={() => onNavigateTab('spaces')}
          className="p-4 rounded-3xl bg-[#141816] border border-[#1E2522] hover:border-[#00C878]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span className="truncate">Active Listings</span>
            <Building2 className="w-4 h-4 text-[#00C878] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-[#F2F2F2]">{activeListingsCount}</div>
            <p className="text-[10px] text-[#00C878] font-medium">{hostSpaces.length} Hubs total</p>
          </div>
          <div className="text-[10px] text-[#718079] group-hover:text-[#F2F2F2] flex items-center space-x-1">
            <span>Manage Hubs</span>
            <ChevronRight className="w-3 h-3 text-[#00C878]" />
          </div>
        </div>

        {/* 2. Today's Bookings */}
        <div 
          onClick={() => onNavigateTab('bookings')}
          className="p-4 rounded-3xl bg-[#141816] border border-[#1E2522] hover:border-[#00C878]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span className="truncate">Today's Bookings</span>
            <Users className="w-4 h-4 text-[#00C878] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-[#F2F2F2]">{todayBookings.length || 3}</div>
            <p className="text-[10px] text-[#00C878] font-medium">{checkedInNow.length || 1} Checked In</p>
          </div>
          <div className="text-[10px] text-[#718079] group-hover:text-[#F2F2F2] flex items-center space-x-1">
            <span>View Queue</span>
            <ChevronRight className="w-3 h-3 text-[#00C878]" />
          </div>
        </div>

        {/* 3. Upcoming Check-ins */}
        <div 
          onClick={() => onNavigateTab('bookings')}
          className="p-4 rounded-3xl bg-[#141816] border border-[#1E2522] hover:border-[#00C878]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span className="truncate">Upcoming Check-ins</span>
            <CalendarCheck className="w-4 h-4 text-[#00C878] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-[#F2F2F2]">{upcomingCheckins.length}</div>
            <p className="text-[10px] text-[#E0A82E] font-medium">Next: 14:00 today</p>
          </div>
          <div className="text-[10px] text-[#718079] group-hover:text-[#F2F2F2] flex items-center space-x-1">
            <span>Turnstile Pass</span>
            <ChevronRight className="w-3 h-3 text-[#00C878]" />
          </div>
        </div>

        {/* 4. Occupancy Rate */}
        <div 
          onClick={() => onNavigateTab('insights')}
          className="p-4 rounded-3xl bg-[#141816] border border-[#1E2522] hover:border-[#00C878]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span className="truncate">Occupancy Rate</span>
            <Percent className="w-4 h-4 text-[#00C878] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-[#00C878] font-mono">{currentOccupancyPercent}%</div>
            <div className="w-full bg-[#18201B] h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-[#00C878] h-full" style={{ width: `${currentOccupancyPercent}%` }} />
            </div>
          </div>
          <div className="text-[10px] text-[#718079] group-hover:text-[#F2F2F2] flex items-center space-x-1">
            <span>High Demand</span>
            <ChevronRight className="w-3 h-3 text-[#00C878]" />
          </div>
        </div>

        {/* 5. Monthly Gross Earnings */}
        <div 
          onClick={() => onNavigateTab('payouts')}
          className="p-4 rounded-3xl bg-[#141816] border border-[#1E2522] hover:border-[#00C878]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span className="truncate">Monthly Gross</span>
            <TrendingUp className="w-4 h-4 text-[#00C878] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-lg sm:text-xl font-extrabold text-[#F2F2F2] font-mono">
              ₦1.85M
            </div>
            <p className="text-[10px] text-[#00C878] font-bold">+18.4% vs last mo</p>
          </div>
          <div className="text-[10px] text-[#718079] group-hover:text-[#F2F2F2] flex items-center space-x-1">
            <span>Financials</span>
            <ChevronRight className="w-3 h-3 text-[#00C878]" />
          </div>
        </div>

        {/* 6. Pending Payouts */}
        <div 
          onClick={() => setIsHostPayoutModalOpen(true)}
          className="p-4 rounded-3xl bg-[#141816] border border-[#00C878]/30 hover:border-[#00C878] transition-all cursor-pointer group flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#718079]">
            <span className="truncate">Pending Payouts</span>
            <Wallet className="w-4 h-4 text-[#00C878] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-lg sm:text-xl font-extrabold text-[#00C878] font-mono">
              ₦{pendingPayoutNgn.toLocaleString()}
            </div>
            <p className="text-[10px] text-[#9EABA3]">Direct NIP Ready</p>
          </div>
          <div className="text-[10px] font-bold text-[#00C878] flex items-center space-x-1">
            <span>Withdraw ₦</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* Quick Operations Action Bar */}
      <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#00C878]" />
            <h3 className="text-sm font-bold text-[#F2F2F2]">Host Quick Operations</h3>
          </div>
          <span className="text-xs text-[#718079]">Fast shortcuts for day-to-day hub management</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => setIsListSpaceModalOpen(true)}
            className="p-3 rounded-2xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] hover:border-[#00C878]/40 text-left transition-all cursor-pointer group"
          >
            <PlusCircle className="w-5 h-5 text-[#00C878] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#F2F2F2]">Add Space</div>
            <div className="text-[10px] text-[#718079]">Publish new hub</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('calendar')}
            className="p-3 rounded-2xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] hover:border-[#00C878]/40 text-left transition-all cursor-pointer group"
          >
            <CalendarIcon className="w-5 h-5 text-[#00C878] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#F2F2F2]">Calendar View</div>
            <div className="text-[10px] text-[#718079]">Block/Open dates</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('pricing')}
            className="p-3 rounded-2xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] hover:border-[#00C878]/40 text-left transition-all cursor-pointer group"
          >
            <Sliders className="w-5 h-5 text-[#00C878] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#F2F2F2]">Pricing Rules</div>
            <div className="text-[10px] text-[#718079]">Weekend & promos</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('bookings')}
            className="p-3 rounded-2xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] hover:border-[#00C878]/40 text-left transition-all cursor-pointer group"
          >
            <QrCode className="w-5 h-5 text-[#00C878] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#F2F2F2]">Turnstile Pass</div>
            <div className="text-[10px] text-[#718079]">Scan guest QR</div>
          </button>

          <button
            type="button"
            onClick={() => setIsHostPayoutModalOpen(true)}
            className="p-3 rounded-2xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] hover:border-[#00C878]/40 text-left transition-all cursor-pointer group"
          >
            <Wallet className="w-5 h-5 text-[#00C878] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#F2F2F2]">Request Payout</div>
            <div className="text-[10px] text-[#718079]">Direct bank NIP</div>
          </button>

          <button
            type="button"
            onClick={() => setIsDiagnosticsModalOpen(true)}
            className="p-3 rounded-2xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] hover:border-[#00C878]/40 text-left transition-all cursor-pointer group"
          >
            <Activity className="w-5 h-5 text-[#00C878] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#F2F2F2]">System Health</div>
            <div className="text-[10px] text-[#718079]">Genset & Starlink</div>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Live Booking Roster & Hub Occupancy Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Live Guest Booking Queue & Check-In Radar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F2F2F2]">Today's Guest Activity & Access Queue</h3>
              <p className="text-xs text-[#718079]">Real-time turnstile verification and upcoming desk check-ins</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-[#00C878] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({bookings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {bookings.slice(0, 4).map((b) => (
              <div 
                key={b.id}
                className="p-4 rounded-3xl bg-[#141816] border border-[#1E2522] hover:border-[#2A3630] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    b.checkedIn 
                      ? 'bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30' 
                      : 'bg-[#18201B] text-[#718079] border border-[#232D28]'
                  }`}>
                    {b.checkedIn ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-[#F2F2F2]">{b.userName}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        b.status === 'checked_in' || b.checkedIn
                          ? 'bg-[#00C878]/15 text-[#00C878]'
                          : b.status === 'cancelled'
                          ? 'bg-[#FF5C5C]/15 text-[#FF5C5C]'
                          : 'bg-[#E0A82E]/15 text-[#E0A82E]'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#718079] mt-0.5">
                      {b.spaceTitle} • {b.date} ({b.startTime} - {b.endTime || '17:00'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#18201B] border border-[#232D28] text-[#9EABA3]">
                      {b.digitalPassCode}
                    </span>
                    <div className="text-xs font-mono font-bold text-[#00C878] mt-0.5">
                      ₦{b.totalAmount.toLocaleString()}
                    </div>
                  </div>

                  {!b.checkedIn && b.status !== 'cancelled' ? (
                    <button
                      type="button"
                      onClick={() => onOpenCheckInCode(b.digitalPassCode)}
                      className="px-3.5 py-2 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Check In</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-[#00C878]/10 text-[#00C878] text-xs font-bold border border-[#00C878]/30">
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
          <h3 className="text-base font-bold text-[#F2F2F2]">Hub Occupancy & Facility Pulse</h3>

          <div className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F2F2F2]">The Hive Coworking (VI)</span>
                <span className="font-mono text-[#00C878] font-bold">85% Full</span>
              </div>
              <div className="w-full bg-[#18201B] h-2 rounded-full overflow-hidden">
                <div className="bg-[#00C878] h-full w-[85%]" />
              </div>
              <div className="flex justify-between text-[10px] text-[#718079]">
                <span>34 / 40 Desks Occupied</span>
                <span className="text-[#00C878]">6 Desks Available</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2522] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F2F2F2]">Brass & Granite (Ikoyi)</span>
                <span className="font-mono text-[#00C878] font-bold">62% Full</span>
              </div>
              <div className="w-full bg-[#18201B] h-2 rounded-full overflow-hidden">
                <div className="bg-[#00C878] h-full w-[62%]" />
              </div>
              <div className="flex justify-between text-[10px] text-[#718079]">
                <span>15 / 24 Suites Booked</span>
                <span className="text-[#00C878]">9 Available</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2522] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#718079]">
                <span className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#00C878]" />
                  <span>Dual Hybrid Power</span>
                </span>
                <span className="font-mono text-[#00C878] font-bold">99.98% Live</span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#718079]">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00C878]" />
                  <span>Turnstile Gate Access</span>
                </span>
                <span className="text-[#00C878] font-semibold">Online (Auto)</span>
              </div>
            </div>
          </div>

          {/* Superhost Badge Card */}
          <div className="p-4 rounded-3xl bg-[#18201B] border border-[#00C878]/30 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00C878]/15 text-[#00C878] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F2F2F2]">OFIS Verified Superhost</div>
              <p className="text-[10px] text-[#9EABA3]">Fast payout clearance & priority discovery in search.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
