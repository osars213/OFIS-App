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
  Bell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

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
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [duration, setDuration] = useState(2); // hours
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

  if (!isCheckoutOpen || !checkoutSpace) return null;

  const totalCost = checkoutSpace.pricePerHour * duration;

  const handleConfirmPay = () => {
    setIsProcessing(true);

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
        durationHours: duration,
        guestCount: guests,
        totalAmount: totalCost,
        currency: 'NGN',
        status: 'confirmed',
        hasReminder: remindMe,
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
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2522] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#F2F2F2]">Instant Pass Reservation</h3>
            <p className="text-xs text-[#718079] mt-0.5">{checkoutSpace.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl text-[#718079] hover:text-[#F2F2F2] hover:bg-[#18201B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Space Summary */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-[#18201B] border border-[#232D28]">
          <img
            src={checkoutSpace.featuredImage}
            alt={checkoutSpace.title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#F2F2F2] truncate">{checkoutSpace.title}</h4>
            <p className="text-[11px] text-[#718079]">{checkoutSpace.neighborhood}, {checkoutSpace.city}</p>
            <p className="text-xs font-mono font-bold text-[#00C878] mt-0.5">
              {formatPrice(checkoutSpace.pricePerHour)} / hr
            </p>
          </div>
        </div>

        {/* Date, Duration & Time Controls */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] text-[#718079] font-semibold flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00C878]" />
              <span>Reservation Date</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                min={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878] font-mono cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  date === todayStr
                    ? 'bg-[#00C878] text-[#0D0D0D]'
                    : 'bg-[#18201B] text-[#9EABA3] border border-[#232D28] hover:text-[#F2F2F2]'
                }`}
              >
                Today
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-[#718079] font-semibold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Duration</span>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878] cursor-pointer"
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours</option>
                <option value={4}>4 Hours (Half-Day)</option>
                <option value={8}>8 Hours (Full-Day)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#718079] font-semibold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Start Time</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] text-xs text-[#F2F2F2] focus:outline-none focus:border-[#00C878] cursor-pointer"
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {formatTime(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Remind Me 30-Min Toggle */}
        <div 
          id="checkout-remind-toggle"
          onClick={() => setRemindMe(!remindMe)}
          className="flex items-center justify-between p-3 rounded-2xl bg-[#18201B] border border-[#232D28] hover:border-[#00C878]/30 transition-all cursor-pointer select-none"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              remindMe ? 'bg-[#00C878]/20 text-[#00C878]' : 'bg-[#141816] text-[#718079]'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F2F2F2] flex items-center gap-1.5">
                <span>Remind Me</span>
                <span className="text-[10px] font-mono text-[#00C878] bg-[#00C878]/10 px-1.5 py-0.2 rounded border border-[#00C878]/20">
                  30m before
                </span>
              </div>
              <p className="text-[10px] text-[#718079]">
                Get a notification with access code at {formatTime(startTime)} (30 mins prior)
              </p>
            </div>
          </div>

          <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
            remindMe ? 'bg-[#00C878]' : 'bg-[#232D28]'
          }`}>
            <div className={`bg-[#0D0D0D] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              remindMe ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
        </div>

        {/* Payment Channels */}
        <div className="space-y-2">
          <label className="text-[11px] text-[#718079] font-semibold uppercase tracking-wider font-mono">
            Payment Option
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('paystack')}
              className={`p-3 rounded-xl border text-left transition-all ${
                paymentMethod === 'paystack'
                  ? 'bg-[#00C878]/15 border-[#00C878] text-[#F2F2F2]'
                  : 'bg-[#18201B] border-[#232D28] text-[#9EABA3]'
              }`}
            >
              <div className="text-xs font-bold">Paystack / Bank Card</div>
              <p className="text-[10px] text-[#718079]">Mastercard, Visa, Verve</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`p-3 rounded-xl border text-left transition-all ${
                paymentMethod === 'wallet'
                  ? 'bg-[#00C878]/15 border-[#00C878] text-[#F2F2F2]'
                  : 'bg-[#18201B] border-[#232D28] text-[#9EABA3]'
              }`}
            >
              <div className="text-xs font-bold">OFIS Wallet</div>
              <p className="text-[10px] text-[#718079]">₦{(currentUser?.walletBalanceNgn ?? 0).toLocaleString()} Avail.</p>
            </button>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-4 rounded-2xl bg-[#18201B] border border-[#232D28] space-y-2 text-xs">
          <div className="flex justify-between text-[#718079]">
            <span>Rate ({duration} hrs @ {formatPrice(checkoutSpace.pricePerHour)}/hr)</span>
            <span className="text-[#F2F2F2]">{formatPrice(totalCost)}</span>
          </div>
          <div className="flex justify-between text-[#718079]">
            <span>Power & High-Speed Internet Access</span>
            <span className="text-[#00C878]">Included Free</span>
          </div>
          <div className="pt-2 border-t border-[#232D28] flex justify-between font-bold text-sm text-[#F2F2F2]">
            <span>Total Pass Cost</span>
            <span className="text-[#00C878] font-mono">{formatPrice(totalCost)}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleConfirmPay}
          className="w-full py-3.5 rounded-2xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-extrabold text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <span>Securing Pass...</span>
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
