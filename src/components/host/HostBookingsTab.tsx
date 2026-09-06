import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  QrCode, 
  FileText, 
  AlertCircle, 
  Building2, 
  Calendar, 
  ChevronRight, 
  ShieldCheck, 
  Check, 
  X, 
  Phone, 
  Mail, 
  User 
} from 'lucide-react';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { HostMessagingModal } from './HostMessagingModal';
import { HostReceiptModal } from './HostReceiptModal';

interface HostBookingsTabProps {
  onOpenCheckInCode: (code: string) => void;
}

export const HostBookingsTab: React.FC<HostBookingsTabProps> = ({
  onOpenCheckInCode,
}) => {
  const { 
    bookings, 
    approveBooking, 
    cancelBookingWithReason, 
    formatPrice,
    setIsDigitalPassOpen,
    setActiveDigitalPassBooking
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [messagingBooking, setMessagingBooking] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const isToday = (b.date || '').toLowerCase() === 'today' || b.date === '2025-03-01';
    const isUpcoming = b.status === 'confirmed' || b.status === 'ready_for_checkin';
    const isCompleted = b.status === 'completed' || b.status === 'reviewed';
    const isCancelled = b.status === 'cancelled';

    if (activeFilter === 'today' && !isToday) return false;
    if (activeFilter === 'upcoming' && (!isUpcoming || isToday)) return false;
    if (activeFilter === 'completed' && !isCompleted) return false;
    if (activeFilter === 'cancelled' && !isCancelled) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (b.userName || '').toLowerCase().includes(q);
      const matchCode = (b.digitalPassCode || '').toLowerCase().includes(q);
      const matchSpace = (b.spaceTitle || '').toLowerCase().includes(q);
      const matchId = (b.id || '').toLowerCase().includes(q);
      return matchName || matchCode || matchSpace || matchId;
    }

    return true;
  });

  const handleConfirmCancel = () => {
    if (!cancelModalBooking || !cancellationReason.trim()) return;
    cancelBookingWithReason(cancelModalBooking.id, cancellationReason.trim());
    setCancelModalBooking(null);
    setCancellationReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Search / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">Booking Management & Turnstile Queue</h2>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            Monitor guest arrivals, verify digital passes, approve requests, and communicate with members
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search guest, booking ID or pass..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#16A34A] shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'today', label: "Today's Bookings", count: bookings.filter(b => (b.date || '').toLowerCase() === 'today' || b.date === '2025-03-01').length },
          { id: 'upcoming', label: 'Upcoming', count: bookings.filter(b => (b.status === 'confirmed' || b.status === 'ready_for_checkin') && (b.date || '').toLowerCase() !== 'today').length },
          { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed' || b.status === 'reviewed').length },
          { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
          { id: 'all', label: 'All Bookings', count: bookings.length },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 cursor-pointer shadow-xs ${
                isActive
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-3 shadow-xs">
          <Users className="w-10 h-10 text-[#6B7280] dark:text-[#9CA3AF] opacity-40 mx-auto" />
          <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">No Bookings Found</h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            There are no reservations matching the selected filter or search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBookings.map((booking) => {
            const isCheckedIn = booking.checkedIn;
            const isCancelled = booking.status === 'cancelled';
            const isCompleted = booking.status === 'completed' || booking.status === 'reviewed';

            return (
              <div
                key={booking.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/50 transition-all space-y-4 shadow-xs"
              >
                {/* Upper Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] dark:bg-[#16A34A]/20 border border-[#16A34A]/30 text-[#16A34A] flex items-center justify-center font-bold shrink-0">
                      <User className="w-6 h-6 text-[#16A34A]" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">{booking.userName}</h4>
                        
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#111827] text-[#6B7280] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#374151]">
                          {booking.id}
                        </span>

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isCheckedIn
                            ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30'
                            : isCancelled
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                            : isCompleted
                            ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {String(booking.status || '').replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 flex-wrap">
                        <span className="text-[#111827] dark:text-[#F9FAFB] font-semibold">{booking.spaceTitle}</span>
                        <span>•</span>
                        <span>{booking.date} ({booking.startTime} - {booking.endTime || '17:00'})</span>
                        {booking.selectedSeatLabel && (
                          <>
                            <span>•</span>
                            <span className="text-[#16A34A] font-medium">{booking.selectedSeatLabel}</span>
                          </>
                        )}
                      </div>

                      {/* Guest Contact Details */}
                      <div className="flex items-center space-x-3 text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mt-1 flex-wrap">
                        {booking.userEmail && (
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-[#6B7280] dark:text-[#9CA3AF]" />
                            <span>{booking.userEmail}</span>
                          </span>
                        )}
                        {booking.userPhone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-[#6B7280] dark:text-[#9CA3AF]" />
                            <span>{booking.userPhone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Digital Pass Code */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E5E7EB] dark:border-[#374151]">
                    <div className="text-base font-mono font-extrabold text-[#16A34A]">
                      ₦{(booking.totalAmount || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] flex items-center space-x-1">
                      <span>Pass:</span>
                      <span className="font-mono font-bold text-[#111827] dark:text-[#F9FAFB]">{booking.digitalPassCode}</span>
                    </div>
                  </div>
                </div>

                {/* Cancellation Note if Cancelled */}
                {isCancelled && booking.cancellationReason && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Cancellation Reason: "{booking.cancellationReason}"</span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] dark:border-[#374151] flex-wrap gap-2">
                  
                  {/* Left Group: Communication & Invoice */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setMessagingBooking(booking)}
                      className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Message Guest</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReceiptBooking(booking)}
                      className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#9CA3AF]" />
                      <span>Invoice / Receipt</span>
                    </button>
                  </div>

                  {/* Right Group: Lifecycle Actions */}
                  <div className="flex items-center space-x-2">
                    {!isCheckedIn && !isCancelled && !isCompleted && (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenCheckInCode(booking.digitalPassCode)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Turnstile Check In</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCancelModalBooking(booking);
                            setCancellationReason('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-red-500/10 border border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-red-600 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}

                    {isCheckedIn && (
                      <span className="px-3 py-1.5 rounded-xl bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] text-xs font-bold border border-[#16A34A]/30 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Checked In • Active in Hub</span>
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1F2937] rounded-3xl border border-[#E5E7EB] dark:border-[#374151] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#374151] pb-3">
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">Cancel Guest Booking</h3>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="p-1.5 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Are you sure you want to cancel booking <strong className="text-[#111827] dark:text-[#F9FAFB]">{cancelModalBooking.id}</strong> for <strong className="text-[#111827] dark:text-[#F9FAFB]">{cancelModalBooking.userName}</strong>?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Cancellation Reason (Visible to Guest)</label>
              <textarea
                rows={3}
                placeholder="e.g., Unscheduled emergency hub maintenance, private team buyout..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-xs text-[#111827] dark:text-[#F9FAFB] placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF] text-xs font-bold cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={!cancellationReason.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      <HostMessagingModal
        isOpen={Boolean(messagingBooking)}
        onClose={() => setMessagingBooking(null)}
        booking={messagingBooking}
      />

      {/* Receipt Modal */}
      <HostReceiptModal
        isOpen={Boolean(receiptBooking)}
        onClose={() => setReceiptBooking(null)}
        booking={receiptBooking}
      />

    </div>
  );
};
