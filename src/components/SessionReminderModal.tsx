import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Wifi,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  X,
  BellRing,
  ExternalLink,
  Navigation,
  ArrowRight,
  Monitor,
  Phone
} from 'lucide-react';
import { Booking } from '../types';
import { useApp } from '../context/AppContext';

interface SessionReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSnooze: (minutes?: number) => void;
}

export const SessionReminderModal: React.FC<SessionReminderModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSnooze,
}) => {
  const {
    checkInBooking,
    setActivePassBooking,
    setIsPassModalOpen,
    showToast,
    spaces,
  } = useApp();

  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [countdownMinutes, setCountdownMinutes] = useState(58);
  const [countdownSeconds, setCountdownSeconds] = useState(42);

  useEffect(() => {
    if (!isOpen || !booking) return;

    const startTimestamp = new Date(booking.startDate).getTime();
    const now = Date.now();
    const diffMs = startTimestamp - now;

    const updateCountdown = () => {
      const currentNow = Date.now();
      const currentDiff = startTimestamp - currentNow;
      if (currentDiff > 0) {
        const mins = Math.floor(currentDiff / (60 * 1000));
        const secs = Math.floor((currentDiff % (60 * 1000)) / 1000);
        setCountdownMinutes(Math.max(0, mins));
        setCountdownSeconds(secs);
      } else {
        setCountdownMinutes(0);
        setCountdownSeconds(0);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [isOpen, booking?.id, booking?.startDate]);

  if (!isOpen || !booking) return null;

  const space = spaces.find((s) => s.id === booking.spaceId);

  const handleCopy = (text: string, label: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedItem(label);
    showToast(`${label} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleOpenFullPass = () => {
    onClose();
    setActivePassBooking(booking);
    setIsPassModalOpen(true);
  };

  const handleCheckInNow = () => {
    checkInBooking(booking.id);
    showToast(`Checked in to Station ${booking.deskCode} at ${booking.spaceName}!`, 'success');
    onClose();
  };

  const formattedTime = new Date(booking.startDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#171717] text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#282828] animate-in zoom-in-95 duration-150 relative">
        {/* Top Floating Close Button */}
        <button
          id="close-reminder-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
          title="Dismiss reminder"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Hero */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-b from-[#063B2A]/40 via-[#171717] to-[#171717] border-b border-[#262626]">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#063B2A] text-[#00C878] border border-[#00C878]/30 text-xs font-bold">
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
              <span>Session Reminder</span>
            </span>
            <span className="text-[11px] text-[#9A9A9A] font-medium">Starts at {formattedTime}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            Your space reservation begins shortly
          </h2>
          <p className="text-xs sm:text-sm text-[#9A9A9A] mt-1 flex items-center gap-1.5 font-normal">
            <MapPin className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
            <span className="font-bold text-white">{booking.spaceName}</span>
            <span className="text-[#9A9A9A]">· {booking.spaceCity}</span>
          </p>

          {/* Countdown Clock Panel */}
          <div className="mt-4 p-3.5 rounded-2xl bg-[#121212] border border-[#282828] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
              <Clock className="w-4 h-4 text-[#00C878]" />
              <span>Session begins in:</span>
            </div>
            <div className="font-mono font-black text-base text-[#00C878]">
              {String(countdownMinutes).padStart(2, '0')}:{String(countdownSeconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Credentials & Access Info */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#1F1F1F] rounded-2xl border border-[#2D2D2D] space-y-1">
              <div className="text-[10px] text-[#9A9A9A] font-bold uppercase">Assigned Station</div>
              <div className="font-mono text-base font-black text-[#00C878]">{booking.deskCode}</div>
              <div className="text-[10px] text-[#9A9A9A] truncate">{booking.deskName}</div>
            </div>

            <div className="p-3 bg-[#1F1F1F] rounded-2xl border border-[#2D2D2D] space-y-1">
              <div className="text-[10px] text-[#9A9A9A] font-bold uppercase">Turnstile PIN</div>
              <div className="font-mono text-base font-black text-white">{booking.doorPIN || '8492#'}</div>
              <button
                onClick={() => handleCopy(booking.doorPIN || '8492#', 'PIN')}
                className="text-[10px] text-[#00C878] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedItem === 'PIN' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedItem === 'PIN' ? 'Copied' : 'Copy PIN'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#1F1F1F] rounded-2xl border border-[#2D2D2D] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#9A9A9A] font-bold uppercase">Wi-Fi (500Mbps Starlink)</div>
              <div className="font-bold text-white mt-0.5">{booking.wifiSSID || 'OFIS-Fast-5G'}</div>
              <div className="text-[11px] text-[#9A9A9A] font-mono">Password: {booking.wifiPass || 'NaijaWork2026!'}</div>
            </div>
            <button
              onClick={() => handleCopy(booking.wifiPass || 'NaijaWork2026!', 'Wi-Fi Password')}
              className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
            >
              {copiedItem === 'Wi-Fi Password' ? 'Copied!' : 'Copy Wi-Fi'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCheckInNow}
              className="w-full py-3.5 bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0D0D0D]" />
              <span>Check In Now</span>
            </button>

            <button
              onClick={handleOpenFullPass}
              className="w-full py-3 bg-[#222222] hover:bg-[#2A2A2A] text-white font-bold text-xs rounded-xl border border-[#2D2D2D] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#00C878]" />
              <span>View Full Access Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
