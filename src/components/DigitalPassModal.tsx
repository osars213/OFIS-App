import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Wifi,
  KeyRound,
  MapPin,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Radio,
  Zap,
  Sparkles,
  Clock,
  ExternalLink,
  MessageCircle,
  PhoneCall,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bookingsService } from '../services/bookingsService';
import { OfisLogo } from './OfisLogo';

export const DigitalPassModal: React.FC = () => {
  const {
    isPassModalOpen,
    setIsPassModalOpen,
    activePassBooking,
    showToast,
    checkInBooking,
  } = useApp();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isNfcUnlocking, setIsNfcUnlocking] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{
    wifiSSID?: string;
    wifiPass?: string;
    doorPIN?: string;
    accessInstructions?: string;
  }>({});

  useEffect(() => {
    if (!activePassBooking) return;

    // Load fresh secure credentials for active confirmed booking
    let isMounted = true;
    bookingsService.fetchAccessCredentials(activePassBooking.id, activePassBooking.spaceId).then((res) => {
      if (isMounted) {
        setCredentials({
          wifiSSID: res.wifiSSID || activePassBooking.wifiSSID,
          wifiPass: res.wifiPass || activePassBooking.wifiPass,
          doorPIN: res.doorPIN || activePassBooking.doorPIN,
          accessInstructions: res.accessInstructions,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activePassBooking]);

  if (!isPassModalOpen || !activePassBooking) return null;

  const resolvedWifiSSID = credentials.wifiSSID || activePassBooking.wifiSSID || 'OFIS_Guest_HighSpeed';
  const resolvedWifiPass = credentials.wifiPass || activePassBooking.wifiPass || '—';
  const resolvedDoorPIN = credentials.doorPIN || activePassBooking.doorPIN || '—';

  const bookingRef =
    activePassBooking.bookingReference ||
    `OFS-${(activePassBooking.spaceCity || 'LAG').slice(0, 3).toUpperCase()}-${activePassBooking.id.replace('bk-', '9')}`;

  const handleCopy = (text: string, fieldName: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedField(fieldName);
    showToast(`${fieldName} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulateDoorTap = () => {
    setIsNfcUnlocking(true);
    setTimeout(() => {
      setIsNfcUnlocking(false);
      setNfcSuccess(true);
      checkInBooking(activePassBooking.id);
      showToast('Turnstile / Door NFC unlocked! Checked in successfully.', 'success');
      setTimeout(() => setNfcSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#171717] text-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#282828] animate-in zoom-in-95 duration-150 relative">
        {/* Close Button */}
        <button
          id="close-pass-modal-btn"
          onClick={() => setIsPassModalOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#202020] hover:bg-[#2A2A2A] text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Digital Keycard Top Visual Header */}
        <div className="p-6 pb-4 bg-[#121212] border-b border-[#262626] text-center">
          <div className="flex justify-center mb-3">
            <OfisLogo size="sm" showTagline={false} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#063B2A] text-[#00C878] border border-[#00C878]/30 text-xs font-mono font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#00C878] animate-ping"></span>
            <span>OFIS DIGITAL PASS • 🇳🇬</span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            {activePassBooking.spaceName}
          </h3>
          <p className="text-xs text-[#9A9A9A] mt-1 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
            <span>{activePassBooking.spaceAddress}, {activePassBooking.spaceCity}</span>
          </p>

          {/* Booking Reference Code Strip */}
          <div className="mt-3 py-2 px-3 bg-[#171717] rounded-xl border border-[#282828] flex items-center justify-between text-xs">
            <span className="text-[#9A9A9A] text-[10px] font-bold uppercase">Pass Ref:</span>
            <span className="font-mono font-black text-[#00C878] text-sm tracking-wider">{bookingRef}</span>
            <button
              onClick={() => handleCopy(bookingRef, 'Booking Reference')}
              className="text-[10px] text-[#9A9A9A] hover:text-white font-bold underline cursor-pointer"
            >
              {copiedField === 'Booking Reference' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Large Desk Assignment Badge */}
          <div className="mt-3 p-3 bg-[#1F1F1F] rounded-2xl border border-[#2D2D2D] flex items-center justify-around">
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-[#9A9A9A] tracking-wider">Assigned Pod</div>
              <div className="font-mono text-2xl font-black text-[#00C878]">{activePassBooking.deskCode}</div>
              <div className="text-[11px] text-stone-300 truncate max-w-[120px]">{activePassBooking.deskName}</div>
            </div>

            <div className="h-10 w-px bg-[#333333]"></div>

            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-[#9A9A9A] tracking-wider">Time Slot</div>
              <div className="text-xs font-mono font-bold text-white">
                {activePassBooking.startTime || '09:00 AM'}
              </div>
              <div className="text-[11px] text-[#9A9A9A]">
                {activePassBooking.durationUnits} {activePassBooking.durationType === 'hourly' ? 'hours' : 'days'}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="p-6 bg-white text-stone-900 text-center space-y-4">
          <div className="inline-block p-4 bg-stone-50 rounded-2xl border-2 border-stone-900 shadow-inner">
            <img
              src={activePassBooking.qrCodeUrl}
              alt="Digital Access QR Pass"
              className="w-44 h-44 mx-auto"
            />
          </div>
          <div className="text-xs text-stone-600 font-medium">
            Scan at lobby turnstiles or show at reception desk for instant entrance.
          </div>

          {/* NFC Tap Door Unlock Simulator */}
          <button
            id="simulate-nfc-tap-btn"
            onClick={handleSimulateDoorTap}
            disabled={isNfcUnlocking}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              nfcSuccess
                ? 'bg-[#00C878] text-[#0D0D0D]'
                : 'bg-[#171717] hover:bg-[#222222] text-[#00C878] border border-[#282828]'
            }`}
          >
            {isNfcUnlocking ? (
              <span>Reading NFC Smart Reader...</span>
            ) : nfcSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Turnstile Unlocked • Checked In</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 text-[#00C878] animate-pulse" />
                <span>Simulate NFC / Turnstile Door Tap</span>
              </>
            )}
          </button>
        </div>

        {/* Wi-Fi & Door Access Details */}
        <div className="p-5 bg-[#121212] border-t border-[#262626] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9A9A9A] font-bold uppercase text-[10px]">Access Credentials</span>
            <span className="text-[10px] text-[#00C878] font-bold">Encrypted & Active</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Wi-Fi */}
            <div className="p-2.5 bg-[#1C1C1C] rounded-xl border border-[#2A2A2A]">
              <div className="flex items-center gap-1 text-[10px] text-[#9A9A9A] mb-1">
                <Wifi className="w-3 h-3 text-[#00C878]" />
                <span>High-Speed Wi-Fi</span>
              </div>
              <div className="font-mono text-xs font-bold text-white truncate">
                {resolvedWifiSSID}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-[11px] text-[#9A9A9A]">
                  {resolvedWifiPass}
                </span>
                <button
                  onClick={() => handleCopy(resolvedWifiPass, 'Wi-Fi Password')}
                  className="text-[10px] text-[#00C878] hover:text-[#00C878]/80 font-bold"
                >
                  {copiedField === 'Wi-Fi Password' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Door PIN */}
            <div className="p-2.5 bg-[#1C1C1C] rounded-xl border border-[#2A2A2A]">
              <div className="flex items-center gap-1 text-[10px] text-[#9A9A9A] mb-1">
                <KeyRound className="w-3 h-3 text-[#D6A83A]" />
                <span>Lobby Door PIN</span>
              </div>
              <div className="font-mono text-lg font-black text-[#D6A83A]">
                {resolvedDoorPIN}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] text-[#9A9A9A]">Keypad entry</span>
                <button
                  onClick={() => handleCopy(resolvedDoorPIN, 'Door PIN')}
                  className="text-[10px] text-[#D6A83A] hover:text-[#D6A83A]/80 font-bold"
                >
                  {copiedField === 'Door PIN' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Host Contact Strip */}
          {activePassBooking.hostPhone && (
            <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-xs">
              <div className="text-[11px] text-[#9A9A9A]">
                Host: <span className="text-white font-bold">{activePassBooking.hostName}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${(activePassBooking.hostWhatsApp || activePassBooking.hostPhone).replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(activePassBooking.hostName)},%20I%20have%20booked%20${encodeURIComponent(activePassBooking.spaceName)}%20(Ref:%20${encodeURIComponent(bookingRef)}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#00C878] hover:text-[#00C878]/80 font-bold text-[11px]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
