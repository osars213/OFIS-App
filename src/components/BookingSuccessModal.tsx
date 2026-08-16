import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, QrCode, Calendar, Clock, MapPin, Key, Wifi, Sparkles, ArrowRight } from 'lucide-react';
import { Booking } from '../types';
import { OfisLogo } from './OfisLogo';

interface BookingSuccessModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onViewPass: () => void;
  onClose: () => void;
}

/**
 * OFIS Booking Success Animation:
 * "The door opens. A warm green light appears. Then display: You're in. Your space is booked. View booking"
 */
export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  booking,
  onViewPass,
  onClose,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div
      id="booking-success-modal-backdrop"
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id="booking-success-card"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#111111] border border-[#282828] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center overflow-hidden my-auto"
      >
        {/* Glowing doorway light burst */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#00C878]/25 via-[#00C878]/5 to-transparent pointer-events-none" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#00C878]/30 blur-3xl rounded-full pointer-events-none" />

        {/* Animated Doorway Icon & Light */}
        <div className="relative flex flex-col items-center justify-center pt-2 mb-5">
          <div className="relative flex items-center justify-center">
            {/* Ambient floor light */}
            <motion.div
              initial={{ scaleX: 0.3, opacity: 0 }}
              animate={{ scaleX: 1.5, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="absolute -bottom-2 w-32 h-6 bg-[#00C878]/50 blur-lg rounded-full pointer-events-none"
            />

            {/* Door-shaped O */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-14 h-20 rounded-t-full border-[3px] border-[#00C878] bg-[#0A0A0A] shadow-[0_0_25px_rgba(0,200,120,0.5)] flex items-center justify-center overflow-hidden"
            >
              {/* Beaming warm green light through doorway */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00C878] via-[#00E58B]/80 to-transparent opacity-80" />

              {/* Animated 3D door leaf swinging open */}
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -80 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
                style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
                className="absolute inset-0.5 rounded-t-full bg-[#161616] border border-[#00C878]/60 flex items-center justify-end pr-1 shadow-md"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
              </motion.div>
            </motion.div>
          </div>

          {/* Core Brand Headline: "You're in." */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C878]/15 border border-[#00C878]/40 text-[#00C878] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Door unlocked
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              You're in.
            </h2>
            <p className="text-sm sm:text-base text-stone-300 font-medium mt-1">
              Your space is booked.
            </p>
          </motion.div>
        </div>

        {/* Space & Access Pass Snapshot */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 text-left mb-6 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-base leading-snug">
                {booking.spaceName}
              </h3>
              <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#00C878]" />
                {booking.spaceAddress}, {booking.spaceCity}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#00C878]/10 text-[#00C878] text-xs font-bold shrink-0 border border-[#00C878]/20">
              {booking.deskCode}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#252525] text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              <Calendar className="w-3.5 h-3.5 text-[#00C878]" />
              <span>{booking.startDate.split('T')[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-[#00C878]" />
              <span>{booking.startTime} ({booking.durationUnits} hrs)</span>
            </div>
          </div>

          {/* Instant Door PIN and WiFi */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#252525] bg-[#121212] p-2.5 rounded-xl text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Door Keypad PIN</span>
              <span className="font-mono font-bold text-[#00C878] text-sm tracking-wider">
                {booking.doorPIN || '8492#'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">High-Speed WiFi</span>
              <span className="font-mono font-medium text-stone-200 text-xs truncate block">
                {booking.wifiSSID || 'OFIS_HighSpeed'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: View Booking Pass */}
        <div className="space-y-2.5">
          <button
            type="button"
            id="view-booking-pass-btn"
            onClick={onViewPass}
            className="w-full py-3.5 px-4 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0A0A0A] font-black text-sm sm:text-base transition-all cursor-pointer shadow-[0_0_25px_rgba(0,200,120,0.4)] flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>View Booking</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="booking-success-close-btn"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            Continue exploring
          </button>
        </div>
      </motion.div>
    </div>
  );
};
