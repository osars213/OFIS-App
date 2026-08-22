import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  CreditCard, 
  QrCode, 
  Navigation, 
  PhoneCall, 
  MessageSquarePlus, 
  AlertTriangle,
  Copy,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { reviewsService } from '../services/reviewsService';

export const BookingDetailsModal: React.FC = () => {
  const {
    selectedBookingDetails,
    setSelectedBookingDetails,
    setActivePassBooking,
    cancelBooking,
    setContactHostData,
    setDirectionsData,
    setWriteReviewModalData,
    currentUser,
    userBookings,
    showToast,
    formatPrice,
  } = useApp();

  if (!selectedBookingDetails) return null;

  const booking = selectedBookingDetails;
  const isConfirmed = booking.bookingStatus === 'confirmed';
  const isActive = booking.bookingStatus === 'active';
  const isCompleted = booking.bookingStatus === 'completed';
  const isCancelled = booking.bookingStatus === 'cancelled';

  // Check if review is permitted for this space
  const reviewEligibility = reviewsService.canUserReviewSpace(currentUser.id, booking.spaceId, userBookings);

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard`);
    }
  };

  const getStatusBadge = () => {
    switch (booking.bookingStatus) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30">Confirmed</span>;
      case 'active':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#00C878] text-[#0D0D0D] animate-pulse">Active Session</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#232D28] text-[#9EABA3]">Completed Stay</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Cancelled & Refunded</span>;
      default:
        return null;
    }
  };

  const getPaymentBadge = () => {
    switch (booking.paymentStatus) {
      case 'paid':
        return <span className="text-[11px] font-semibold text-[#00C878] flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Payment Successful</span>;
      case 'pending':
        return <span className="text-[11px] font-semibold text-amber-400">Payment Pending</span>;
      case 'refunded':
        return <span className="text-[11px] font-semibold text-[#9EABA3]">Refunded to Wallet</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-[#141816] rounded-2xl border border-[#232D28] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2522] bg-[#101412]">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-[#F2F2F2]">Booking Details</h3>
            <span className="text-xs font-mono text-[#718079] bg-[#161D19] px-2 py-0.5 rounded border border-[#232D28]">
              {booking.id}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedBookingDetails(null)}
            className="p-1.5 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Space Card */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-[#17201B] border border-[#232D28]">
            <img
              src={booking.spaceImage}
              alt={booking.spaceTitle}
              className="w-full sm:w-28 h-24 rounded-lg object-cover shrink-0"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-[#F2F2F2] truncate">{booking.spaceTitle}</h4>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-[#9EABA3] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                <span className="truncate">{booking.spaceAddress}</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-[#00C878] font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>24/7 Verified Solar Power</span>
                </span>
                <span className="text-[11px] text-[#718079]">•</span>
                <span className="text-[11px] text-[#9EABA3]">{booking.spaceCity}</span>
              </div>
            </div>
          </div>

          {/* Reservation Breakdown */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#718079]">Reservation Schedule</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#161D19] border border-[#1E2522] space-y-1">
                <span className="text-[11px] text-[#718079] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#00C878]" />
                  <span>Date</span>
                </span>
                <p className="text-xs font-semibold text-[#F2F2F2]">{booking.startDate}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#161D19] border border-[#1E2522] space-y-1">
                <span className="text-[11px] text-[#718079] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#00C878]" />
                  <span>Time / Duration</span>
                </span>
                <p className="text-xs font-semibold text-[#F2F2F2]">
                  {booking.startTime || 'Standard Access'} ({booking.durationHours} hrs)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#161D19] border border-[#1E2522] space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[#718079] flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#00C878]" />
                  <span>Reserved Seats</span>
                </span>
                <p className="text-xs font-semibold text-[#F2F2F2]">
                  {booking.selectedSeats?.join(', ') || `${booking.guestsCount} Guest(s)`}
                </p>
              </div>
            </div>
          </div>

          {/* Digital Access Information */}
          {(isConfirmed || isActive) && (
            <div className="p-4 rounded-xl bg-[#111714] border border-[#00C878]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#00C878]" />
                  <h5 className="text-xs font-bold text-[#F2F2F2]">Digital Access Pass</h5>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBookingDetails(null);
                    setActivePassBooking(booking);
                  }}
                  className="text-xs font-bold text-[#00C878] hover:underline"
                >
                  View Digital Pass
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between bg-[#161D19] px-3 py-2 rounded-lg border border-[#232D28]">
                  <div>
                    <span className="text-[10px] text-[#718079]">Turnstile PIN</span>
                    <p className="font-mono text-sm font-bold text-[#00C878]">{booking.passCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(booking.passCode, 'Turnstile PIN')}
                    className="p-1 text-[#718079] hover:text-[#00C878]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {booking.wifiPassword && (
                  <div className="flex items-center justify-between bg-[#161D19] px-3 py-2 rounded-lg border border-[#232D28]">
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-[#718079] flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-[#00C878]" />
                        <span>WiFi: {booking.wifiSsid || 'OFIS High-Speed'}</span>
                      </span>
                      <p className="font-mono text-xs font-semibold text-[#F2F2F2] truncate">{booking.wifiPassword}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(booking.wifiPassword || '', 'WiFi Password')}
                      className="p-1 text-[#718079] hover:text-[#00C878]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {booking.accessInstructions && (
                <p className="text-[11px] text-[#9EABA3] leading-relaxed pt-1">
                  💡 {booking.accessInstructions}
                </p>
              )}
            </div>
          )}

          {/* Payment Breakdown */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#718079]">Payment Breakdown</h5>
            <div className="p-4 rounded-xl bg-[#161D19] border border-[#1E2522] space-y-2 text-xs">
              <div className="flex justify-between text-[#9EABA3]">
                <span>Space ({booking.durationHours || 1} hrs)</span>
                <span className="font-mono text-[#F2F2F2]">{formatPrice(booking.subtotal || booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[#9EABA3]">
                <span>Service Fee</span>
                <span className="text-[#00C878] font-semibold">{formatPrice(0)} (Free)</span>
              </div>
              <div className="pt-2 border-t border-[#232D28] flex justify-between items-center text-sm font-bold text-[#F2F2F2]">
                <div className="flex items-center gap-2">
                  <span>Total</span>
                  {getPaymentBadge()}
                </div>
                <span className="text-[#00C878] font-mono text-base font-extrabold">{formatPrice(booking.totalPrice)}</span>
              </div>
              {booking.paymentReference && (
                <div className="pt-1 text-[10px] text-[#718079] flex justify-between">
                  <span>Booking Reference</span>
                  <span className="font-mono">{booking.paymentReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contextual Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            
            {/* Get Directions */}
            <button
              type="button"
              onClick={() => {
                setDirectionsData({
                  address: booking.spaceAddress,
                  city: booking.spaceCity,
                  title: booking.spaceTitle
                });
              }}
              className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-[#161D19] hover:bg-[#1C2520] border border-[#232D28] hover:border-[#00C878]/40 text-xs font-semibold text-[#F2F2F2] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Get Directions</span>
            </button>

            {/* Contact Host */}
            <button
              type="button"
              onClick={() => {
                setContactHostData({
                  hostName: 'Space Concierge',
                  spaceTitle: booking.spaceTitle,
                  phone: '+234 803 456 7890',
                  email: 'concierge@ofis.ng'
                });
              }}
              className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-[#161D19] hover:bg-[#1C2520] border border-[#232D28] hover:border-[#00C878]/40 text-xs font-semibold text-[#F2F2F2] flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Contact Host</span>
            </button>

            {/* Review Action (Only for completed stays) */}
            {isCompleted && (
              <button
                type="button"
                disabled={!reviewEligibility.canReview}
                onClick={() => {
                  if (reviewEligibility.canReview) {
                    setWriteReviewModalData({
                      spaceId: booking.spaceId,
                      spaceTitle: booking.spaceTitle
                    });
                  } else {
                    showToast(reviewEligibility.reason || 'Review already submitted');
                  }
                }}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  reviewEligibility.canReview
                    ? 'bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] shadow-md'
                    : 'bg-[#161D19] border border-[#232D28] text-[#718079] cursor-not-allowed'
                }`}
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>{reviewEligibility.canReview ? 'Leave a Verified Review' : 'Verified Review Submitted'}</span>
              </button>
            )}

            {/* Cancel Booking (Only for confirmed/upcoming) */}
            {isConfirmed && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this booking? The full amount will be refunded immediately to your OFIS wallet.')) {
                    cancelBooking(booking.id);
                    setSelectedBookingDetails(null);
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#1A1616] hover:bg-rose-950/40 border border-rose-500/30 text-xs font-semibold text-rose-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cancel Booking & Refund</span>
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
