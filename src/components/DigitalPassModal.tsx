import React from 'react';
import { X, QrCode, Wifi, Copy, MapPin, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ofisWordmark from '../assets/ofis-wordmark.png';

export const DigitalPassModal: React.FC = () => {
  const { activePassBooking, setActivePassBooking, showToast } = useApp();

  if (!activePassBooking) return null;

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative p-[1px] rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
        {/* Revolving Glow Border */}
        <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_300deg,#00C878_360deg)] animate-revolving-glow pointer-events-none opacity-80" />
        
        <div className="relative w-full bg-[#121714] rounded-3xl border border-[#232D28] overflow-hidden">
        
        {/* Pass Header */}
        <div className="bg-gradient-to-b from-[#18241D] to-[#121714] p-5 pb-3 border-b border-[#1E2522] relative">
          <button
            type="button"
            onClick={() => setActivePassBooking(null)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <img src={ofisWordmark} alt="OFIS" className="h-6 w-auto object-contain" />
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00C878]/20 text-[#00C878] font-bold uppercase tracking-wider">
              Access Pass
            </span>
          </div>

          <h3 className="text-base font-bold text-[#F2F2F2] leading-tight truncate">
            {activePassBooking.spaceTitle}
          </h3>
          <p className="text-xs text-[#9EABA3] flex items-center space-x-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[#00C878]" />
            <span className="truncate">{activePassBooking.spaceAddress}</span>
          </p>
        </div>

        {/* QR Code Canvas */}
        <div className="p-6 text-center space-y-4">
          
          <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-inner relative group">
            {/* High visual fidelity QR SVG representation */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
              <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm10-10h10v10H60zm-20 40h10v10H40zm30 10h10v10H70zm10-20h10v10H80zm-40 20h10v10H40zm20 10h10v10H60zm20 0h10v10H80zM45 45h10v10H45z" />
            </svg>
            <div className="absolute inset-0 bg-[#00C878]/10 rounded-2xl pointer-events-none" />
          </div>

          {/* Turnstile Pass Code */}
          <div className="space-y-1">
            <div className="text-[11px] text-[#718079] uppercase font-bold tracking-wider">Turnstile Pass Code</div>
            <div
              onClick={() => copyToClipboard(activePassBooking.passCode, 'Pass Code')}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-[#1A201D] border border-[#00C878]/30 text-[#00C878] font-mono font-bold text-lg cursor-pointer hover:bg-[#232D28] transition-all"
            >
              <span>{activePassBooking.passCode}</span>
              <Copy className="w-3.5 h-3.5 opacity-70" />
            </div>
          </div>

          {/* Wi-Fi Credentials */}
          {activePassBooking.wifiSsid && (
            <div className="p-3 rounded-xl bg-[#161D19] border border-[#1E2522] text-left space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#9EABA3]">
                <span className="flex items-center space-x-1">
                  <Wifi className="w-3.5 h-3.5 text-[#00C878]" />
                  <span>Wi-Fi Network:</span>
                </span>
                <span className="font-semibold text-[#F2F2F2]">{activePassBooking.wifiSsid}</span>
              </div>
              {activePassBooking.wifiPassword && (
                <div className="flex items-center justify-between text-xs text-[#9EABA3]">
                  <span>Password:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activePassBooking.wifiPassword!, 'Wi-Fi Password')}
                    className="font-mono text-[#00C878] font-semibold flex items-center space-x-1 hover:underline"
                  >
                    <span>{activePassBooking.wifiPassword}</span>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <p className="text-[11px] text-[#718079] leading-tight">
            {activePassBooking.accessInstructions || 'Scan this digital pass at the ground floor security turnstile.'}
          </p>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0E1210] border-t border-[#1E2522] flex items-center justify-between">
          <span className="text-[10px] text-[#00C878] flex items-center space-x-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active & Valid</span>
          </span>
          <button
            type="button"
            onClick={() => setActivePassBooking(null)}
            className="px-4 py-1.5 rounded-lg bg-[#161D19] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] hover:bg-[#1E2522]"
          >
            Close
          </button>
        </div>

        </div>
      </div>
    </div>
  );
};
