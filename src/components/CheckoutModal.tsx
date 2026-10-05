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
import { getSupabaseClient } from '../services/supabaseClient';

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
  const [paymentMethod, setPaymentMethod] = useState<'sznd' | 'card' | 'wallet'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

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

  const handleConfirmPay = async () => {
    // 🔒 Gating Check: User must verify email before payment
    if (!currentUser.isEmailVerified) {
      openEmailVerificationModal('payment');
      return;
    }

    setConflictError(null);
    setIsProcessing(true);
    triggerAppAction(3000);

    const durationHoursCalculated = pricing.period === 'hour' 
      ? quantity 
      : (pricing.sessionDurationHours ? pricing.sessionDurationHours * quantity : quantity * 8);

    // Pre-flight authoritative validation check
    try {
      const valRes = await fetch('/api/bookings/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: checkoutSpace.id,
          date,
          startTime,
          durationHours: durationHoursCalculated,
          guestCount: pricing.basis === 'person' ? guests : 1,
        }),
      });

      if (!valRes.ok) {
        const errorData = await valRes.json().catch(() => ({}));
        if (valRes.status === 409 || errorData.conflict || errorData.code === 'SLOT_UNAVAILABLE') {
          setConflictError(errorData.reason || errorData.error || 'This time slot is no longer available. Please select another time or date.');
          setIsProcessing(false);
          return;
        }
      } else {
        const valData = await valRes.json();
        if (valData.valid === false || valData.conflict) {
          setConflictError(valData.reason || 'This time slot is no longer available. Please select another time or date.');
          setIsProcessing(false);
          return;
        }
      }
    } catch (e) {
      console.warn('[CheckoutModal] Validation endpoint check notice:', e);
    }

    if (paymentMethod !== 'wallet') {
      try {
        const client = getSupabaseClient();
        const { data: sessionData } = await client?.auth.getSession() || {};
        const token = sessionData?.session?.access_token;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const initRes = await fetch('/api/payments/initialize', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            spaceId: checkoutSpace.id,
            date,
            startTime,
            durationHours: durationHoursCalculated,
            guestCount: pricing.basis === 'person' ? guests : 1,
            email: currentUser.email || 'coworker@ofis.ng',
            userName: currentUser.name || 'OFIS Member',
            phone: currentUser.phone || '+2348000000000',
            callbackUrl: `${window.location.origin}/?payment=success`,
          }),
        });

        const initData = await initRes.json();
        if (initData.success && (initData.checkout_link || initData.checkoutUrl)) {
          const redirectLink = initData.checkout_link || initData.checkoutUrl;
          window.location.href = redirectLink;
          return;
        }
      } catch (e) {
        console.warn('[CheckoutModal] SZND direct initialize notice, using local confirmation:', e);
      }
    }

    setTimeout(() => {
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
        paymentMethod: paymentMethod === 'wallet' ? 'wallet' : 'sznd',
        paymentReference: `sznd_${Math.random().toString(36).substring(2, 11)}`,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#14BEB8', '#FFA987', '#006B70', '#FFFFFF'],
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
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0B4A50] rounded-3xl border border-[#E2ECEB] dark:border-[#166D74] shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2ECEB] dark:border-[#166D74] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#12383B] dark:text-white">Instant Pass Reservation</h3>
              <span className="text-[10px] font-mono font-bold bg-[#14BEB8]/15 text-[#006B70] dark:text-[#28D2CB] px-2.5 py-0.5 rounded-full border border-[#14BEB8]/30 uppercase">
                {pricing.basis === 'person' ? 'Per Person' : 'Whole Space'} • {pricing.period}
              </span>
            </div>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] mt-0.5 truncate max-w-sm">{checkoutSpace.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Space Summary Card */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74]">
          <img
            src={checkoutSpace.featuredImage}
            alt={checkoutSpace.title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#12383B] dark:text-white truncate">{checkoutSpace.title}</h4>
            <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">{checkoutSpace.neighborhood}, {checkoutSpace.city}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-[#006B70] dark:text-[#28D2CB]">
                {formatSpaceRate(checkoutSpace)}
              </span>
              {pricing.sessionDurationHours && (
                <span className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] bg-white dark:bg-[#0B4A50] px-1.5 py-0.5 rounded border border-[#E2ECEB] dark:border-[#166D74]">
                  {pricing.sessionDurationHours}h block
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Slot Unavailable / Concurrency Conflict Alert */}
        {conflictError && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 flex items-start space-x-2.5 animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1 text-xs">
              <span className="font-bold block">Selected Time Slot Unavailable</span>
              <p className="mt-0.5 text-[11px] text-red-600 dark:text-red-300/90">{conflictError}</p>
              <p className="mt-1 text-[10px] font-medium text-red-500 dark:text-red-400">
                Please adjust your arrival time or choose another date below.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Controls: Date, Period Quantity & Guest Count */}
        <div className="space-y-3">
          {/* Reservation Date */}
          <div className="space-y-1">
            <label className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] font-semibold flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FFA987]" />
              <span>Reservation Date</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                min={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#14BEB8] font-mono cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  date === todayStr
                    ? 'bg-[#14BEB8] text-white shadow-2xs'
                    : 'bg-[#FFF9F4] dark:bg-[#07383D] text-[#5D7A7D] dark:text-[#B8D1D0] border border-[#E2ECEB] dark:border-[#166D74] hover:text-[#12383B] dark:hover:text-white'
                }`}
              >
                Today
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Period / Quantity Selector */}
            <div className="space-y-1">
              <label className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] font-semibold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFA987]" />
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
                  className="w-full p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#14BEB8] cursor-pointer font-mono"
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
                  className="w-full p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#14BEB8] cursor-pointer font-mono"
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
                  className="w-full p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#14BEB8] cursor-pointer font-mono"
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
                  className="w-full p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#14BEB8] cursor-pointer font-mono"
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
              <label className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] font-semibold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFA987]" />
                <span>Start Time</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-xs text-[#12383B] dark:text-white focus:outline-none focus:border-[#14BEB8] cursor-pointer font-mono"
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
              <label className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] font-semibold flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-[#FFA987]" />
                  <span>Number of People / Seats</span>
                </span>
                <span className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">Max: {maxCapacity} seats</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-10 h-9 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-sm font-bold text-[#12383B] dark:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] cursor-pointer flex items-center justify-center shadow-2xs"
                >
                  -
                </button>
                <div className="flex-1 py-2 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-center font-mono text-xs font-bold text-[#006B70] dark:text-[#28D2CB]">
                  {guests} {guests === 1 ? 'Person' : 'People'}
                </div>
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(maxCapacity, guests + 1))}
                  className="w-10 h-9 rounded-xl bg-white dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-sm font-bold text-[#12383B] dark:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] cursor-pointer flex items-center justify-center shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-between text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FFA987]" />
                <span>Entire Space Buyout</span>
              </span>
              <span className="text-[11px] text-[#12383B] dark:text-white font-mono">
                Up to {maxCapacity} Attendees Included
              </span>
            </div>
          )}
        </div>

        {/* Remind Me 30-Min Toggle */}
        <div 
          id="checkout-remind-toggle"
          onClick={() => setRemindMe(!remindMe)}
          className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/40 transition-all cursor-pointer select-none"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              remindMe ? 'bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB]' : 'bg-white dark:bg-[#0B4A50] text-[#5D7A7D] dark:text-[#B8D1D0]'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#12383B] dark:text-white flex items-center gap-1.5">
                <span>Remind Me</span>
                <span className="text-[10px] font-mono text-[#006B70] dark:text-[#28D2CB] bg-[#14BEB8]/15 px-1.5 py-0.2 rounded border border-[#14BEB8]/30">
                  30m before
                </span>
              </div>
              <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">
                Get instant notification & entrance pass code 30 minutes before {formatTime(startTime)}
              </p>
            </div>
          </div>

          <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
            remindMe ? 'bg-[#14BEB8]' : 'bg-[#E2ECEB] dark:bg-[#166D74]'
          }`}>
            <div className={`bg-white dark:bg-[#07383D] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              remindMe ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
        </div>

        {/* Payment Channels */}
        <div className="space-y-2">
          <label className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] font-semibold uppercase tracking-wider font-mono">
            Payment Method
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod !== 'wallet'
                  ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/25 border-[#14BEB8] text-[#12383B] dark:text-white font-semibold'
                  : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0]'
              }`}
            >
              <div className="text-xs font-bold">Bank Card / SZND Checkout</div>
              <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">Mastercard, Visa, Verve</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'wallet'
                  ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/25 border-[#14BEB8] text-[#12383B] dark:text-white font-semibold'
                  : 'bg-[#FFF9F4] dark:bg-[#07383D] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0]'
              }`}
            >
              <div className="text-xs font-bold">OFIS Wallet</div>
              <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">₦{(currentUser?.walletBalanceNgn ?? 0).toLocaleString()} Avail.</p>
            </button>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-4 rounded-2xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] space-y-2 text-xs">
          <div className="flex justify-between text-[#5D7A7D] dark:text-[#B8D1D0]">
            <span>Base Rate ({breakdown.rateDescription})</span>
            <span className="text-[#12383B] dark:text-white font-mono">{formatPrice(breakdown.subtotal)}</span>
          </div>
          {breakdown.discount > 0 && (
            <div className="flex justify-between text-[#FFA987] font-semibold">
              <span>Duration Discount</span>
              <span className="font-mono">-{formatPrice(breakdown.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#5D7A7D] dark:text-[#B8D1D0]">
            <span>Power & High-Speed Internet Access</span>
            <span className="text-[#006B70] dark:text-[#28D2CB] font-semibold">Included Free</span>
          </div>
          <div className="pt-2 border-t border-[#E2ECEB] dark:border-[#166D74] flex justify-between font-bold text-sm text-[#12383B] dark:text-white">
            <span>Total Pass Cost</span>
            <span className="text-[#006B70] dark:text-[#28D2CB] font-mono text-base font-extrabold">{formatPrice(breakdown.totalAmount)}</span>
          </div>
        </div>

        {/* Email Verification Gate Banner */}
        {!isEmailVerified && (
          <div className="p-3.5 rounded-2xl bg-[#FFA987]/15 dark:bg-[#FFA987]/10 border border-[#FFA987]/40 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2 text-[#C05621] dark:text-[#FFA987]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Email Verification Required to Pay</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#FFA987]/20 text-[#C05621] dark:text-[#FFA987] px-2 py-0.5 rounded-full font-bold">
                Unverified
              </span>
            </div>
            <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">
              To protect the community and guarantee turnstile pass delivery, OFIS requires email confirmation (<span className="text-[#12383B] dark:text-white font-mono">{currentUser?.email}</span>) before processing payments.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => openEmailVerificationModal('payment')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#FFA987] hover:bg-[#FF956B] text-[#006B70] text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Verify Email Address Now</span>
              </button>
              <button
                type="button"
                onClick={() => verifyUserEmail()}
                className="py-2 px-3 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#FFA987]/50 text-[#C05621] dark:text-[#FFA987] text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
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
              ? 'bg-[#FFA987] hover:bg-[#FF956B] text-[#006B70]'
              : 'bg-[#14BEB8] hover:bg-[#0EA8A2] text-white'
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
