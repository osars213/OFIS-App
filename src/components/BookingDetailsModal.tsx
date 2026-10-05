import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  Bell, 
  CheckCircle2, 
  Check, 
  Star, 
  Plus, 
  LogOut,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookingLifecycleStatus } from '../types';

export const BookingDetailsModal: React.FC = () => {
  const {
    isBookingDetailsOpen,
    setIsBookingDetailsOpen,
    activeBookingDetails,
    setActiveDigitalPassBooking,
    setIsDigitalPassOpen,
    formatPrice,
    formatTime,
    toggleBookingReminder,
    bookings,
    cancelBooking,
    checkInGuest,
    checkOutBooking,
    extendBooking,
    setReviewSpace,
    setIsWriteReviewOpen,
    allSpaces,
  } = useApp();

  const [isExtending, setIsExtending] = useState(false);
  const [extensionMode, setExtensionMode] = useState<'hours' | 'days'>('hours');
  const [extensionHours, setExtensionHours] = useState(1);
  const [extensionDays, setExtensionDays] = useState(1);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isBookingDetailsOpen || !activeBookingDetails) return null;

  // Find latest state instance
  const b = bookings.find(item => item.id === activeBookingDetails.id) || activeBookingDetails;
  const isReminderOn = b.hasReminder ?? false;
  const matchedSpace = allSpaces.find(s => s.id === b.spaceId);
  const hourlyRate = matchedSpace?.pricePerHour || Math.round(b.totalAmount / (b.durationHours || 1)) || 3500;
  const dailyRate = matchedSpace?.pricePerDay || (matchedSpace?.pricePerHour ? matchedSpace.pricePerHour * 8 : hourlyRate * 8) || 25000;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCheckIn = () => {
    const res = checkInGuest(b.id);
    showToast(res.message);
  };

  const handleCheckOut = () => {
    const res = checkOutBooking(b.id);
    showToast(res.message);
  };

  const handleConfirmExtension = () => {
    const payload = extensionMode === 'days' 
      ? { additionalDays: extensionDays } 
      : { additionalHours: extensionHours };

    const res = extendBooking(b.id, payload, 'wallet');
    setIsExtending(false);
    showToast(res.message);
  };

  const handleOpenReview = () => {
    if (matchedSpace) {
      setReviewSpace(matchedSpace);
    }
    setIsBookingDetailsOpen(false);
    setIsWriteReviewOpen(true);
  };

  // Status mapping
  const statusColorMap: Record<BookingLifecycleStatus, { bg: string; text: string; label: string }> = {
    reserved: { bg: 'bg-[#FFA987]/20', text: 'text-[#C05621] dark:text-[#FFA987]', label: 'Reserved' },
    confirmed: { bg: 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20', text: 'text-[#006B70] dark:text-[#28D2CB]', label: 'Confirmed' },
    ready_for_checkin: { bg: 'bg-[#FFA987]/20', text: 'text-[#C05621] dark:text-[#FFA987]', label: 'Ready for Check-In' },
    checked_in: { bg: 'bg-[#14BEB8]/20 dark:bg-[#14BEB8]/25', text: 'text-[#006B70] dark:text-[#28D2CB]', label: 'Checked In' },
    active: { bg: 'bg-[#14BEB8]/20 dark:bg-[#14BEB8]/25', text: 'text-[#006B70] dark:text-[#28D2CB]', label: 'In Progress' },
    in_progress: { bg: 'bg-[#14BEB8]/20 dark:bg-[#14BEB8]/25', text: 'text-[#006B70] dark:text-[#28D2CB]', label: 'In Progress' },
    completed: { bg: 'bg-[#F3F6F5] dark:bg-[#105A60]', text: 'text-[#5D7A7D] dark:text-[#B8D1D0]', label: 'Completed' },
    reviewed: { bg: 'bg-[#14BEB8]/15', text: 'text-[#006B70] dark:text-[#28D2CB]', label: 'Reviewed' },
    cancelled: { bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400', label: 'Cancelled' },
  };

  const statusInfo = statusColorMap[b.status] || { bg: 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20', text: 'text-[#006B70] dark:text-[#28D2CB]', label: b.status };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#07383D] rounded-3xl border border-[#E2ECEB] dark:border-[#166D74] shadow-2xl p-5 sm:p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2ECEB] dark:border-[#166D74] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-[#006B70] dark:text-[#28D2CB] font-bold uppercase">{b.id}</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#12383B] dark:text-white mt-0.5">Booking &amp; Access Summary</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsBookingDetailsOpen(false)}
            className="p-2 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Space Preview */}
        <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74]">
          <img src={b.spaceImage} alt={b.spaceTitle} className="w-16 h-16 rounded-xl object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#12383B] dark:text-white truncate">{b.spaceTitle}</h4>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] truncate">{b.spaceAddress}</p>
            <p className="text-[11px] text-[#006B70] dark:text-[#28D2CB] font-mono mt-0.5">Turnstile Pass: {b.digitalPassCode}</p>
          </div>
        </div>

        {/* Schedule & Financial Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-1">
            <span className="text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FFA987]" />
              <span>Schedule</span>
            </span>
            <div className="font-bold text-[#12383B] dark:text-white">{b.date}</div>
            <div className="text-[#006B70] dark:text-[#28D2CB] font-medium">
              {formatTime(b.startTime)} – {formatTime(b.endTime || '17:00')} ({b.durationHours}h)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] space-y-1">
            <span className="text-[#5D7A7D] dark:text-[#B8D1D0]">Total Amount</span>
            <div className="font-bold text-[#12383B] dark:text-white font-mono text-sm">{formatPrice(b.totalAmount)}</div>
            <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] uppercase">Paid via {b.paymentMethod}</div>
          </div>
        </div>

        {/* Extension sub-panel */}
        {isExtending && (
          <div className="p-4 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#14BEB8]/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#006B70] dark:text-[#28D2CB] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFA987]" />
                <span>Extend Your Stay &amp; Access</span>
              </span>
              <button
                type="button"
                onClick={() => setIsExtending(false)}
                className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Mode Switcher: Hourly vs Extended Days */}
            <div className="flex rounded-xl bg-white dark:bg-[#07383D] p-1 border border-[#E2ECEB] dark:border-[#166D74]">
              <button
                type="button"
                id="extend-mode-hours-btn"
                onClick={() => setExtensionMode('hours')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  extensionMode === 'hours'
                    ? 'bg-[#14BEB8] text-white font-bold shadow'
                    : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                }`}
              >
                Hourly Extension
              </button>
              <button
                type="button"
                id="extend-mode-days-btn"
                onClick={() => setExtensionMode('days')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  extensionMode === 'days'
                    ? 'bg-[#14BEB8] text-white font-bold shadow'
                    : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
                }`}
              >
                Book Extended Days
              </button>
            </div>

            {/* Hourly Selection */}
            {extensionMode === 'hours' ? (
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 2, 4].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setExtensionHours(hrs)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      extensionHours === hrs
                        ? 'bg-[#14BEB8] text-white'
                        : 'bg-white dark:bg-[#07383D] text-[#5D7A7D] dark:text-[#B8D1D0] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/40'
                    }`}
                  >
                    +{hrs === 0.5 ? '30m' : `${hrs}h`}
                  </button>
                ))}
              </div>
            ) : (
              /* Extended Days Selection */
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 5, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setExtensionDays(days)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      extensionDays === days
                        ? 'bg-[#14BEB8] text-white'
                        : 'bg-white dark:bg-[#07383D] text-[#5D7A7D] dark:text-[#B8D1D0] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/40'
                    }`}
                  >
                    +{days} {days === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E2ECEB] dark:border-[#166D74]">
              <span className="text-[#5D7A7D] dark:text-[#B8D1D0]">
                {extensionMode === 'days' 
                  ? `Additional Stay (${extensionDays} day${extensionDays > 1 ? 's' : ''} @ ${formatPrice(dailyRate)}/day)`
                  : `Additional Duration (${extensionHours}h @ ${formatPrice(hourlyRate)}/hr)`}
              </span>
              <span className="font-bold font-mono text-[#006B70] dark:text-[#28D2CB] text-sm">
                {formatPrice(
                  extensionMode === 'days'
                    ? Math.round(dailyRate * extensionDays)
                    : Math.round(hourlyRate * extensionHours)
                )}
              </span>
            </div>

            <button
              type="button"
              id="confirm-extend-booking-btn"
              onClick={handleConfirmExtension}
              className="w-full py-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>
                Confirm {extensionMode === 'days' ? `+${extensionDays} Extended Day(s)` : `+${extensionHours} Hour(s)`} Pass
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Remind Me Toggle */}
        <div 
          onClick={() => toggleBookingReminder(b.id)}
          className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/30 transition-all cursor-pointer select-none"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
              isReminderOn ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB]' : 'bg-[#F3F6F5] dark:bg-[#07383D] text-[#5D7A7D] dark:text-[#B8D1D0]'
            }`}>
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#12383B] dark:text-white flex items-center gap-1.5">
                <span>Remind me 30 mins before</span>
                {isReminderOn && (
                  <span className="text-[9px] font-mono text-[#006B70] dark:text-[#28D2CB] bg-[#14BEB8]/15 px-1 py-0.2 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">
                Alert triggers 30m prior to {formatTime(b.startTime)}
              </p>
            </div>
          </div>

          <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
            isReminderOn ? 'bg-[#14BEB8]' : 'bg-[#D1D5DB] dark:bg-[#166D74]'
          }`}>
            <div className={`bg-white dark:bg-[#07383D] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              isReminderOn ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-2 rounded-xl bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border border-[#14BEB8]/40 text-[#006B70] dark:text-[#28D2CB] text-xs font-semibold flex items-center justify-center space-x-1.5">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Cancellation confirmation box */}
        {isConfirmingCancel && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
            <div className="flex items-start space-x-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-600 dark:text-red-400">Cancel this workspace pass?</span>
                <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] mt-0.5">
                  Your reservation for {b.spaceTitle} will be released immediately.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmingCancel(false)}
                className="px-3 py-1.5 rounded-xl bg-[#F3F6F5] dark:bg-[#0B4A50] hover:bg-[#E2ECEB] dark:hover:bg-[#105A60] text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelBooking(b.id);
                  setIsConfirmingCancel(false);
                  showToast('Booking cancelled successfully.');
                }}
                className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Cancel Pass
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Contextual Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#E2ECEB] dark:border-[#166D74]">
          <div>
            {!b.checkedIn && b.status !== 'cancelled' && !isConfirmingCancel && (
              <button
                type="button"
                onClick={() => setIsConfirmingCancel(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Pass</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {/* Quick Check-In if not checked in */}
            {!b.checkedIn && b.status !== 'cancelled' && (
              <button
                type="button"
                onClick={handleCheckIn}
                className="px-3.5 py-2.5 rounded-xl bg-[#FFA987] hover:bg-[#ff966f] text-[#006B70] border border-[#FFA987]/40 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Check In</span>
              </button>
            )}

            {/* Quick Extend or Check out if checked in */}
            {b.checkedIn && !b.checkedOut && (
              <>
                <button
                  type="button"
                  onClick={() => setIsExtending(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] text-xs font-semibold text-[#006B70] dark:text-[#28D2CB] border border-[#14BEB8]/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Extend</span>
                </button>

                <button
                  type="button"
                  onClick={handleCheckOut}
                  className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-500 dark:text-red-400 border border-red-500/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Check Out</span>
                </button>
              </>
            )}

            {/* Review Space if completed */}
            {(b.checkedOut || b.status === 'completed') && b.status !== 'reviewed' && (
              <button
                type="button"
                onClick={handleOpenReview}
                className="px-3.5 py-2.5 rounded-xl bg-[#FFA987]/15 hover:bg-[#FFA987]/25 text-xs font-bold text-[#C05621] dark:text-[#FFA987] border border-[#FFA987]/30 flex items-center space-x-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-[#FFA987] text-[#FFA987]" />
                <span>Review Space</span>
              </button>
            )}

            {/* Digital Pass Primary Button */}
            {b.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => {
                  setIsBookingDetailsOpen(false);
                  setActiveDigitalPassBooking(b);
                  setIsDigitalPassOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Digital Pass</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
