import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Wallet, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  AlertCircle,
  QrCode,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bookingsService } from '../services/bookingsService';
import confetti from 'canvas-confetti';
import { Booking } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutSpace,
    currentUser,
    createBooking,
    setActivePassBooking,
    setCurrentView,
    currency,
    formatPrice,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'transfer' | 'ussd'>('wallet');
  const [selectedDate, setSelectedDate] = useState('Saturday, 22 August');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [durationHours, setDurationHours] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaymentFailed, setIsPaymentFailed] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  if (!isCheckoutOpen || !checkoutSpace) return null;

  const subtotal = checkoutSpace.pricePerHour * durationHours;
  const platformFee = 0;
  const totalAmount = subtotal + platformFee;

  // Calculate natural end time
  const getEndTime = (startTime: string, hours: number) => {
    if (startTime.includes('10:00 AM')) return hours === 1 ? '11:00 AM' : hours === 2 ? '12:00 PM' : hours === 3 ? '1:00 PM' : '2:00 PM';
    if (startTime.includes('12:00 PM')) return hours === 1 ? '1:00 PM' : hours === 2 ? '2:00 PM' : hours === 3 ? '3:00 PM' : '4:00 PM';
    if (startTime.includes('02:00 PM') || startTime.includes('2:00 PM')) return hours === 1 ? '3:00 PM' : hours === 2 ? '4:00 PM' : hours === 3 ? '5:00 PM' : '6:00 PM';
    if (startTime.includes('04:00 PM') || startTime.includes('4:00 PM')) return hours === 1 ? '5:00 PM' : hours === 2 ? '6:00 PM' : hours === 3 ? '7:00 PM' : '8:00 PM';
    return `${hours} hrs access`;
  };

  const formattedEndTime = getEndTime(selectedTimeSlot, durationHours);

  const handleConfirmPayment = () => {
    setErrorMessage(null);
    setIsPaymentFailed(false);
    setIsProcessing(true);

    // 1. Authoritative availability / conflict protection check
    const availability = bookingsService.checkBookingAvailability(
      checkoutSpace.id,
      selectedDate,
      selectedTimeSlot,
      durationHours
    );

    if (!availability.available) {
      setIsProcessing(false);
      setErrorMessage(availability.conflictMessage || 'That time has just been taken. Please choose another available time to continue.');
      return;
    }

    // 2. Check wallet balance if wallet payment
    if (paymentMethod === 'wallet' && currentUser.walletBalance < totalAmount) {
      setIsProcessing(false);
      setErrorMessage(`Insufficient wallet balance (${formatPrice(currentUser.walletBalance)}). Please choose Debit Card or top up your wallet.`);
      return;
    }

    // 3. Complete payment & pass issuance
    setTimeout(() => {
      setIsProcessing(false);
      const booking = createBooking({
        spaceId: checkoutSpace.id,
        spaceTitle: checkoutSpace.title,
        spaceImage: checkoutSpace.featuredImage,
        spaceAddress: checkoutSpace.address,
        spaceCity: checkoutSpace.city,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userPhone: currentUser.phone,
        bookingType: 'hourly',
        startDate: selectedDate,
        startTime: selectedTimeSlot,
        durationHours,
        guestsCount: 1,
        subtotal,
        serviceFee: platformFee,
        totalPrice: totalAmount,
        currency: currency,
        paymentStatus: 'paid',
        paymentMethod,
        paymentReference: `PSTK_${Math.floor(100000 + Math.random() * 900000)}`,
        bookingStatus: 'confirmed',
      });

      setCreatedBooking(booking);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00C878', '#00E58B', '#FFFFFF'],
        });
      } catch (e) {
        // Safe fallback
      }
    }, 850);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCreatedBooking(null);
    setErrorMessage(null);
    setIsPaymentFailed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-[#141816] rounded-2xl border border-[#232D28] shadow-2xl p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* State 1: Booking Confirmed (Payment Success) */}
        {createdBooking ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#00C878]/20 border border-[#00C878] flex items-center justify-center mx-auto text-[#00C878]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#F2F2F2]">Booking Confirmed</h3>
              <p className="text-xs text-[#9EABA3] max-w-xs mx-auto mt-1">
                Your space is booked. Your digital access pass is ready.
              </p>
            </div>

            {/* Confirmed Details */}
            <div className="p-4 rounded-xl bg-[#1A201D] border border-[#232D28] text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-[#232D28] pb-2">
                <span className="text-[#9EABA3]">Space</span>
                <span className="text-[#F2F2F2] font-semibold truncate max-w-[200px]">{checkoutSpace.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9EABA3]">Date</span>
                <span className="text-[#F2F2F2] font-semibold">{selectedDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9EABA3]">Time</span>
                <span className="text-[#F2F2F2] font-semibold">{selectedTimeSlot} – {formattedEndTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9EABA3]">Duration</span>
                <span className="text-[#F2F2F2] font-semibold">{durationHours} {durationHours === 1 ? 'hour' : 'hours'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9EABA3]">Amount Paid</span>
                <span className="font-mono text-[#00C878] font-bold text-sm">₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9EABA3]">Booking Reference</span>
                <span className="font-mono text-[#9EABA3]">{createdBooking.id}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#232D28]">
                <span className="text-[#9EABA3]">Turnstile PIN</span>
                <span className="font-mono text-[#00C878] font-bold text-sm">{createdBooking.passCode}</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setActivePassBooking(createdBooking);
                }}
                className="w-full sm:flex-1 py-3 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>View Digital Pass</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setCurrentView('explore');
                }}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#161D19] border border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2] text-xs font-semibold"
              >
                Explore More Spaces
              </button>
            </div>
          </div>
        ) : isPaymentFailed ? (
          /* State 2: Payment Failure State */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#F2F2F2]">Payment didn't go through</h3>
              <p className="text-xs text-[#9EABA3] max-w-xs mx-auto mt-1">
                Your booking hasn't been confirmed. Please try again.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPaymentFailed(false);
                  handleConfirmPayment();
                }}
                className="w-full sm:flex-1 py-3 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs shadow-lg"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => setIsPaymentFailed(false)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#161D19] border border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2] text-xs font-semibold"
              >
                Back to Booking
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Review Your Booking & Payment */
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E2522] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2]">Review Your Booking</h3>
                <p className="text-xs text-[#9EABA3]">{checkoutSpace.neighborhood}, {checkoutSpace.city}</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Space Summary */}
            <div className="p-3.5 rounded-xl bg-[#1A201D] border border-[#1E2522] flex items-center space-x-3">
              <img
                src={checkoutSpace.featuredImage}
                alt={checkoutSpace.title}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-[#F2F2F2] truncate">{checkoutSpace.title}</h4>
                <p className="text-[11px] text-[#9EABA3] mt-0.5">{checkoutSpace.category} • {checkoutSpace.address}</p>
                <div className="flex items-center space-x-1 text-[11px] text-[#00C878] mt-0.5 font-medium">
                  <Zap className="w-3 h-3" />
                  <span>24/7 Verified Solar Power</span>
                </div>
              </div>
            </div>

            {/* Schedule / Date Selection */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#9EABA3] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#00C878]" />
                  <span>Date</span>
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161D19] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                >
                  <option value="Saturday, 22 August">Saturday, 22 August (Today)</option>
                  <option value="Sunday, 23 August">Sunday, 23 August (Tomorrow)</option>
                  <option value="Monday, 24 August">Monday, 24 August</option>
                  <option value="Tuesday, 25 August">Tuesday, 25 August</option>
                  <option value="Wednesday, 26 August">Wednesday, 26 August</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#9EABA3] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#00C878]" />
                  <span>Start Time</span>
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161D19] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878]"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#9EABA3]">Duration</label>
                <span className="text-[11px] text-[#00C878] font-medium">{selectedTimeSlot} – {formattedEndTime}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDurationHours(hrs)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      durationHours === hrs
                        ? 'bg-[#00C878] text-[#0D0D0D] border-[#00C878]'
                        : 'bg-[#161D19] border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]'
                    }`}
                  >
                    {hrs} {hrs === 1 ? 'hour' : 'hours'}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#9EABA3]">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl text-left border flex items-center space-x-2.5 transition-all ${
                    paymentMethod === 'wallet'
                      ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                      : 'bg-[#161D19] border-[#232D28] text-[#9EABA3]'
                  }`}
                >
                  <Wallet className="w-4 h-4 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">OFIS Wallet</p>
                    <p className="text-[10px] text-[#718079]">{formatPrice(currentUser.walletBalance)}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl text-left border flex items-center space-x-2.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-[#00C878]/15 border-[#00C878] text-[#00C878]'
                      : 'bg-[#161D19] border-[#232D28] text-[#9EABA3]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">Debit Card</p>
                    <p className="text-[10px] text-[#718079]">Paystack / Bank Card</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-[#1A201D] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#9EABA3]">
                <span>Space ({durationHours} hrs × {formatPrice(checkoutSpace.pricePerHour)})</span>
                <span className="font-mono text-[#F2F2F2]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#9EABA3]">
                <span>Service Fee</span>
                <span className="text-[#00C878] font-semibold">{formatPrice(0)} (Free)</span>
              </div>
              <div className="pt-2 border-t border-[#232D28] flex justify-between items-center font-bold text-sm text-[#F2F2F2]">
                <span>Total</span>
                <span className="text-[#00C878] font-mono text-base font-extrabold">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Confirm Payment CTA */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmPayment}
              className="w-full py-3.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-extrabold text-sm transition-all shadow-[0_4px_16px_rgba(0,200,120,0.3)] active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <span>Processing your payment…</span>
                  <span className="text-[11px] font-normal opacity-80">Please don't close this page.</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {formatPrice(totalAmount)}</span>
                </>
              )}
            </button>

            {/* Supporting Trust Copy */}
            <div className="flex items-center justify-center space-x-2 text-[11px] text-[#718079]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Clear pricing • Secure payment • Instant booking</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
