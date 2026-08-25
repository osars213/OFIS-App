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
  const [extensionHours, setExtensionHours] = useState(1);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isBookingDetailsOpen || !activeBookingDetails) return null;

  // Find latest state instance
  const b = bookings.find(item => item.id === activeBookingDetails.id) || activeBookingDetails;
  const isReminderOn = b.hasReminder ?? false;
  const matchedSpace = allSpaces.find(s => s.id === b.spaceId);
  const hourlyRate = matchedSpace?.pricePerHour || Math.round(b.totalAmount / b.durationHours) || 3500;

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
    const res = extendBooking(b.id, extensionHours, 'wallet');
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
    reserved: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Reserved' },
    confirmed: { bg: 'bg-[#00C878]/15', text: 'text-[#00C878]', label: 'Confirmed' },
    ready_for_checkin: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Ready for Check-In' },
    checked_in: { bg: 'bg-[#00C878]/20', text: 'text-[#00C878]', label: 'Checked In' },
    active: { bg: 'bg-[#00C878]/20', text: 'text-[#00C878]', label: 'In Progress' },
    in_progress: { bg: 'bg-[#00C878]/20', text: 'text-[#00C878]', label: 'In Progress' },
    completed: { bg: 'bg-neutral-500/20', text: 'text-neutral-300', label: 'Completed' },
    reviewed: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', label: 'Reviewed' },
    cancelled: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Cancelled' },
  };

  const statusInfo = statusColorMap[b.status] || { bg: 'bg-[#00C878]/15', text: 'text-[#00C878]', label: b.status };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-5 sm:p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-[#00C878] font-bold uppercase">{b.id}</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#F2F2F2] mt-0.5">Booking & Access Summary</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsBookingDetailsOpen(false)}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Space Preview */}
        <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#18201B] border border-[#232D28]">
          <img src={b.spaceImage} alt={b.spaceTitle} className="w-16 h-16 rounded-xl object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#F2F2F2] truncate">{b.spaceTitle}</h4>
            <p className="text-xs text-[#718079] truncate">{b.spaceAddress}</p>
            <p className="text-[11px] text-[#00C878] font-mono mt-0.5">Turnstile Pass: {b.digitalPassCode}</p>
          </div>
        </div>

        {/* Schedule & Financial Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#18201B] border border-[#232D28] space-y-1">
            <span className="text-[#718079] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#00C878]" />
              <span>Schedule</span>
            </span>
            <div className="font-bold text-[#F2F2F2]">{b.date}</div>
            <div className="text-[#00C878] font-medium">
              {formatTime(b.startTime)} – {formatTime(b.endTime || '17:00')} ({b.durationHours}h)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#18201B] border border-[#232D28] space-y-1">
            <span className="text-[#718079]">Total Amount</span>
            <div className="font-bold text-[#F2F2F2] font-mono text-sm">{formatPrice(b.totalAmount)}</div>
            <div className="text-[10px] text-[#718079] uppercase">Paid via {b.paymentMethod}</div>
          </div>
        </div>

        {/* Extension sub-panel */}
        {isExtending && (
          <div className="p-4 rounded-2xl bg-[#151B18] border border-[#00C878]/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00C878] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extend Stay</span>
              </span>
              <button
                type="button"
                onClick={() => setIsExtending(false)}
                className="text-xs text-[#718079] hover:text-[#F2F2F2]"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 4].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setExtensionHours(hrs)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                    extensionHours === hrs
                      ? 'bg-[#00C878] text-[#0D0D0D]'
                      : 'bg-[#18201B] text-[#9EABA3] border border-[#232D28]'
                  }`}
                >
                  +{hrs === 0.5 ? '30m' : `${hrs}h`}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#718079]">Additional Cost</span>
              <span className="font-bold font-mono text-[#00C878]">
                {formatPrice(Math.round(hourlyRate * extensionHours))}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmExtension}
              className="w-full py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Confirm Extension</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Remind Me Toggle */}
        <div 
          onClick={() => toggleBookingReminder(b.id)}
          className="flex items-center justify-between p-3 rounded-2xl bg-[#18201B] border border-[#232D28] hover:border-[#00C878]/30 transition-all cursor-pointer select-none"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
              isReminderOn ? 'bg-[#00C878]/20 text-[#00C878]' : 'bg-[#141816] text-[#718079]'
            }`}>
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F2F2F2] flex items-center gap-1.5">
                <span>Remind me 30 mins before</span>
                {isReminderOn && (
                  <span className="text-[9px] font-mono text-[#00C878] bg-[#00C878]/10 px-1 py-0.2 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#718079]">
                Alert triggers 30m prior to {formatTime(b.startTime)}
              </p>
            </div>
          </div>

          <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
            isReminderOn ? 'bg-[#00C878]' : 'bg-[#232D28]'
          }`}>
            <div className={`bg-[#0D0D0D] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              isReminderOn ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-2 rounded-xl bg-[#00C878]/15 border border-[#00C878]/40 text-[#00C878] text-xs font-semibold flex items-center justify-center space-x-1.5">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Cancellation confirmation box */}
        {isConfirmingCancel && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
            <div className="flex items-start space-x-2.5 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-400">Cancel this workspace pass?</span>
                <p className="text-[11px] text-[#9EABA3] mt-0.5">
                  Your reservation for {b.spaceTitle} will be released immediately.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmingCancel(false)}
                className="px-3 py-1.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-xs font-semibold text-[#9EABA3]"
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
                className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-[#0D0D0D] text-xs font-bold"
              >
                Yes, Cancel Pass
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Contextual Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#1E2522]">
          <div>
            {!b.checkedIn && b.status !== 'cancelled' && !isConfirmingCancel && (
              <button
                type="button"
                onClick={() => setIsConfirmingCancel(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-1.5 cursor-pointer"
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
                className="px-3.5 py-2.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-xs font-semibold text-[#00C878] border border-[#00C878]/30 flex items-center space-x-1.5 cursor-pointer"
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
                  className="px-3.5 py-2.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-xs font-semibold text-[#00C878] border border-[#00C878]/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Extend</span>
                </button>

                <button
                  type="button"
                  onClick={handleCheckOut}
                  className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 border border-red-500/30 flex items-center space-x-1.5 cursor-pointer"
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
                className="px-3.5 py-2.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-xs font-semibold text-amber-400 border border-amber-400/30 flex items-center space-x-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400" />
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
                className="px-5 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95 cursor-pointer"
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
