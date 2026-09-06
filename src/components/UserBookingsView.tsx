import React from 'react';
import { 
  CalendarCheck, 
  MapPin, 
  Clock, 
  QrCode, 
  ChevronRight, 
  AlertCircle, 
  Zap, 
  ArrowLeft, 
  XCircle, 
  Bell, 
  CheckCircle2, 
  Check, 
  Star, 
  Plus, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking, BookingLifecycleStatus } from '../types';

export const UserBookingsView: React.FC = () => {
  const {
    bookings,
    isLoadingBookings,
    bookingsError,
    refreshBookings,
    cancelBooking,
    setActiveDigitalPassBooking,
    setIsDigitalPassOpen,
    setActiveBookingDetails,
    setIsBookingDetailsOpen,
    setCurrentView,
    formatPrice,
    formatTime,
    toggleBookingReminder,
    checkInGuest,
    checkOutBooking,
    setReviewSpace,
    setIsWriteReviewOpen,
    allSpaces,
  } = useApp();

  const getStatusBadge = (status: BookingLifecycleStatus) => {
    switch (status) {
      case 'reserved':
        return { label: 'Reserved', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'confirmed':
        return { label: 'Confirmed', className: 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] border-[#16A34A]/30' };
      case 'ready_for_checkin':
        return { label: 'Ready for Check-In', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' };
      case 'checked_in':
        return { label: 'Checked In', className: 'bg-[#DCFCE7] dark:bg-[#16A34A]/25 text-[#16A34A] border-[#16A34A]/40' };
      case 'in_progress':
      case 'active':
        return { label: 'In Progress', className: 'bg-[#DCFCE7] dark:bg-[#16A34A]/25 text-[#16A34A] border-[#16A34A]/40' };
      case 'completed':
        return { label: 'Completed', className: 'bg-[#F1F5F9] dark:bg-[#374151] text-[#6B7280] dark:text-[#D1D5DB] border-[#E5E7EB] dark:border-[#4B5563]' };
      case 'reviewed':
        return { label: 'Reviewed', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' };
      default:
        return { label: status, className: 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] border-[#16A34A]/30' };
    }
  };

  const handleOpenReview = (b: Booking) => {
    const space = allSpaces.find(s => s.id === b.spaceId);
    if (space) {
      setReviewSpace(space);
    }
    setIsWriteReviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#111827] pb-32 transition-colors">
      {/* Top Header */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#374151] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F9FAFB]">My Bookings & Access Passes</h1>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Manage turnstile passes, arrival check-in, duration extensions & reviews</p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('explore')}
            className="px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Find New Space
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {bookingsError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingsError}</span>
            </div>
            <button
              type="button"
              onClick={() => refreshBookings()}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {isLoadingBookings ? (
          <div className="space-y-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] h-28 animate-pulse flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#E5E7EB] dark:bg-[#374151]" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-[#E5E7EB] dark:bg-[#374151] rounded" />
                    <div className="w-48 h-3 bg-[#E5E7EB] dark:bg-[#374151] rounded" />
                  </div>
                </div>
                <div className="w-24 h-8 bg-[#E5E7EB] dark:bg-[#374151] rounded-xl" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] flex items-center justify-center mx-auto text-[#6B7280] dark:text-[#9CA3AF] shadow-sm">
              <CalendarCheck className="w-8 h-8 text-[#16A34A]" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">No active passes</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
              You don’t have any workspace bookings yet. Discover verified hubs with guaranteed 24/7 power, fast internet, and premium workspaces.
            </p>
            <button
              type="button"
              onClick={() => setCurrentView('explore')}
              className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              Explore Spaces
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const isCancelled = b.status === 'cancelled';
              const isCheckedIn = b.checkedIn && !b.checkedOut;
              const isCompleted = b.checkedOut || b.status === 'completed';
              const isReviewed = b.status === 'reviewed' || b.isReviewed;
              const hasReminder = b.hasReminder ?? false;
              const badge = getStatusBadge(b.status);

              return (
                <div
                  key={b.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#16A34A]/40 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center space-x-4 min-w-0">
                    <img
                      src={b.spaceImage}
                      alt={b.spaceTitle}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-[#E5E7EB] dark:border-[#374151]"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-mono">{b.id}</span>
                        
                        {!isCancelled && !isCompleted && !isReviewed && (
                          <button
                            type="button"
                            onClick={() => toggleBookingReminder(b.id)}
                            title={hasReminder ? "Reminder active (30m before). Click to disable." : "Click to set 30-min reminder"}
                            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                              hasReminder
                                ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30'
                                : 'bg-[#F1F5F9] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#4B5563]'
                            }`}
                          >
                            <Bell className="w-2.5 h-2.5" />
                            <span>{hasReminder ? '30m Alert On' : '+ Remind Me'}</span>
                          </button>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-[#F9FAFB] truncate">{b.spaceTitle}</h3>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        <span>{b.date}</span>
                        <span>•</span>
                        <span>
                          {formatTime(b.startTime)} – {formatTime(b.endTime || '17:00')} ({b.durationHours} hrs)
                        </span>
                        <span>•</span>
                        <span className="font-mono font-semibold text-[#16A34A]">{formatPrice(b.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E7EB] dark:border-[#374151]">
                    {/* Check In Action Button */}
                    {!b.checkedIn && !isCancelled && !isCompleted && !isReviewed && (
                      <button
                        type="button"
                        onClick={() => {
                          const res = checkInGuest(b.id);
                          if (res.success) {
                            setActiveDigitalPassBooking(b);
                            setIsDigitalPassOpen(true);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#DCFCE7] dark:bg-[#16A34A]/20 hover:bg-[#BBF7D0] dark:hover:bg-[#16A34A]/30 text-[#16A34A] text-xs font-bold flex items-center space-x-1.5 border border-[#16A34A]/30 shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Check In</span>
                      </button>
                    )}

                    {/* Digital Pass Button */}
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDigitalPassBooking(b);
                          setIsDigitalPassOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Digital Pass</span>
                      </button>
                    )}

                    {/* Review Space Button for completed bookings */}
                    {isCompleted && !isReviewed && (
                      <button
                        type="button"
                        onClick={() => handleOpenReview(b)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center space-x-1.5 cursor-pointer transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>Review</span>
                      </button>
                    )}

                    {/* Details modal button */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBookingDetails(b);
                        setIsBookingDetailsOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151] cursor-pointer transition-colors"
                    >
                      Details
                    </button>

                    {/* Cancel booking option */}
                    {!b.checkedIn && !isCancelled && !isCompleted && !isReviewed && (
                      <button
                        type="button"
                        onClick={() => cancelBooking(b.id)}
                        className="p-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Cancel reservation"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
