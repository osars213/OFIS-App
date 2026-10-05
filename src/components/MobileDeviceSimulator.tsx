import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  RotateCw, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Monitor, 
  Wifi, 
  BatteryMedium, 
  Signal, 
  X,
  Share2
} from 'lucide-react';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  os: 'ios' | 'android';
  notchStyle: 'island' | 'hole';
}

const DEVICES: Record<string, DevicePreset> = {
  iphone15: {
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    os: 'ios',
    notchStyle: 'island',
  },
  pixel8: {
    name: 'Google Pixel 8',
    width: 412,
    height: 915,
    os: 'android',
    notchStyle: 'hole',
  },
  galaxy24: {
    name: 'Samsung S24',
    width: 360,
    height: 780,
    os: 'android',
    notchStyle: 'hole',
  }
};

interface MobileDeviceSimulatorProps {
  onExit: () => void;
}

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({ onExit }) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('iphone15');
  const [isLandscape, setIsLandscape] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:41');

  const device = DEVICES[selectedDevice] || DEVICES.iphone15;
  const frameWidth = isLandscape ? device.height : device.width;
  const frameHeight = isLandscape ? device.width : device.height;

  // Real-time clock update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Direct mobile link
  const getDirectMobileUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'mobile');
    url.searchParams.delete('mobile_embed');
    return url.toString();
  };

  const iframeSrc = typeof window !== 'undefined'
    ? `${window.location.pathname}?mobile_embed=1`
    : '/?mobile_embed=1';

  const handleCopyLink = () => {
    const directUrl = getDirectMobileUrl();
    navigator.clipboard?.writeText(directUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const handleOpenNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(getDirectMobileUrl(), '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07383D] via-[#09474D] to-[#04282B] text-white flex flex-col items-center justify-start py-6 px-4 select-none animate-in fade-in duration-300">
      
      {/* Top Floating Simulator Control Bar */}
      <header className="w-full max-w-4xl bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/15 rounded-2xl p-3 mb-6 shadow-2xl flex flex-wrap items-center justify-between gap-3 z-50">
        
        {/* Left: Device Info Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#14BEB8]/20 border border-[#14BEB8]/40 flex items-center justify-center text-[#28D2CB]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-white">OFIS Mobile Preview</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FFA987]/20 border border-[#FFA987]/40 text-[#FFA987]">
                Responsive Sandbox
              </span>
            </div>
            <p className="text-xs text-[#B8D1D0]">
              Simulating true viewport ({frameWidth}px × {frameHeight}px)
            </p>
          </div>
        </div>

        {/* Center: Device Select & Orientation Toggle */}
        <div className="flex items-center space-x-2 bg-black/25 p-1 rounded-xl border border-white/10">
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="bg-transparent text-xs font-medium text-white px-2 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="iphone15" className="bg-[#07383D] text-white">iPhone 15 Pro (393 × 852)</option>
            <option value="pixel8" className="bg-[#07383D] text-white">Google Pixel 8 (412 × 915)</option>
            <option value="galaxy24" className="bg-[#07383D] text-white">Samsung S24 (360 × 780)</option>
          </select>

          <button
            type="button"
            onClick={() => setIsLandscape(!isLandscape)}
            title="Toggle orientation"
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isLandscape ? 'bg-[#14BEB8] text-white' : 'text-[#B8D1D0] hover:text-white hover:bg-white/10'
            }`}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          
          {/* Copy Direct Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all active:scale-95 shadow-xs"
            title="Copy direct link with mobile view enabled"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#28D2CB]" />
                <span className="text-[#28D2CB]">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Mobile Link</span>
              </>
            )}
          </button>

          {/* Test on Real Phone (QR Code) Button */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FFA987]/20 hover:bg-[#FFA987]/30 text-[#FFA987] border border-[#FFA987]/40 transition-all active:scale-95"
            title="Open on your phone with QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone QR</span>
          </button>

          {/* Full Screen Tab */}
          <button
            type="button"
            onClick={handleOpenNewTab}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#B8D1D0] hover:text-white border border-white/15 transition-all"
            title="Open in new window"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Exit to Desktop */}
          <button
            type="button"
            onClick={onExit}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#14BEB8] hover:bg-[#006B70] text-white transition-all shadow-md active:scale-95"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>
      </header>

      {/* Main Smartphone Shell Container */}
      <div className="relative transition-all duration-300 ease-out flex items-center justify-center">
        
        {/* Device Outer Chassis / Bezel */}
        <div 
          className="relative bg-[#1E293B] rounded-[52px] p-[12px] shadow-[0_25px_70px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.12),0_0_40px_rgba(20,190,184,0.15)] ring-1 ring-white/10"
          style={{
            width: `${frameWidth + 24}px`,
            height: `${frameHeight + 24}px`,
            maxWidth: '95vw',
            maxHeight: '85vh',
          }}
        >
          {/* Subtle Outer Hardware Buttons (Volume & Power Glare) */}
          <div className="absolute -left-[3px] top-[115px] w-[3px] h-[36px] bg-[#64748B] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[165px] w-[3px] h-[55px] bg-[#64748B] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[230px] w-[3px] h-[55px] bg-[#64748B] rounded-l-sm" />
          <div className="absolute -right-[3px] top-[170px] w-[3px] h-[75px] bg-[#64748B] rounded-r-sm" />

          {/* Inner Screen Display (True Viewport) */}
          <div className="relative w-full h-full bg-[#FFF9F4] dark:bg-[#07383D] rounded-[40px] overflow-hidden flex flex-col border border-black/40 shadow-inner">
            
            {/* Top iOS/Android Status Bar Overlay */}
            <div className="w-full h-11 bg-white/90 dark:bg-[#07383D]/90 backdrop-blur-md px-6 flex items-center justify-between text-[#12383B] dark:text-white text-xs font-semibold select-none z-30 shrink-0 border-b border-black/5 dark:border-white/5">
              
              {/* Left: Clock */}
              <span>{currentTime}</span>

              {/* Center: Dynamic Island or Camera Hole */}
              {device.notchStyle === 'island' ? (
                <div className="w-28 h-6 bg-black rounded-full mx-auto flex items-center justify-end px-2.5 space-x-1.5 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1E293B] border border-white/20" />
                  <div className="w-2 h-2 rounded-full bg-[#0F766E]/40" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-black mx-auto border border-white/10" />
              )}

              {/* Right: Network & Battery Indicators */}
              <div className="flex items-center space-x-1.5">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <BatteryMedium className="w-4 h-4" />
              </div>
            </div>

            {/* Embedded Live App Viewport (Real Mobile Dimension) */}
            <div className="flex-1 w-full relative overflow-hidden bg-[#FFF9F4] dark:bg-[#07383D]">
              <iframe
                src={iframeSrc}
                title="OFIS Mobile Application View"
                className="w-full h-full border-0 select-text"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>

            {/* Bottom Home Indicator Bar Overlay */}
            <div className="w-full h-5 bg-white/90 dark:bg-[#07383D]/90 backdrop-blur-md flex items-center justify-center shrink-0 z-30">
              <div className="w-32 h-1 bg-black/30 dark:bg-white/30 rounded-full" />
            </div>

          </div>
        </div>
      </div>

      {/* QR Code Modal for Scanning with Real Smartphone */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#07383D] text-[#12383B] dark:text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E2ECEB] dark:border-[#166D74] text-center relative">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FFA987]/15 border border-[#FFA987]/40 text-[#FFA987] flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold">Open on Your Phone</h3>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] mt-1 mb-4">
              Point your smartphone camera at this QR code to launch the real mobile experience.
            </p>

            {/* Visual QR Code Display */}
            <div className="bg-white p-4 rounded-2xl inline-block border-2 border-[#14BEB8]/30 shadow-inner mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getDirectMobileUrl())}`}
                alt="Scan to open OFIS on mobile"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div className="bg-gray-50 dark:bg-black/30 p-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-[11px] font-mono break-all text-gray-600 dark:text-gray-300 mb-4 select-all">
              {getDirectMobileUrl()}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl bg-[#14BEB8] hover:bg-[#006B70] text-white font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md active:scale-95"
            >
              {isCopied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4 text-white" />}
              <span>{isCopied ? 'Mobile Link Copied!' : 'Copy Direct Mobile Link'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
