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
        return { label: 'Reserved', className: 'bg-[#FFA987]/20 text-[#C05621] dark:text-[#FFA987] border-[#FFA987]/30' };
      case 'confirmed':
        return { label: 'Confirmed', className: 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB] border-[#14BEB8]/30' };
      case 'ready_for_checkin':
        return { label: 'Ready for Check-In', className: 'bg-[#FFA987]/20 text-[#C05621] dark:text-[#FFA987] border-[#FFA987]/30' };
      case 'checked_in':
        return { label: 'Checked In', className: 'bg-[#14BEB8]/20 dark:bg-[#14BEB8]/25 text-[#006B70] dark:text-[#28D2CB] border-[#14BEB8]/40' };
      case 'in_progress':
      case 'active':
        return { label: 'In Progress', className: 'bg-[#14BEB8]/20 dark:bg-[#14BEB8]/25 text-[#006B70] dark:text-[#28D2CB] border-[#14BEB8]/40' };
      case 'completed':
        return { label: 'Completed', className: 'bg-[#F3F6F5] dark:bg-[#105A60] text-[#5D7A7D] dark:text-[#B8D1D0] border-[#E2ECEB] dark:border-[#166D74]' };
      case 'reviewed':
        return { label: 'Reviewed', className: 'bg-[#14BEB8]/10 text-[#006B70] dark:text-[#28D2CB] border-[#14BEB8]/30' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' };
      default:
        return { label: status, className: 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB] border-[#14BEB8]/30' };
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
    <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#07383D] pb-32 transition-colors">
      {/* Top Header */}
      <div className="sticky top-16 z-30 bg-[#FFF9F4]/90 dark:bg-[#07383D]/90 backdrop-blur-md border-b border-[#E2ECEB] dark:border-[#166D74] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#12383B] dark:text-white">My Bookings & Access Passes</h1>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] mt-0.5">Manage turnstile passes, arrival check-in, duration extensions & reviews</p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('explore')}
            className="px-3.5 py-2 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
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
              <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] h-28 animate-pulse flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#E2ECEB] dark:bg-[#105A60]" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-[#E2ECEB] dark:bg-[#105A60] rounded" />
                    <div className="w-48 h-3 bg-[#E2ECEB] dark:bg-[#105A60] rounded" />
                  </div>
                </div>
                <div className="w-24 h-8 bg-[#E2ECEB] dark:bg-[#105A60] rounded-xl" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-center mx-auto text-[#5D7A7D] dark:text-[#B8D1D0] shadow-sm">
              <CalendarCheck className="w-8 h-8 text-[#FFA987]" />
            </div>
            <h3 className="text-lg font-bold text-[#12383B] dark:text-white">No active passes</h3>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] leading-relaxed">
              You don’t have any workspace bookings yet. Discover verified hubs with guaranteed 24/7 power, fast internet, and premium workspaces.
            </p>
            <button
              type="button"
              onClick={() => setCurrentView('explore')}
              className="px-5 py-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
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
                  className="p-5 rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/40 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center space-x-4 min-w-0">
                    <img
                      src={b.spaceImage}
                      alt={b.spaceTitle}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-[#E2ECEB] dark:border-[#166D74]"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] font-mono">{b.id}</span>
                        
                        {!isCancelled && !isCompleted && !isReviewed && (
                          <button
                            type="button"
                            onClick={() => toggleBookingReminder(b.id)}
                            title={hasReminder ? "Reminder active (30m before). Click to disable." : "Click to set 30-min reminder"}
                            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                              hasReminder
                                ? 'bg-[#FFA987]/20 text-[#C05621] dark:text-[#FFA987] border border-[#FFA987]/30'
                                : 'bg-[#F3F6F5] dark:bg-[#105A60] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white border border-[#E2ECEB] dark:border-[#166D74]'
                            }`}
                          >
                            <Bell className="w-2.5 h-2.5" />
                            <span>{hasReminder ? '30m Alert On' : '+ Remind Me'}</span>
                          </button>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-[#12383B] dark:text-white truncate">{b.spaceTitle}</h3>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                        <span>{b.date}</span>
                        <span>•</span>
                        <span>
                          {formatTime(b.startTime)} – {formatTime(b.endTime || '17:00')} ({b.durationHours} hrs)
                        </span>
                        <span>•</span>
                        <span className="font-mono font-semibold text-[#006B70] dark:text-[#28D2CB]">{formatPrice(b.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#E2ECEB] dark:border-[#166D74]">
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
                        className="px-3.5 py-2 rounded-xl bg-[#FFA987] hover:bg-[#ff966f] text-[#006B70] text-xs font-bold flex items-center space-x-1.5 border border-[#FFA987]/40 shadow-xs cursor-pointer active:scale-95 transition-all"
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
                        className="px-4 py-2 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer transition-all"
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
                        className="px-3.5 py-2 rounded-xl bg-[#FFA987]/15 hover:bg-[#FFA987]/25 text-xs font-bold text-[#C05621] dark:text-[#FFA987] border border-[#FFA987]/30 flex items-center space-x-1.5 cursor-pointer transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-[#FFA987] text-[#FFA987]" />
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
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] text-xs font-semibold text-[#12383B] dark:text-white border border-[#E2ECEB] dark:border-[#166D74] cursor-pointer transition-colors"
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
