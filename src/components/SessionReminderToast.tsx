import React from 'react';
import {
  BellRing,
  Clock,
  KeyRound,
  QrCode,
  CheckCircle2,
  X,
  ArrowRight,
  Wifi,
  Sparkles
} from 'lucide-react';
import { Booking } from '../types';
import { useApp } from '../context/AppContext';

interface SessionReminderToastProps {
  booking: Booking;
  onOpenModal: () => void;
  onDismiss: () => void;
  onSnooze: (minutes?: number) => void;
}

export const SessionReminderToast: React.FC<SessionReminderToastProps> = ({
  booking,
  onOpenModal,
  onDismiss,
  onSnooze,
}) => {
  const { checkInBooking, setActivePassBooking, setIsPassModalOpen, showToast } = useApp();

  const handleCheckInDirectly = (e: React.MouseEvent) => {
    e.stopPropagation();
    checkInBooking(booking.id);
    showToast(`Checked in to Station ${booking.deskCode} successfully!`, 'success');
    onDismiss();
  };

  const handleOpenDigitalPassDirectly = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePassBooking(booking);
    setIsPassModalOpen(true);
  };

  const formattedTime = new Date(booking.startDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="session-reminder-floating-toast"
      onClick={onOpenModal}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-50 w-[92vw] sm:w-[420px] bg-[#171717]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-[#00C878]/30 p-4 animate-in slide-in-from-bottom-5 duration-300 cursor-pointer hover:border-[#00C878] transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#063B2A] text-[#00C878] border border-[#00C878]/30 flex items-center justify-center font-black shrink-0 shadow-sm mt-0.5">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#063B2A] text-[#00C878] border border-[#00C878]/30 text-[10px] font-black uppercase tracking-wider">
                Starting in 1 Hour
              </span>
              <span className="text-[11px] text-[#9A9A9A]">({formattedTime})</span>
            </div>

            <h4 className="font-black text-sm text-white truncate leading-tight">
              {booking.spaceName}
            </h4>

            <p className="text-xs text-[#9A9A9A] flex items-center gap-2">
              <span>Station: <strong className="font-mono text-[#00C878]">{booking.deskCode}</strong></span>
              <span className="text-stone-600">·</span>
              <span>PIN: <strong className="font-mono text-white">{booking.doorPIN || '8492#'}</strong></span>
            </p>
          </div>
        </div>

        <button
          id="dismiss-toast-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 rounded-lg text-[#9A9A9A] hover:text-white hover:bg-[#222222] transition-colors shrink-0 cursor-pointer"
          title="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-[#262626] flex items-center justify-between gap-2">
        <button
          id="toast-snooze-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSnooze(15);
          }}
          className="text-[11px] font-semibold text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
        >
          Snooze 15m
        </button>

        <div className="flex items-center gap-2">
          <button
            id="toast-pass-btn"
            onClick={handleOpenDigitalPassDirectly}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-white text-[11px] font-bold transition-colors border border-[#2D2D2D] cursor-pointer"
          >
            <QrCode className="w-3 h-3 text-[#00C878]" />
            <span>Pass</span>
          </button>

          <button
            id="toast-checkin-btn"
            onClick={handleCheckInDirectly}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] text-[11px] font-black transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Check In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
