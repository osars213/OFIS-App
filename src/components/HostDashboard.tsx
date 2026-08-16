import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Landmark,
  TrendingUp,
  Percent,
  PlusCircle,
  Settings,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ArrowDownToLine,
  MessageCircle,
  PhoneCall,
  Zap,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Space, Desk, Booking, PrimaryCategory } from '../types';
import { FloorPlan } from './FloorPlan';

export const HostDashboard: React.FC = () => {
  const {
    currentUser,
    spaces,
    bookings,
    formatPriceNaira,
    updateDeskStatus,
    checkInBooking,
    cancelBooking,
    setIsListSpaceModalOpen,
    openAiModal,
    showToast,
    updateSpace,
    setSelectedSpace,
  } = useApp();

  const [activeHostTab, setActiveHostTab] = useState<'overview' | 'spaces' | 'bookings' | 'payouts'>('overview');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<PrimaryCategory | 'all'>('all');

  // Spaces hosted by this user
  const hostSpaces = spaces.filter(s => currentUser && (s.hostId === currentUser.id || s.hostEmail === currentUser.email));
  const displayedSpaces = hostSpaces.length > 0 ? hostSpaces : spaces;

  const [selectedHostedSpaceId, setSelectedHostedSpaceId] = useState<string>(
    displayedSpaces[0]?.id || spaces[0]?.id
  );

  const activeSpace = spaces.find(s => s.id === selectedHostedSpaceId) || displayedSpaces[0] || spaces[0];

  // Host Metrics in Naira
  const hostBookings = bookings.filter(b => (currentUser && b.hostId === currentUser.id) || displayedSpaces.some(s => s.id === b.spaceId));
  const activeBookingsCount = hostBookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length;

  const totalGrossNaira = hostBookings.reduce((sum, b) => sum + (b.totalAmount), 0) || 1850000;
  const totalCommissionNaira = hostBookings.reduce((sum, b) => sum + (b.platformCommissionFee), 0) || 92500;
  const totalHostNetNaira = totalGrossNaira - totalCommissionNaira;

  const totalDesks = activeSpace?.desks?.length || 0;
  const occupiedDesks = (activeSpace?.desks || []).filter(d => d.status === 'occupied' || d.status === 'reserved').length;
  const occupancyRate = totalDesks > 0 ? Math.round((occupiedDesks / totalDesks) * 100) : 75;

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');

  const filteredHostBookings = (hostBookings || []).filter(b => {
    if (bookingFilterStatus !== 'all' && b.status !== bookingFilterStatus) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (
        (b.coworkerName || '').toLowerCase().includes(q) ||
        (b.deskCode || '').toLowerCase().includes(q) ||
        (b.id || '').toLowerCase().includes(q) ||
        (b.bookingReference && b.bookingReference.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRequestPayout = () => {
    showToast(`Instant settlement of ${formatPriceNaira(totalHostNetNaira)} initiated to ${currentUser.bankAccount?.bankName || 'Access Bank'} (${currentUser.bankAccount?.accountNumber || '0123456789'}).`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Host Command Center Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                OFIS Host Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#063B2A] text-[#00C878] border border-[#00C878]/30">
                Space Owner Portal 🇳🇬
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#9A9A9A] mt-1 font-normal">
              Real-time occupancy control, Nigerian booking management, and instant bank payout ledger.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openAiModal('optimize')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#171717] hover:bg-[#222222] text-[#D6A83A] border border-[#D6A83A]/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D6A83A]" />
              <span>AI Optimizer</span>
            </button>

            <button
              onClick={() => setIsListSpaceModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] text-xs font-black shadow-md transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#0D0D0D]" />
              <span>List Space</span>
            </button>
          </div>
        </div>

        {/* Metrics Row in Nigerian Naira */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Bookings */}
          <div className="p-5 rounded-2xl bg-[#171717] border border-[#262626] shadow-md space-y-1">
            <div className="flex items-center justify-between text-[#9A9A9A] text-xs font-semibold">
              <span>Gross Volume (GMV)</span>
              <Landmark className="w-4 h-4 text-[#00C878]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {formatPriceNaira(totalGrossNaira)}
            </div>
            <div className="text-[11px] text-[#00C878] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +28% this month
            </div>
          </div>

          {/* Host Net Earnings */}
          <div className="p-5 rounded-2xl bg-[#171717] border border-[#262626] shadow-md space-y-1">
            <div className="flex items-center justify-between text-[#9A9A9A] text-xs font-semibold">
              <span>Net Host Payout (95%)</span>
              <CreditCard className="w-4 h-4 text-[#00C878]" />
            </div>
            <div className="text-2xl font-black text-[#00C878] font-mono">
              {formatPriceNaira(totalHostNetNaira)}
            </div>
            <div className="text-[11px] text-[#9A9A9A] font-normal">
              Direct Nigerian Bank Settlement
            </div>
          </div>

          {/* Live Occupancy */}
          <div className="p-5 rounded-2xl bg-[#171717] border border-[#262626] shadow-md space-y-1">
            <div className="flex items-center justify-between text-[#9A9A9A] text-xs font-semibold">
              <span>Live Space Occupancy</span>
              <Users className="w-4 h-4 text-[#00C878]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {occupancyRate}%
            </div>
            <div className="text-[11px] text-[#9A9A9A] font-normal">
              {occupiedDesks} of {totalDesks} stations active
            </div>
          </div>

          {/* Active Reservations */}
          <div className="p-5 rounded-2xl bg-[#171717] border border-[#262626] shadow-md space-y-1">
            <div className="flex items-center justify-between text-[#9A9A9A] text-xs font-semibold">
              <span>Active Reservations</span>
              <Calendar className="w-4 h-4 text-[#D6A83A]" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {activeBookingsCount}
            </div>
            <div className="text-[11px] text-[#00C878] font-semibold">
              🟢 Real-time seat locks
            </div>
          </div>
        </div>

        {/* Host Hub Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-[#262626] pb-2">
          <button
            onClick={() => setActiveHostTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeHostTab === 'overview'
                ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-sm'
                : 'text-[#9A9A9A] hover:text-white hover:bg-[#202020]'
            }`}
          >
            My Listed Spaces ({displayedSpaces.length})
          </button>

          <button
            onClick={() => setActiveHostTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeHostTab === 'bookings'
                ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-sm'
                : 'text-[#9A9A9A] hover:text-white hover:bg-[#202020]'
            }`}
          >
            Reservations Ledger ({hostBookings.length})
          </button>

          <button
            onClick={() => setActiveHostTab('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeHostTab === 'payouts'
                ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-sm'
                : 'text-[#9A9A9A] hover:text-white hover:bg-[#202020]'
            }`}
          >
            Bank Payouts & Settlements
          </button>
        </div>

        {/* Tab 1: Listed Spaces Table */}
        {activeHostTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">Your Listed Spaces & Studios</h3>
              <button
                onClick={() => setIsListSpaceModalOpen(true)}
                className="text-xs font-bold text-[#00C878] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Another Space</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(displayedSpaces || []).map(space => {
                const hourlyNaira = space.hourlyRateNGN || Math.round(space.hourlyRate * 1550);

                return (
                  <div
                    key={space.id}
                    className="bg-[#171717] rounded-2xl border border-[#282828] overflow-hidden shadow-lg hover:border-[#00C878]/50 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-16/9 bg-[#121212]">
                      <img src={space.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'} alt={space.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#063B2A] text-[#00C878] border border-[#00C878]/40">
                        {space.primaryCategory}
                      </span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#171717]/90 text-[#D6A83A] border border-[#282828]">
                        ★ {space.rating.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-xs text-[#9A9A9A] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00C878]" />
                          <span>{space.neighborhood}, {space.city}</span>
                        </div>
                        <h4 className="font-black text-sm text-white mt-1">{space.name}</h4>
                        <p className="text-xs text-[#9A9A9A] line-clamp-2 mt-1 font-normal">{space.tagline}</p>
                      </div>

                      <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-[#9A9A9A]">Hourly Rate</div>
                          <div className="text-sm font-black text-[#00C878] font-mono">
                            {formatPriceNaira(hourlyNaira)}/hr
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedSpace(space)}
                            className="px-3 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              const newRate = prompt('Enter new hourly rate in Nigerian Naira (₦):', hourlyNaira.toString());
                              if (newRate && !isNaN(Number(newRate))) {
                                updateSpace(space.id, {
                                  hourlyRateNGN: Number(newRate),
                                  hourlyRate: +(Number(newRate) / 1550).toFixed(2),
                                });
                              }
                            }}
                            className="px-3 py-1.5 bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] rounded-xl text-xs font-black transition-colors cursor-pointer"
                          >
                            Edit Rate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Reservations Ledger */}
        {activeHostTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h3 className="text-sm font-black text-white self-start">Recent Booking Ledger</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search guest, reference..."
                  className="text-xs p-2 rounded-xl border border-[#2D2D2D] bg-[#1A1A1A] text-white focus:outline-none focus:border-[#00C878]"
                />
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-[#2D2D2D] bg-[#1A1A1A] text-white font-bold focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="bg-[#171717] rounded-2xl border border-[#282828] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121212] border-b border-[#282828] text-[#9A9A9A] font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Guest & Space</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Reference</th>
                      <th className="p-3.5">Payout (95%)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222]">
                    {(filteredHostBookings || []).map(b => (
                      <tr key={b.id} className="hover:bg-[#1E1E1E] transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{b.coworkerName}</div>
                          <div className="text-[11px] text-[#9A9A9A]">{b.spaceName} • {b.deskCode}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-stone-300">{b.startTime}</div>
                          <div className="text-[11px] text-[#9A9A9A]">{b.durationUnits} hrs</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#00C878]">
                          {b.bookingReference || b.id}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          {formatPriceNaira(b.hostNetPayout || b.totalAmount * 0.95)}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'checked_in'
                              ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/30'
                              : 'bg-[#0E281F] text-[#00C878]'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => checkInBooking(b.id)}
                              className="px-2.5 py-1 bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] rounded-lg text-[11px] font-black cursor-pointer"
                            >
                              Check In
                            </button>
                          )}
                          {b.coworkerPhone && (
                            <a
                              href={`https://wa.me/${b.coworkerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#222222] hover:bg-[#2A2A2A] text-white rounded-lg text-[11px] font-bold"
                            >
                              <MessageCircle className="w-3 h-3 text-[#00C878]" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Payouts & Settlement Account */}
        {activeHostTab === 'payouts' && (
          <div className="bg-[#171717] rounded-3xl p-6 border border-[#282828] shadow-2xl space-y-6 max-w-2xl">
            <div>
              <h3 className="text-base font-black text-white">Nigerian Bank Payout Settings</h3>
              <p className="text-xs text-[#9A9A9A] mt-0.5 font-normal">
                OFIS settles host payouts directly to your Nigerian bank account with automated Paystack batch transfers.
              </p>
            </div>

            <div className="p-4 bg-[#1F1F1F] rounded-2xl border border-[#2D2D2D] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9A9A9A]">Beneficiary Bank</span>
                <span className="font-bold text-white">Access Bank Nigeria PLC</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9A9A9A]">Account Number</span>
                <span className="font-mono font-bold text-[#00C878]">0123456789</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9A9A9A]">Account Name</span>
                <span className="font-bold text-white">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2D2D2D]">
                <span className="text-[#9A9A9A] font-bold">Accumulated Balance</span>
                <span className="font-mono text-base font-black text-[#00C878]">{formatPriceNaira(totalHostNetNaira)}</span>
              </div>
            </div>

            <button
              onClick={handleRequestPayout}
              className="w-full py-3.5 bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Withdraw {formatPriceNaira(totalHostNetNaira)} to Nigerian Bank Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
