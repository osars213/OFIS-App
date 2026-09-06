import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  QrCode, 
  Wifi, 
  Lock, 
  MapPin, 
  Calendar, 
  Clock, 
  Download, 
  Share2,
  Zap, 
  Building2, 
  Bell, 
  Check,
  Sun,
  Moon,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  WifiOff,
  Star,
  Copy,
  LogOut,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookingLifecycleStatus } from '../types';

export const DigitalPassModal: React.FC = () => {
  const {
    isDigitalPassOpen,
    setIsDigitalPassOpen,
    activeDigitalPassBooking,
    bookings,
    setCurrentView,
    formatPrice,
    formatTime,
    toggleBookingReminder,
    checkInGuest,
    requestEarlyAccess,
    extendBooking,
    checkOutBooking,
    setReviewSpace,
    setIsWriteReviewOpen,
    allSpaces,
  } = useApp();

  const [passTheme, setPassTheme] = useState<'dark' | 'light'>('dark');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [extensionHours, setExtensionHours] = useState(1);
  const [showEarlyArrivalModal, setShowEarlyArrivalModal] = useState(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync with latest booking state from context
  const currentBooking = bookings.find(b => b.id === activeDigitalPassBooking?.id) || activeDigitalPassBooking;

  useEffect(() => {
    // Reset transient sub-views when pass opens
    if (isDigitalPassOpen) {
      setIsExtending(false);
      setShowEarlyArrivalModal(false);
    }
  }, [isDigitalPassOpen]);

  if (!isDigitalPassOpen || !currentBooking) return null;

  const booking = currentBooking;
  const isReminderOn = booking.hasReminder ?? false;
  const matchedSpace = allSpaces.find(s => s.id === booking.spaceId);
  const hourlyRate = matchedSpace?.pricePerHour || Math.round(booking.totalAmount / booking.durationHours) || 3500;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleReminder = () => {
    const newState = toggleBookingReminder(booking.id);
    showToast(newState ? 'Reminder scheduled for 30m prior!' : 'Reminder disabled');
  };

  // Check-In validation
  const handleCheckIn = () => {
    const res = checkInGuest(booking.id);
    if (res.success) {
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  const handleRequestEarlyAccess = () => {
    const res = requestEarlyAccess(booking.id);
    setShowEarlyArrivalModal(false);
    showToast(res.message);
  };

  const handleConfirmExtension = () => {
    const res = extendBooking(booking.id, extensionHours, 'wallet');
    setIsExtending(false);
    showToast(res.message);
  };

  const handleCheckOut = () => {
    const res = checkOutBooking(booking.id);
    showToast(res.message);
    setIsDigitalPassOpen(false);
  };

  const handleOpenReview = () => {
    if (matchedSpace) {
      setReviewSpace(matchedSpace);
    }
    setIsDigitalPassOpen(false);
    setIsWriteReviewOpen(true);
  };

  // Stages calculation
  const stages: { key: BookingLifecycleStatus; label: string }[] = [
    { key: 'reserved', label: 'Reserved' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'ready_for_checkin', label: 'Ready' },
    { key: 'checked_in', label: 'Checked In' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'reviewed', label: 'Reviewed' },
  ];

  const getStageIndex = (status: BookingLifecycleStatus): number => {
    switch (status) {
      case 'reserved': return 0;
      case 'confirmed': return 1;
      case 'ready_for_checkin': return 2;
      case 'checked_in':
      case 'active': return 3;
      case 'in_progress': return 4;
      case 'completed': return 5;
      case 'reviewed': return 6;
      default: return 1;
    }
  };

  const currentStageIdx = getStageIndex(booking.status);

  // QR Pattern Matrix derived from pass code
  const qrHash = booking.qrCodeValue || `${booking.id}-${booking.userId}`;
  const qrGrid = Array.from({ length: 36 }).map((_, i) => {
    const charCode = qrHash.charCodeAt(i % qrHash.length) || 42;
    return (charCode + i) % 2 === 0 || i % 5 === 0 || i === 0 || i === 5 || i === 30 || i === 35;
  });

  const isLight = passTheme === 'light';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-colors duration-300 ${
        isLight ? 'bg-[#F8FAFC] border-[#E5E7EB] text-[#111827]' : 'bg-[#121614] border-[#232D28] text-[#F2F2F2]'
      }`}>
        
        {/* Pass Header Banner */}
        <div className="bg-[#16A34A] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-black tracking-wider uppercase bg-white/20 text-white px-2 py-0.5 rounded">
                OFIS DIGITAL PASS 2.0
              </span>
              {booking.offlineCached && (
                <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Offline Ready</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight truncate">{booking.spaceTitle}</h3>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Theme Toggle Button for Turnstile Screen Legibility */}
            <button
              type="button"
              onClick={() => setPassTheme(isLight ? 'dark' : 'light')}
              title={isLight ? 'Switch to Dark OLED mode' : 'Switch to High-Contrast Light Scanner mode'}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              aria-label="Toggle Pass Theme"
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsDigitalPassOpen(false)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              aria-label="Close Digital Pass"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lifecycle Status Progress Bar */}
        <div className={`px-4 sm:px-6 pt-4 pb-2 border-b ${isLight ? 'bg-white border-[#E5E7EB]' : 'bg-[#151B18] border-[#1E2522]'}`}>
          <div className="flex items-center justify-between text-[10px] font-mono mb-2">
            <span className="text-[#6B7280] dark:text-[#718079] uppercase tracking-wider font-semibold">Live Booking Status</span>
            <span className="font-bold text-[#16A34A] uppercase bg-[#DCFCE7] dark:bg-[#16A34A]/10 px-2 py-0.5 rounded">
              {String(booking.status || '').replace(/_/g, ' ')}
            </span>
          </div>

          {/* Stepper Dots & Line */}
          <div className="relative flex items-center justify-between pb-1">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-[#E5E7EB] dark:bg-[#232D28]/30 rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#16A34A] rounded-full transition-all duration-500"
              style={{ width: `${(currentStageIdx / (stages.length - 1)) * 100}%` }}
            />
            {stages.map((st, i) => {
              const isPastOrCurrent = i <= currentStageIdx;
              const isCurrent = i === currentStageIdx;
              return (
                <div key={st.key} className="relative z-10 flex flex-col items-center group">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isCurrent 
                      ? 'bg-[#16A34A] ring-4 ring-[#16A34A]/25 scale-110' 
                      : isPastOrCurrent 
                        ? 'bg-[#16A34A]' 
                        : isLight ? 'bg-[#E5E7EB]' : 'bg-[#232D28]'
                  }`}>
                    {isPastOrCurrent && <Check className="w-2 h-2 text-white stroke-[3]" />}
                  </div>
                  <span className={`text-[8px] sm:text-[9px] font-mono mt-1 hidden sm:block ${
                    isCurrent ? 'font-bold text-[#16A34A]' : isLight ? 'text-[#6B7280]' : 'text-[#718079]'
                  }`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pass Body Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Offline Pass Sync Banner */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
            isLight ? 'bg-[#DCFCE7]/60 border-[#BBF7D0] text-[#111827]' : 'bg-[#18231D] border-[#22362B] text-[#9EABA3]'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span className="text-[11px]">
                <strong className={isLight ? 'text-[#111827]' : 'text-[#F2F2F2]'}>Pass Cached Locally</strong> • Scannable offline without internet
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#16A34A] font-bold">Encrypted</span>
          </div>

          {/* Dynamic Turnstile QR Code & Pass Credentials */}
          <div className={`p-5 rounded-2xl border text-center space-y-3 shadow-sm ${
            isLight ? 'bg-white border-[#E5E7EB]' : 'bg-[#0D0D0D] border-[#1E2522]'
          }`}>
            <div className="relative inline-block mx-auto">
              <div className="w-40 h-40 bg-white p-3 rounded-2xl flex items-center justify-center shadow-md border border-[#E5E7EB] dark:border-black/10">
                {/* Visual Turnstile QR Code Matrix */}
                <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-white">
                  {qrGrid.map((filled, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-xs transition-colors ${filled ? 'bg-[#111827]' : 'bg-transparent'}`} 
                    />
                  ))}
                </div>
              </div>

              {booking.checkedIn && !booking.checkedOut && (
                <div className="absolute -top-2 -right-2 bg-[#16A34A] text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>ACTIVE</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xs font-mono font-black text-[#16A34A] tracking-widest uppercase">
                  PASS: {booking.digitalPassCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(booking.digitalPassCode, 'Pass Code')}
                  className="p-1 text-[#6B7280] dark:text-[#718079] hover:text-[#16A34A] transition-colors cursor-pointer"
                  title="Copy pass code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-[#6B7280]' : 'text-[#718079]'}`}>
                Scan turnstile QR or present to venue desk security
              </p>
            </div>
          </div>

          {/* Booking Core Metadata */}
          <div className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
            isLight ? 'bg-white border-[#E5E7EB]' : 'bg-[#18201B] border-[#232D28]'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <span className={isLight ? 'text-[#6B7280]' : 'text-[#718079]'}>Guest Name</span>
              <span className="font-bold">{booking.userName}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <span className={isLight ? 'text-[#6B7280]' : 'text-[#718079]'}>Booking ID</span>
              <span className="font-mono font-semibold text-[#16A34A]">{booking.id}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <span className={isLight ? 'text-[#6B7280]' : 'text-[#718079]'}>Date</span>
              <span className="font-bold">{booking.date}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <span className={isLight ? 'text-[#6B7280]' : 'text-[#718079]'}>Time Window</span>
              <span className="font-bold">
                {formatTime(booking.startTime)} – {formatTime(booking.endTime || '17:00')} ({booking.durationHours} hrs)
              </span>
            </div>

            {booking.selectedSeatLabel && (
              <div className="flex justify-between items-center">
                <span className={isLight ? 'text-[#6B7280]' : 'text-[#718079]'}>Assigned Desk</span>
                <span className="font-bold text-[#16A34A]">{booking.selectedSeatLabel}</span>
              </div>
            )}
          </div>

          {/* Turnstile Access PIN & WiFi Credentials */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-2xl border space-y-1 ${
              isLight ? 'bg-white border-[#E5E7EB]' : 'bg-[#18201B] border-[#232D28]'
            }`}>
              <div className="flex items-center space-x-1.5 text-[10px] text-[#6B7280] dark:text-[#718079] font-mono">
                <Lock className="w-3 h-3 text-[#16A34A]" />
                <span>KEYPAD CODE</span>
              </div>
              <div className="text-xs font-bold font-mono text-[#16A34A] flex items-center justify-between">
                <span>{booking.accessDoorCode || '#8921*'}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(booking.accessDoorCode || '#8921*', 'Access Code')}
                  className="text-[#6B7280] dark:text-[#718079] hover:text-[#16A34A] cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[10px] text-[#6B7280] dark:text-[#718079]">Entrance turnstile</div>
            </div>

            <div className={`p-3 rounded-2xl border space-y-1 ${
              isLight ? 'bg-white border-[#E5E7EB]' : 'bg-[#18201B] border-[#232D28]'
            }`}>
              <div className="flex items-center space-x-1.5 text-[10px] text-[#6B7280] dark:text-[#718079] font-mono">
                <Wifi className="w-3 h-3 text-[#16A34A]" />
                <span>WIFI ACCESS</span>
              </div>
              <div className="text-xs font-bold truncate">{booking.wifiSsid || 'OFIS-HighSpeed'}</div>
              <div className="text-[10px] font-mono text-[#16A34A] truncate flex items-center justify-between">
                <span>{booking.wifiPassword || 'ofisguest2025'}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(booking.wifiPassword || 'ofisguest2025', 'WiFi Password')}
                  className="text-[#6B7280] dark:text-[#718079] hover:text-[#16A34A] cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ARRIVAL & SMART ACCESS CONTROLS                                           */}
          {/* ========================================================================= */}

          {/* CASE 1: Not Checked In yet */}
          {!booking.checkedIn && booking.status !== 'cancelled' && (
            <div className="space-y-3 pt-1">
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-[#F1F5F9] border-[#E5E7EB]' : 'bg-[#151B18] border-[#232D28]'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Venue Arrival Check-In</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#718079]">
                    Tap below on arrival to confirm entrance and unlock seat
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  className="w-full py-3 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check In Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowEarlyArrivalModal(true)}
                  className={`w-full py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                    isLight 
                      ? 'bg-white border-[#E5E7EB] hover:bg-[#F1F5F9] text-[#111827]' 
                      : 'bg-[#18201B] border-[#232D28] hover:bg-[#232D28] text-[#9EABA3]'
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#16A34A]" />
                  <span>Arrived Early?</span>
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: Checked In / Active Session */}
          {booking.checkedIn && !booking.checkedOut && booking.status !== 'completed' && booking.status !== 'reviewed' && (
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-[#DCFCE7] dark:bg-[#16A34A]/10 border border-[#16A34A]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>✓ Checked In & Verified</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#16A34A] bg-[#16A34A]/20 px-2 py-0.5 rounded font-bold">
                    SESSION ACTIVE
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] dark:text-[#9EABA3]">
                  Ready to check out or need more time? You can extend your desk reservation instantly.
                </p>

                {/* Checkout / Extension Action Bar */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsExtending(true)}
                    className="py-2.5 px-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Extend Stay</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckOut}
                    className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#18201B] border border-[#EF4444]/40 text-[#DC2626] dark:text-red-400 hover:bg-[#FEE2E2] dark:hover:bg-red-500/10 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CASE 3: Completed / Ready for Review */}
          {(booking.checkedOut || booking.status === 'completed' || booking.status === 'reviewed') && (
            <div className="space-y-3 pt-1">
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLight ? 'bg-white border-[#E5E7EB]' : 'bg-[#18201B] border-[#232D28]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827] dark:text-[#F2F2F2] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Session Completed</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#718079]">
                    {booking.status === 'reviewed' ? 'REVIEWED' : 'CHECKED OUT'}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] dark:text-[#718079]">
                  {booking.status === 'reviewed' 
                    ? 'Thank you for sharing your verified review with the Nigerian workspace community.' 
                    : 'How was your workspace experience? Rate power uptime, internet speed, and host responsiveness.'}
                </p>

                {booking.status !== 'reviewed' && (
                  <button
                    type="button"
                    onClick={handleOpenReview}
                    className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Rate &amp; Review Workspace</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Extension Sub-Panel */}
          {isExtending && (
            <div className={`p-4 rounded-2xl border space-y-3 animate-fadeIn ${
              isLight ? 'bg-white border-[#16A34A]' : 'bg-[#141B17] border-[#16A34A]/40'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extend Desk Booking</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsExtending(false)}
                  className="text-xs text-[#6B7280] dark:text-[#718079] hover:text-[#111827] dark:hover:text-[#F2F2F2] cursor-pointer"
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
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      extensionHours === hrs
                        ? 'bg-[#16A34A] text-white shadow-sm'
                        : isLight ? 'bg-[#F1F5F9] text-[#111827] border border-[#E5E7EB]' : 'bg-[#18201B] text-[#9EABA3] border border-[#232D28]'
                    }`}
                  >
                    +{hrs === 0.5 ? '30m' : `${hrs}h`}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#6B7280] dark:text-[#718079]">Extension Cost</span>
                <span className="font-bold font-mono text-[#16A34A]">
                  {formatPrice(Math.round(hourlyRate * extensionHours))}
                </span>
              </div>

              <button
                type="button"
                onClick={handleConfirmExtension}
                className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Confirm Extension</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Early Arrival Sub-Panel */}
          {showEarlyArrivalModal && (
            <div className={`p-4 rounded-2xl border space-y-3 animate-fadeIn ${
              isLight ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]' : 'bg-[#241E12] border-[#5E4716] text-[#FBBF24]'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <h4 className="text-xs font-bold">You've arrived early</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEarlyArrivalModal(false)}
                  className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] opacity-90 leading-relaxed">
                Your reservation starts at {formatTime(booking.startTime)}. You can wait comfortably in the guest lounge or request immediate early access.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEarlyArrivalModal(false)}
                  className={`py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                    isLight ? 'bg-white border-[#FDE68A] text-[#92400E]' : 'bg-[#18201B] border-[#232D28] text-[#F2F2F2]'
                  }`}
                >
                  Wait for {formatTime(booking.startTime)}
                </button>

                <button
                  type="button"
                  onClick={handleRequestEarlyAccess}
                  className="py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold shadow-sm hover:bg-[#15803D] transition-all cursor-pointer"
                >
                  Request Early Access
                </button>
              </div>
            </div>
          )}

          {/* Remind Me 30-min Toggle */}
          <div 
            onClick={handleToggleReminder}
            className={`flex items-center justify-between p-3 rounded-2xl border hover:border-[#16A34A]/40 transition-all cursor-pointer select-none ${
              isLight ? 'bg-white border-[#E5E7EB]' : 'bg-[#18201B] border-[#232D28]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isReminderOn ? 'bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A]' : 'bg-black/5 dark:bg-black/20 text-[#6B7280] dark:text-[#718079]'
              }`}>
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Remind me 30 mins before</span>
                  {isReminderOn && (
                    <span className="text-[9px] font-mono text-[#16A34A] bg-[#DCFCE7] dark:bg-[#16A34A]/10 px-1 py-0.2 rounded font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#6B7280] dark:text-[#718079]">
                  Notification trigger prior to {formatTime(booking.startTime)}
                </p>
              </div>
            </div>

            <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              isReminderOn ? 'bg-[#16A34A]' : 'bg-[#E5E7EB] dark:bg-[#232D28]'
            }`}>
              <div className={`bg-white dark:bg-[#0D0D0D] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                isReminderOn ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>

          {/* Toast Notice */}
          {toastMessage && (
            <div className="p-2.5 rounded-xl bg-[#DCFCE7] dark:bg-[#16A34A]/15 border border-[#16A34A]/40 text-[#16A34A] text-xs font-semibold flex items-center justify-center space-x-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsDigitalPassOpen(false);
                setCurrentView('bookings');
              }}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-[#F1F5F9] text-[#16A34A] border border-[#16A34A]' 
                  : 'bg-[#18201B] hover:bg-[#232D28] text-[#F2F2F2] border border-[#232D28]'
              }`}
            >
              View in My Bookings
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
