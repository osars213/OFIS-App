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
    const isToday = b.date.toLowerCase() === 'today' || b.date === '2025-03-01';
    const isUpcoming = b.status === 'confirmed' || b.status === 'ready_for_checkin';
    const isCompleted = b.status === 'completed' || b.status === 'reviewed';
    const isCancelled = b.status === 'cancelled';

    if (activeFilter === 'today' && !isToday) return false;
    if (activeFilter === 'upcoming' && (!isUpcoming || isToday)) return false;
    if (activeFilter === 'completed' && !isCompleted) return false;
    if (activeFilter === 'cancelled' && !isCancelled) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.userName.toLowerCase().includes(q);
      const matchId = b.id.toLowerCase().includes(q) || b.digitalPassCode.toLowerCase().includes(q);
      const matchSpace = b.spaceTitle.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchSpace) return false;
    }

    return true;
  });

  const handleApprove = (bookingId: string) => {
    approveBooking(bookingId);
  };

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
          <h2 className="text-xl font-bold text-[#F2F2F2]">Booking Management & Turnstile Queue</h2>
          <p className="text-xs text-[#718079]">
            Monitor guest arrivals, verify digital passes, approve requests, and communicate with members
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718079]" />
          <input
            type="text"
            placeholder="Search guest, booking ID or pass..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#141816] border border-[#1E2522] text-xs text-[#F2F2F2] placeholder-[#718079] focus:outline-none focus:border-[#00C878]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'today', label: "Today's Bookings", count: bookings.filter(b => b.date.toLowerCase() === 'today' || b.date === '2025-03-01').length },
          { id: 'upcoming', label: 'Upcoming', count: bookings.filter(b => (b.status === 'confirmed' || b.status === 'ready_for_checkin') && b.date.toLowerCase() !== 'today').length },
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
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 cursor-pointer ${
                isActive
                  ? 'bg-[#00C878] text-[#0D0D0D] shadow-md shadow-[#00C878]/15'
                  : 'bg-[#141816] text-[#9EABA3] hover:text-[#F2F2F2] border border-[#1E2522]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isActive ? 'bg-black/20 text-[#0D0D0D]' : 'bg-[#18201B] text-[#718079]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#141816] border border-[#1E2522] space-y-3">
          <Users className="w-10 h-10 text-[#232D28] mx-auto" />
          <h3 className="text-base font-bold text-[#F2F2F2]">No Bookings Found</h3>
          <p className="text-xs text-[#718079]">
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
                className="p-5 rounded-3xl bg-[#141816] border border-[#1E2522] hover:border-[#2A3630] transition-all space-y-4"
              >
                {/* Upper Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#18201B] border border-[#232D28] text-[#00C878] flex items-center justify-center font-bold shrink-0">
                      <User className="w-6 h-6 text-[#00C878]" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#F2F2F2]">{booking.userName}</h4>
                        
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#18201B] text-[#9EABA3] border border-[#232D28]">
                          {booking.id}
                        </span>

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isCheckedIn
                            ? 'bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30'
                            : isCancelled
                            ? 'bg-[#FF5C5C]/15 text-[#FF5C5C] border border-[#FF5C5C]/30'
                            : isCompleted
                            ? 'bg-[#9EABA3]/15 text-[#9EABA3] border border-[#9EABA3]/30'
                            : 'bg-[#E0A82E]/15 text-[#E0A82E] border border-[#E0A82E]/30'
                        }`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-[#718079] mt-1 flex-wrap">
                        <span className="text-[#F2F2F2] font-semibold">{booking.spaceTitle}</span>
                        <span>•</span>
                        <span>{booking.date} ({booking.startTime} - {booking.endTime || '17:00'})</span>
                        {booking.selectedSeatLabel && (
                          <>
                            <span>•</span>
                            <span className="text-[#00C878]">{booking.selectedSeatLabel}</span>
                          </>
                        )}
                      </div>

                      {/* Guest Contact Details */}
                      <div className="flex items-center space-x-3 text-[11px] text-[#718079] mt-1 flex-wrap">
                        {booking.userEmail && (
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-[#718079]" />
                            <span>{booking.userEmail}</span>
                          </span>
                        )}
                        {booking.userPhone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-[#718079]" />
                            <span>{booking.userPhone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Digital Pass Code */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1E2522]">
                    <div className="text-base font-mono font-extrabold text-[#00C878]">
                      ₦{booking.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#718079] flex items-center space-x-1">
                      <span>Pass:</span>
                      <span className="font-mono font-bold text-[#F2F2F2]">{booking.digitalPassCode}</span>
                    </div>
                  </div>
                </div>

                {/* Cancellation Note if Cancelled */}
                {isCancelled && booking.cancellationReason && (
                  <div className="p-3 rounded-2xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/20 text-xs text-[#FF8C8C] flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-[#FF5C5C] shrink-0" />
                    <span>Cancellation Reason: "{booking.cancellationReason}"</span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1E2522] flex-wrap gap-2">
                  
                  {/* Left Group: Communication & Invoice */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setMessagingBooking(booking)}
                      className="px-3 py-1.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-xs font-semibold text-[#F2F2F2] flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#00C878]" />
                      <span>Message Guest</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReceiptBooking(booking)}
                      className="px-3 py-1.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#718079]" />
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
                          className="px-3.5 py-1.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
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
                          className="px-3 py-1.5 rounded-xl bg-[#18201B] hover:bg-[#FF5C5C]/15 text-[#718079] hover:text-[#FF5C5C] text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}

                    {isCheckedIn && (
                      <span className="px-3 py-1.5 rounded-xl bg-[#00C878]/10 text-[#00C878] text-xs font-bold border border-[#00C878]/30 flex items-center space-x-1.5">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
              <h3 className="text-base font-bold text-[#F2F2F2]">Cancel Guest Booking</h3>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="p-1.5 rounded-xl text-[#718079] hover:text-[#F2F2F2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#718079]">
              Are you sure you want to cancel booking <strong className="text-[#F2F2F2]">{cancelModalBooking.id}</strong> for <strong className="text-[#F2F2F2]">{cancelModalBooking.userName}</strong>?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9EABA3]">Cancellation Reason (Visible to Guest)</label>
              <textarea
                rows={3}
                placeholder="e.g., Unscheduled emergency hub maintenance, private team buyout..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] placeholder-[#718079] focus:outline-none focus:border-[#FF5C5C]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl bg-[#18201B] text-[#9EABA3] text-xs font-bold cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={!cancellationReason.trim()}
                className="px-4 py-2 rounded-xl bg-[#FF5C5C] hover:bg-[#FF7373] disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-md"
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
