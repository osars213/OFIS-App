import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Laptop,
  Copy,
  Check,
  Smartphone,
  Landmark,
  Zap,
  QrCode,
  CheckCheck,
  RefreshCw,
  Info,
  MapPin,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { BookingDurationType, CurrencyCode } from '../types';
import { OfisLogo } from './OfisLogo';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    selectedSpace,
    selectedDesk,
    currentUser,
    currentCurrency,
    formatPrice,
    convertPrice,
    formatPriceNaira,
    createBooking,
    setActivePassBooking,
    setIsPassModalOpen,
    setIsBookingSuccessModalOpen,
    setLatestSuccessBooking,
    showToast,
    bookingDraft,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'bank_transfer' | 'ussd'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferCountdown, setTransferCountdown] = useState(1799); // 30 mins countdown
  const [isAccountCopied, setIsAccountCopied] = useState(false);
  const [isUssdCopied, setIsUssdCopied] = useState(false);

  // Card Inputs for Paystack simulation
  const [cardNumber, setCardNumber] = useState('5399 4100 8821 4242');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('739');

  // Bank selection for Nigerian USSD & Direct Transfer
  const [selectedUssdBank, setSelectedUssdBank] = useState({ name: 'GTBank (*737#)', code: '*737*' });

  // 30 min countdown timer effect for bank transfer
  useEffect(() => {
    if (!isCheckoutModalOpen) return;
    const timer = setInterval(() => {
      setTransferCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCheckoutModalOpen]);

  if (!isCheckoutModalOpen || !selectedSpace || !selectedDesk) return null;

  const durationUnits = bookingDraft.durationUnits || 3;
  const startDate = bookingDraft.startDate || new Date().toISOString().split('T')[0];
  const startTime = bookingDraft.startTime || '09:00 AM';

  // Compute calculated end time
  const getCalculatedEndTime = () => {
    try {
      const [time, modifier] = startTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      d.setHours(d.getHours() + durationUnits);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '05:00 PM';
    }
  };

  const endTime = getCalculatedEndTime();

  // Pricing calculations in Naira
  const hourlyRateNaira = selectedSpace.hourlyRateNGN || Math.round(selectedSpace.hourlyRate * 1550);
  const subtotalNaira = hourlyRateNaira * durationUnits;
  const serviceFeeNaira = Math.round(subtotalNaira * 0.05); // 5% OFIS fee
  const totalNaira = subtotalNaira + serviceFeeNaira;

  // Generated Nigerian Virtual Account for instant reservation
  const virtualAccountNumber = '9920148201';
  const virtualAccountName = `OFIS / ${selectedSpace.name.slice(0, 16)}`;

  const ussdBanks = [
    { name: 'Guaranty Trust Bank (GTBank)', code: '*737*' },
    { name: 'Zenith Bank', code: '*966*' },
    { name: 'Access Bank', code: '*901*' },
    { name: 'United Bank for Africa (UBA)', code: '*919*' },
    { name: 'First Bank of Nigeria', code: '*894*' },
  ];

  const generatedUssdString = `${selectedUssdBank.code}2*${Math.round(totalNaira)}*${virtualAccountNumber}#`;

  const copyToClipboard = (text: string, type: 'acc' | 'ussd') => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    if (type === 'acc') {
      setIsAccountCopied(true);
      showToast('Virtual account number copied to clipboard', 'success');
      setTimeout(() => setIsAccountCopied(false), 2000);
    } else {
      setIsUssdCopied(true);
      showToast('USSD code copied to dialer', 'success');
      setTimeout(() => setIsUssdCopied(false), 2000);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const createdBooking = await createBooking({
        spaceId: selectedSpace.id,
        spaceName: selectedSpace.name,
        spaceCity: selectedSpace.city,
        spaceAddress: selectedSpace.address,
        spaceImage: selectedSpace.images[0],
        primaryCategory: selectedSpace.primaryCategory,
        subcategory: selectedSpace.subcategory,

        deskId: selectedDesk.id,
        deskName: selectedDesk.name,
        deskCode: selectedDesk.code,
        deskZone: selectedDesk.zone,

        coworkerId: currentUser?.id || 'guest-user',
        coworkerName: currentUser?.name || 'Coworker',
        coworkerEmail: currentUser?.email || 'coworker@ofis.ng',
        coworkerPhone: currentUser?.phone || '+234 800 000 0000',
        coworkerAvatar: currentUser?.avatar,

        hostId: selectedSpace.hostId,
        hostName: selectedSpace.hostName,
        hostPhone: selectedSpace.hostPhone,
        hostWhatsApp: selectedSpace.hostWhatsApp,

        durationType: 'hourly',
        durationUnits,
        startDate: `${startDate}T${startTime.replace(' ', '')}:00.000Z`,
        endDate: `${startDate}T${endTime.replace(' ', '')}:00.000Z`,
        startTime,
        endTime,

        currency: 'NGN',
        currencySymbol: '₦',
        baseAmount: subtotalNaira,
        platformCommissionFee: serviceFeeNaira,
        commissionRate: 0.05,
        taxes: 0,
        totalAmount: totalNaira,
        hostNetPayout: subtotalNaira,

        status: 'pending',
        paymentMethod,
        cardLast4: paymentMethod === 'paystack' ? cardNumber.slice(-4) : undefined,
        bankName: paymentMethod === 'bank_transfer' ? 'Providus Bank' : paymentMethod === 'ussd' ? selectedUssdBank.name : 'OPay Digital Bank',

        notes: `Hourly reservation via ${paymentMethod.toUpperCase()}`,
      });

      // Confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      setIsCheckoutModalOpen(false);
      setActivePassBooking(createdBooking);
      setLatestSuccessBooking(createdBooking);
      setIsBookingSuccessModalOpen(true);
    } catch (err: any) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#171717] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#282828] animate-in zoom-in-95 duration-150 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#262626] bg-[#121212]">
          <div className="flex items-center gap-3">
            <OfisLogo size="sm" showTagline={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Booking Summary & Checkout
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#063B2A] text-[#00C878] border border-[#00C878]/30">
                  PAYSTACK SECURED
                </span>
              </div>
              <p className="text-xs text-[#9A9A9A] font-normal">
                Reserve your space with instant digital pass issuance
              </p>
            </div>
          </div>

          <button
            id="close-checkout-modal-btn"
            onClick={() => setIsCheckoutModalOpen(false)}
            className="p-2 rounded-xl text-[#9A9A9A] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 1. Itemized Booking Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1C1C1C] border border-[#2A2A2A] space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedSpace.images[0]}
                  alt={selectedSpace.name}
                  className="w-14 h-14 rounded-xl object-cover ring-1 ring-[#2D2D2D]"
                />
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#063B2A] text-[#00C878] uppercase">
                    {selectedSpace.primaryCategory}
                  </span>
                  <h3 className="font-black text-sm text-white mt-1">
                    {selectedSpace.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#9A9A9A]">
                    <MapPin className="w-3.5 h-3.5 text-[#00C878]" />
                    <span>{selectedSpace.address}, {selectedSpace.city}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-[#9A9A9A] block uppercase">Workstation</span>
                <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded-md bg-[#282828]">
                  {selectedDesk.code}
                </span>
              </div>
            </div>

            {/* Date / Time / Duration Row */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#282828] text-xs">
              <div className="flex items-center gap-2 text-[#9A9A9A]">
                <Calendar className="w-4 h-4 text-[#00C878] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#9A9A9A] block">Date</span>
                  <span className="font-bold text-white">{startDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#9A9A9A]">
                <Clock className="w-4 h-4 text-[#00C878] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#9A9A9A] block">Time</span>
                  <span className="font-bold text-white">{startTime} – {endTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#9A9A9A]">
                <Zap className="w-4 h-4 text-[#D6A83A] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#9A9A9A] block">Duration</span>
                  <span className="font-bold text-white">{durationUnits} Hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Step 4 Review: Booking Amount + Service Fee + Total */}
          <div className="p-4 rounded-2xl bg-[#1C1C1C] border border-[#2A2A2A] space-y-2 text-xs">
            <div className="font-bold text-[#00C878] uppercase text-[11px] border-b border-[#282828] pb-1.5 flex items-center justify-between">
              <span>Payment Breakdown</span>
              <span>Nigerian Naira (₦)</span>
            </div>

            <div className="flex items-center justify-between text-[#9A9A9A]">
              <span>Space Rental ({formatPriceNaira(hourlyRateNaira)} × {durationUnits} hrs)</span>
              <span className="font-mono font-bold text-white">{formatPriceNaira(subtotalNaira)}</span>
            </div>

            <div className="flex items-center justify-between text-[#9A9A9A]">
              <span className="flex items-center gap-1">
                <span>OFIS Platform & Service Fee (5%)</span>
                <Info className="w-3.5 h-3.5 text-[#9A9A9A]" />
              </span>
              <span className="font-mono font-bold text-white">{formatPriceNaira(serviceFeeNaira)}</span>
            </div>

            <div className="border-t border-[#282828] pt-2 flex items-center justify-between text-base font-black text-white">
              <span>Total Payable</span>
              <span className="font-mono text-[#00C878]">{formatPriceNaira(totalNaira)}</span>
            </div>
          </div>

          {/* 3. Step 5: Choose Payment Method */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              Choose Payment Method
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('paystack')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'paystack'
                    ? 'bg-[#063B2A] border-[#00C878] text-[#00C878] font-bold shadow-md'
                    : 'bg-[#202020] border-[#2A2A2A] text-[#9A9A9A] hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#00C878]" />
                <div className="text-xs font-bold">Paystack Card</div>
                <div className="text-[10px] text-[#9A9A9A]">Mastercard, Visa, Verve</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-[#063B2A] border-[#00C878] text-[#00C878] font-bold shadow-md'
                    : 'bg-[#202020] border-[#2A2A2A] text-[#9A9A9A] hover:text-white'
                }`}
              >
                <Landmark className="w-5 h-5 mx-auto mb-1 text-[#00C878]" />
                <div className="text-xs font-bold">Bank Transfer</div>
                <div className="text-[10px] text-[#9A9A9A]">Instant Virtual Providus</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ussd')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'ussd'
                    ? 'bg-[#063B2A] border-[#00C878] text-[#00C878] font-bold shadow-md'
                    : 'bg-[#202020] border-[#2A2A2A] text-[#9A9A9A] hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-[#00C878]" />
                <div className="text-xs font-bold">USSD</div>
                <div className="text-[10px] text-[#9A9A9A]">*737#, *966#, *901#</div>
              </button>
            </div>

            {/* Paystack Card Simulation Form */}
            {paymentMethod === 'paystack' && (
              <div className="p-4 rounded-2xl bg-[#202020] border border-[#2D2D2D] space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full text-xs font-mono font-bold bg-[#171717] border border-[#2F2F2F] text-white p-2.5 rounded-xl pl-9 focus:outline-none focus:border-[#00C878]"
                    />
                    <CreditCard className="w-4 h-4 text-[#00C878] absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full text-xs font-mono font-bold bg-[#171717] border border-[#2F2F2F] text-white p-2.5 rounded-xl focus:outline-none focus:border-[#00C878]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      className="w-full text-xs font-mono font-bold bg-[#171717] border border-[#2F2F2F] text-white p-2.5 rounded-xl focus:outline-none focus:border-[#00C878]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Details */}
            {paymentMethod === 'bank_transfer' && (
              <div className="p-4 rounded-2xl bg-[#202020] border border-[#2D2D2D] space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between text-[#9A9A9A]">
                  <span>Dedicated Transfer Account</span>
                  <span className="font-mono text-[#00C878] font-bold">{formatCountdown(transferCountdown)} left</span>
                </div>

                <div className="p-3 bg-[#171717] rounded-xl border border-[#282828] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#9A9A9A]">Providus Bank</div>
                    <div className="font-mono font-black text-sm text-[#00C878]">{virtualAccountNumber}</div>
                    <div className="text-[10px] text-[#9A9A9A]">{virtualAccountName}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(virtualAccountNumber, 'acc')}
                    className="p-2 rounded-lg bg-[#252525] hover:bg-[#303030] text-white transition-colors"
                  >
                    {isAccountCopied ? <Check className="w-4 h-4 text-[#00C878]" /> : <Copy className="w-4 h-4 text-[#9A9A9A]" />}
                  </button>
                </div>
              </div>
            )}

            {/* USSD Details */}
            {paymentMethod === 'ussd' && (
              <div className="p-4 rounded-2xl bg-[#202020] border border-[#2D2D2D] space-y-3 animate-in fade-in duration-150 text-xs">
                <label className="block text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider mb-1">
                  Select Your Bank
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ussdBanks.map(b => (
                    <button
                      key={b.name}
                      onClick={() => setSelectedUssdBank(b)}
                      className={`p-2 rounded-xl text-left border transition-colors ${
                        selectedUssdBank.name === b.name
                          ? 'bg-[#063B2A] border-[#00C878] text-[#00C878] font-bold'
                          : 'bg-[#171717] border-[#2A2A2A] text-[#9A9A9A]'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-[#171717] rounded-xl border border-[#282828] flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-[#00C878]">{generatedUssdString}</span>
                  <button
                    onClick={() => copyToClipboard(generatedUssdString, 'ussd')}
                    className="p-2 rounded-lg bg-[#252525] text-white"
                  >
                    {isUssdCopied ? <Check className="w-4 h-4 text-[#00C878]" /> : <Copy className="w-4 h-4 text-[#9A9A9A]" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <button
            id="confirm-pay-now-btn"
            disabled={isProcessing}
            onClick={handlePayment}
            className="w-full py-4 rounded-2xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-sm transition-all shadow-xl shadow-[#00C878]/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#0D0D0D]" />
                <span>Securing Reservation...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#0D0D0D]" />
                <span>Authorize & Pay {formatPriceNaira(totalNaira)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
