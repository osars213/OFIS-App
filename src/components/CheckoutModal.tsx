import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Wallet, 
  Bell, 
  Layers,
  AlertTriangle,
  Mail,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { getSpacePricing, calculateBookingPrice, formatSpaceRate, formatPriceNGN } from '../utils/pricing';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutSpace,
    currentUser,
    createBooking,
    setActiveDigitalPassBooking,
    setIsDigitalPassOpen,
    checkoutPrefillSlot,
    formatPrice,
    formatTime,
    openEmailVerificationModal,
    verifyUserEmail,
    triggerAppAction,
  } = useApp();

  const isEmailVerified = currentUser?.isEmailVerified ?? false;
  const todayStr = new Date().toISOString().split('T')[0];
  const [quantity, setQuantity] = useState(2); // hours, days, months, or sessions
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [guests, setGuests] = useState(1);
  const [remindMe, setRemindMe] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'wallet'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isCheckoutOpen && checkoutPrefillSlot) {
      if (checkoutPrefillSlot.date) {
        setDate(checkoutPrefillSlot.date);
      }
      if (checkoutPrefillSlot.startTime) {
        setStartTime(checkoutPrefillSlot.startTime);
      }
    }
  }, [isCheckoutOpen, checkoutPrefillSlot]);

  // Adjust default quantity based on pricing period
  useEffect(() => {
    if (checkoutSpace) {
      const pricing = getSpacePricing(checkoutSpace);
      if (pricing.period === 'hour') {
        setQuantity(2);
      } else if (pricing.period === 'day') {
        setQuantity(1);
      } else if (pricing.period === 'month') {
        setQuantity(1);
      } else if (pricing.period === 'session') {
        setQuantity(1);
      }
    }
  }, [checkoutSpace]);

  if (!isCheckoutOpen || !checkoutSpace) return null;

  const pricing = getSpacePricing(checkoutSpace);
  const maxCapacity = checkoutSpace.capacity || 20;

  const breakdown = calculateBookingPrice(checkoutSpace, {
    quantity,
    guests,
    durationHours: pricing.period === 'hour' ? quantity : (pricing.sessionDurationHours ? pricing.sessionDurationHours * quantity : quantity * 8),
  });

  const handleConfirmPay = () => {
    // 🔒 Gating Check: User must verify email before payment
    if (!currentUser.isEmailVerified) {
      openEmailVerificationModal('payment');
      return;
    }

    setIsProcessing(true);
    triggerAppAction(3000);

    setTimeout(() => {
      const durationHoursCalculated = pricing.period === 'hour' 
        ? quantity 
        : (pricing.sessionDurationHours ? pricing.sessionDurationHours * quantity : quantity * 8);

      const newBooking = createBooking({
        spaceId: checkoutSpace.id,
        spaceTitle: checkoutSpace.title,
        spaceImage: checkoutSpace.featuredImage,
        spaceAddress: checkoutSpace.address,
        spaceCity: checkoutSpace.city,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userPhone: currentUser.phone,
        date,
        startTime,
        durationHours: durationHoursCalculated,
        guestCount: pricing.basis === 'person' ? guests : 1,
        totalAmount: breakdown.totalAmount,
        currency: 'NGN',
        status: 'confirmed',
        hasReminder: remindMe,
        pricingBasis: pricing.basis,
        pricingPeriod: pricing.period,
        pricingModel: pricing,
        priceBreakdown: breakdown,
        paymentMethod: paymentMethod === 'wallet' ? 'wallet' : 'paystack',
        paymentReference: `pstk_${Math.random().toString(36).substring(7)}`,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00C878', '#FFFFFF', '#141816'],
        });
      } catch (e) {
        // Safe fallback if confetti canvas not ready
      }

      setIsProcessing(false);
      setIsCheckoutOpen(false);
      setActiveDigitalPassBooking(newBooking);
      setIsDigitalPassOpen(true);
    }, 1000);
  };

  const timeOptions = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#141816] rounded-3xl border border-[#E5E7EB] dark:border-[#232D28] shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#1E2522] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F2F2F2]">Instant Pass Reservation</h3>
              <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] dark:bg-[#16A34A]/15 text-[#16A34A] px-2 py-0.5 rounded-full border border-[#16A34A]/30 uppercase">
                {pricing.basis === 'person' ? 'Per Person' : 'Whole Space'} • {pricing.period}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#718079] mt-0.5 truncate max-w-sm">{checkoutSpace.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl text-[#6B7280] dark:text-[#718079] hover:text-[#111827] dark:hover:text-[#F2F2F2] hover:bg-[#F1F5F9] dark:hover:bg-[#18201B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Space Summary Card */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28]">
          <img
            src={checkoutSpace.featuredImage}
            alt={checkoutSpace.title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#111827] dark:text-[#F2F2F2] truncate">{checkoutSpace.title}</h4>
            <p className="text-[11px] text-[#6B7280] dark:text-[#718079]">{checkoutSpace.neighborhood}, {checkoutSpace.city}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-[#16A34A]">
                {formatSpaceRate(checkoutSpace)}
              </span>
              {pricing.sessionDurationHours && (
                <span className="text-[10px] text-[#6B7280] dark:text-[#718079] bg-white dark:bg-[#141816] px-1.5 py-0.5 rounded border border-[#E5E7EB] dark:border-[#232D28]">
                  {pricing.sessionDurationHours}h block
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Controls: Date, Period Quantity & Guest Count */}
        <div className="space-y-3">
          {/* Reservation Date */}
          <div className="space-y-1">
            <label className="text-[11px] text-[#6B7280] dark:text-[#718079] font-semibold flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Reservation Date</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                min={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-white dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-xs text-[#111827] dark:text-[#F2F2F2] focus:outline-none focus:border-[#16A34A] font-mono cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  date === todayStr
                    ? 'bg-[#16A34A] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#18201B] text-[#6B7280] dark:text-[#9EABA3] border border-[#E5E7EB] dark:border-[#232D28] hover:text-[#111827] dark:hover:text-[#F2F2F2]'
                }`}
              >
                Today
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Period / Quantity Selector */}
            <div className="space-y-1">
              <label className="text-[11px] text-[#6B7280] dark:text-[#718079] font-semibold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>
                  {pricing.period === 'hour' && 'Duration (Hours)'}
                  {pricing.period === 'day' && 'Duration (Days)'}
                  {pricing.period === 'month' && 'Duration (Months)'}
                  {pricing.period === 'session' && 'Session Quantity'}
                </span>
              </label>

              {pricing.period === 'hour' && (
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-xs text-[#111827] dark:text-[#F2F2F2] focus:outline-none focus:border-[#16A34A] cursor-pointer font-mono"
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours (Half-Day)</option>
                  <option value={8}>8 Hours (Full-Day)</option>
                  <option value={12}>12 Hours (Sprint Day)</option>
                </select>
              )}

              {pricing.period === 'day' && (
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-xs text-[#111827] dark:text-[#F2F2F2] focus:outline-none focus:border-[#16A34A] cursor-pointer font-mono"
                >
                  <option value={1}>1 Day Pass</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days</option>
                  <option value={5}>5 Days (Work Week)</option>
                  <option value={7}>7 Days (Full Week)</option>
                  <option value={14}>14 Days (Bi-weekly)</option>
                </select>
              )}

              {pricing.period === 'month' && (
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-xs text-[#111827] dark:text-[#F2F2F2] focus:outline-none focus:border-[#16A34A] cursor-pointer font-mono"
                >
                  <option value={1}>1 Month (Flexible)</option>
                  <option value={3}>3 Months (Quarterly)</option>
                  <option value={6}>6 Months (Semi-annual)</option>
                  <option value={12}>12 Months (Annual)</option>
                </select>
              )}

              {pricing.period === 'session' && (
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-xs text-[#111827] dark:text-[#F2F2F2] focus:outline-none focus:border-[#16A34A] cursor-pointer font-mono"
                >
                  <option value={1}>1 Session {pricing.sessionDurationHours ? `(${pricing.sessionDurationHours} hrs)` : ''}</option>
                  <option value={2}>2 Sessions</option>
                  <option value={3}>3 Sessions</option>
                  <option value={4}>4 Sessions</option>
                </select>
              )}
            </div>

            {/* Start Time */}
            <div className="space-y-1">
              <label className="text-[11px] text-[#6B7280] dark:text-[#718079] font-semibold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Start Time</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-xs text-[#111827] dark:text-[#F2F2F2] focus:outline-none focus:border-[#16A34A] cursor-pointer font-mono"
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {formatTime(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Guest Count (If Per Person basis or multiple people) */}
          {pricing.basis === 'person' ? (
            <div className="space-y-1">
              <label className="text-[11px] text-[#6B7280] dark:text-[#718079] font-semibold flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Number of People / Seats</span>
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-[#718079]">Max: {maxCapacity} seats</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-10 h-9 rounded-xl bg-white dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-sm font-bold text-[#111827] dark:text-[#F2F2F2] hover:bg-[#F1F5F9] dark:hover:bg-[#232D28] cursor-pointer flex items-center justify-center shadow-2xs"
                >
                  -
                </button>
                <div className="flex-1 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-center font-mono text-xs font-bold text-[#16A34A]">
                  {guests} {guests === 1 ? 'Person' : 'People'}
                </div>
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(maxCapacity, guests + 1))}
                  className="w-10 h-9 rounded-xl bg-white dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] text-sm font-bold text-[#111827] dark:text-[#F2F2F2] hover:bg-[#F1F5F9] dark:hover:bg-[#232D28] cursor-pointer flex items-center justify-center shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#18201B]/60 border border-[#E5E7EB] dark:border-[#232D28] flex items-center justify-between text-xs text-[#6B7280] dark:text-[#718079]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Entire Space Buyout</span>
              </span>
              <span className="text-[11px] text-[#4B5563] dark:text-[#9EABA3] font-mono">
                Up to {maxCapacity} Attendees Included
              </span>
            </div>
          )}
        </div>

        {/* Remind Me 30-Min Toggle */}
        <div 
          id="checkout-remind-toggle"
          onClick={() => setRemindMe(!remindMe)}
          className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] hover:border-[#16A34A]/30 transition-all cursor-pointer select-none"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              remindMe ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A]' : 'bg-white dark:bg-[#141816] text-[#6B7280] dark:text-[#718079]'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#111827] dark:text-[#F2F2F2] flex items-center gap-1.5">
                <span>Remind Me</span>
                <span className="text-[10px] font-mono text-[#16A34A] bg-[#DCFCE7] dark:bg-[#16A34A]/10 px-1.5 py-0.2 rounded border border-[#16A34A]/20">
                  30m before
                </span>
              </div>
              <p className="text-[10px] text-[#6B7280] dark:text-[#718079]">
                Get instant notification & entrance pass code 30 minutes before {formatTime(startTime)}
              </p>
            </div>
          </div>

          <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
            remindMe ? 'bg-[#16A34A]' : 'bg-[#E5E7EB] dark:bg-[#232D28]'
          }`}>
            <div className={`bg-white dark:bg-[#0D0D0D] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              remindMe ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
        </div>

        {/* Payment Channels */}
        <div className="space-y-2">
          <label className="text-[11px] text-[#6B7280] dark:text-[#718079] font-semibold uppercase tracking-wider font-mono">
            Payment Method
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('paystack')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'paystack'
                  ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/15 border-[#16A34A] text-[#111827] dark:text-[#F2F2F2]'
                  : 'bg-[#F8FAFC] dark:bg-[#18201B] border-[#E5E7EB] dark:border-[#232D28] text-[#6B7280] dark:text-[#9EABA3]'
              }`}
            >
              <div className="text-xs font-bold">Paystack / Bank Card</div>
              <p className="text-[10px] text-[#6B7280] dark:text-[#718079]">Mastercard, Visa, Verve</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'wallet'
                  ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/15 border-[#16A34A] text-[#111827] dark:text-[#F2F2F2]'
                  : 'bg-[#F8FAFC] dark:bg-[#18201B] border-[#E5E7EB] dark:border-[#232D28] text-[#6B7280] dark:text-[#9EABA3]'
              }`}
            >
              <div className="text-xs font-bold">OFIS Wallet</div>
              <p className="text-[10px] text-[#6B7280] dark:text-[#718079]">₦{(currentUser?.walletBalanceNgn ?? 0).toLocaleString()} Avail.</p>
            </button>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#18201B] border border-[#E5E7EB] dark:border-[#232D28] space-y-2 text-xs">
          <div className="flex justify-between text-[#6B7280] dark:text-[#718079]">
            <span>Base Rate ({breakdown.rateDescription})</span>
            <span className="text-[#111827] dark:text-[#F2F2F2] font-mono">{formatPrice(breakdown.subtotal)}</span>
          </div>
          {breakdown.discount > 0 && (
            <div className="flex justify-between text-[#16A34A]">
              <span>Duration Discount</span>
              <span className="font-mono">-{formatPrice(breakdown.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#6B7280] dark:text-[#718079]">
            <span>Power & High-Speed Internet Access</span>
            <span className="text-[#16A34A] font-medium">Included Free</span>
          </div>
          <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#232D28] flex justify-between font-bold text-sm text-[#111827] dark:text-[#F2F2F2]">
            <span>Total Pass Cost</span>
            <span className="text-[#16A34A] font-mono">{formatPrice(breakdown.totalAmount)}</span>
          </div>
        </div>

        {/* Email Verification Gate Banner */}
        {!isEmailVerified && (
          <div className="p-3.5 rounded-2xl bg-[#FEF3C7] dark:bg-[#FFB800]/10 border border-[#F59E0B]/30 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2 text-[#D97706] dark:text-[#FFB800]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Email Verification Required to Pay</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#FDE68A] dark:bg-[#FFB800]/20 text-[#B45309] dark:text-[#FFB800] px-2 py-0.5 rounded-full font-bold">
                Unverified
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9EABA3]">
              To protect the community and guarantee turnstile pass delivery, OFIS requires email confirmation (<span className="text-[#111827] dark:text-[#F2F2F2] font-mono">{currentUser?.email}</span>) before processing payments.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => openEmailVerificationModal('payment')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Verify Email Address Now</span>
              </button>
              <button
                type="button"
                onClick={() => verifyUserEmail()}
                className="py-2 px-3 rounded-xl bg-white dark:bg-[#18201B] hover:bg-[#F1F5F9] dark:hover:bg-[#232D28] border border-[#F59E0B]/40 text-[#D97706] dark:text-[#FFB800] text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                title="Instant 1-click verification for testing"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Tap</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleConfirmPay}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer ${
            !isEmailVerified
              ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
              : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
          }`}
        >
          {isProcessing ? (
            <span>Securing Pass...</span>
          ) : !isEmailVerified ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Verify Email to Authorize Pass ({formatPrice(breakdown.totalAmount)})</span>
            </>
          ) : (
            <>
              <span>Authorize & Generate Digital Pass</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};
