import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star, 
  Eye, 
  Calendar, 
  Clock, 
  PhoneCall, 
  AlertTriangle,
  Zap,
  Inbox,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { spacesService } from '../services/spacesService';
import { bookingsService } from '../services/bookingsService';
import { Booking } from '../types';

export const HostDashboard: React.FC = () => {
  const { 
    currentUser, 
    setIsListSpaceOpen, 
    setCurrentView, 
    setSelectedSpaceId,
    setSelectedBookingDetails,
    setContactHostData,
    cancelBooking,
    showToast,
    formatPrice,
  } = useApp();

  const [bookingTab, setBookingTab] = useState<'upcoming' | 'active' | 'completed' | 'cancelled' | 'all'>('all');

  const spaces = spacesService.getAllSpaces().filter(s => s.hostId === currentUser.id || currentUser.role === 'host');
  const spaceIds = spaces.map(s => s.id);
  const hostBookings = bookingsService.getHostBookings(spaceIds);

  const upcomingBookings = hostBookings.filter(b => b.bookingStatus === 'confirmed');
  const activeBookings = hostBookings.filter(b => b.bookingStatus === 'active');
  const completedBookings = hostBookings.filter(b => b.bookingStatus === 'completed');
  const cancelledBookings = hostBookings.filter(b => b.bookingStatus === 'cancelled');

  const getFilteredBookings = () => {
    switch (bookingTab) {
      case 'upcoming':
        return upcomingBookings;
      case 'active':
        return activeBookings;
      case 'completed':
        return completedBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return hostBookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  const getStatusBadge = (status: Booking['bookingStatus']) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30">Confirmed</span>;
      case 'active':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C878] text-[#0D0D0D] animate-pulse">Active Session</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#232D28] text-[#9EABA3]">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Cancelled</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00C878]/15 text-[#00C878] font-bold uppercase">
                Host Partner Dashboard
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#F2F2F2] mt-1">Manage Your Spaces & Guest Bookings</h1>
            <p className="text-xs text-[#9EABA3]">Track hourly reservations, guest arrivals, revenue, and solar verification status.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsListSpaceOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center space-x-2 shadow-md self-start sm:self-auto transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Physical Space</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#141816] border border-[#1E2522] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#9EABA3]">
              <span>Monthly Host Payouts</span>
              <DollarSign className="w-4 h-4 text-[#00C878]" />
            </div>
            <div className="text-2xl font-black text-[#00C878] font-mono">{formatPrice(420000)}</div>
            <p className="text-[11px] text-[#718079] flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-[#00C878]" />
              <span>+18.4% from last month</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141816] border border-[#1E2522] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#9EABA3]">
              <span>Average Occupancy</span>
              <Users className="w-4 h-4 text-[#00C878]" />
            </div>
            <div className="text-2xl font-black text-[#F2F2F2] font-mono">84%</div>
            <p className="text-[11px] text-[#718079]">Peak: Weekdays 11am - 4pm</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141816] border border-[#1E2522] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#9EABA3]">
              <span>Host Reputation Score</span>
              <Star className="w-4 h-4 fill-[#00C878] text-[#00C878]" />
            </div>
            <div className="text-2xl font-black text-[#F2F2F2] font-mono">4.96 ★</div>
            <p className="text-[11px] text-[#00C878] font-semibold">Superhost Tier Qualified</p>
          </div>
        </div>

        {/* Section 1: Guest Reservations Management */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F2F2F2]">Guest Reservations & Turnstile Activity</h2>
              <p className="text-xs text-[#9EABA3]">Manage inbound guests and active work passes across your locations.</p>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All', count: hostBookings.length },
                { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
                { id: 'active', label: 'Active', count: activeBookings.length },
                { id: 'completed', label: 'Completed', count: completedBookings.length },
                { id: 'cancelled', label: 'Cancelled', count: cancelledBookings.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBookingTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    bookingTab === tab.id
                      ? 'bg-[#17201B] text-[#00C878] border border-[#00C878]/40'
                      : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#141816]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-mono opacity-80">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length > 0 ? (
            <div className="space-y-3">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-[#141816] border border-[#1E2522] hover:border-[#2A3630] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <img
                      src={b.spaceImage}
                      alt={b.spaceTitle}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(b.bookingStatus)}
                        <span className="text-xs font-mono text-[#718079]">{b.id}</span>
                        <span className="text-[10px] text-[#00C878] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Paid ₦{b.totalPrice.toLocaleString()}</span>
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-[#F2F2F2] truncate">
                        {b.spaceTitle}
                      </h4>

                      <div className="flex items-center gap-3 text-[11px] text-[#9EABA3] flex-wrap">
                        <span>Guest: <strong className="text-[#F2F2F2]">{b.userName}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#00C878]" />
                          <span>{b.startDate} ({b.startTime || 'Slot'})</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#00C878]" />
                          <span>{b.durationHours} hrs</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Host */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingDetails(b)}
                      className="px-3 py-1.5 rounded-lg bg-[#161D19] border border-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContactHostData({
                        hostName: b.userName,
                        spaceTitle: b.spaceTitle,
                        phone: b.userPhone || '+234 803 000 0000',
                        email: b.userEmail
                      })}
                      className="px-3 py-1.5 rounded-lg bg-[#161D19] border border-[#232D28] text-xs font-semibold text-[#00C878] hover:bg-[#1C2520] flex items-center gap-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Contact Guest</span>
                    </button>

                    {b.bookingStatus === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Cancel reservation for ${b.userName}? Full ${formatPrice(b.totalPrice)} will be refunded to guest.`)) {
                            cancelBooking(b.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#1A1616] border border-rose-500/20 text-rose-400 hover:bg-rose-950/40 text-xs"
                        title="Cancel reservation"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#141816] rounded-xl border border-[#1E2522] space-y-2">
              <Inbox className="w-8 h-8 text-[#718079] mx-auto opacity-40" />
              <p className="text-xs font-semibold text-[#9EABA3]">Bookings for your spaces will appear here.</p>
            </div>
          )}
        </div>

        {/* Section 2: Active Physical Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F2F2F2]">Your Active Spaces ({spaces.length})</h2>
            <button
              type="button"
              onClick={() => setIsListSpaceOpen(true)}
              className="text-xs font-bold text-[#00C878] hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Space</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spaces.map((sp) => (
              <div
                key={sp.id}
                className="p-4 rounded-2xl bg-[#141816] border border-[#1E2522] flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5">
                  <img
                    src={sp.featuredImage}
                    alt={sp.title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-[#F2F2F2] line-clamp-1">{sp.title}</h3>
                    <p className="text-[11px] text-[#9EABA3]">{sp.neighborhood}, {sp.city}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-mono font-bold text-[#00C878]">{formatPrice(sp.pricePerHour)}/hr</span>
                      <span className="text-[10px] text-[#718079]">• {sp.reviewsCount} reviews</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpaceId(sp.id);
                    setCurrentView('details');
                  }}
                  className="p-2.5 rounded-xl bg-[#161D19] border border-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] hover:border-[#00C878]"
                  title="View Space Listing"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
