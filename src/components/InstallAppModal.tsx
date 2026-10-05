import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleDevice);

    // Detect if already installed / standalone
    const isInStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Listen for native install prompt (Android Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstallSuccess(true);
          setTimeout(() => {
            onClose();
          }, 2000);
        }
        setDeferredPrompt(null);
        return;
      } catch (e) {
        console.warn('Install prompt error:', e);
      }
    }

    // If deferredPrompt is unavailable or on iOS, activate visual instructions
    setShowManualHelp(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0B4A50] rounded-3xl border border-[#E2ECEB] dark:border-[#166D74] shadow-2xl p-6 text-[#12383B] dark:text-white space-y-5">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#5D7A7D] dark:text-[#B8D1D0] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#14BEB8]/20 border border-[#14BEB8]/40 flex items-center justify-center text-[#14BEB8]">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">Download OFIS App</h3>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
              Install on your home screen for quick 1-tap bookings
            </p>
          </div>
        </div>

        {/* Already Installed Badge */}
        {isStandalone ? (
          <div className="p-4 rounded-2xl bg-[#14BEB8]/15 border border-[#14BEB8]/40 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#14BEB8] mx-auto" />
            <h4 className="text-sm font-bold text-[#006B70] dark:text-[#28D2CB]">OFIS is Already Installed!</h4>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
              You are currently running the installed native OFIS application.
            </p>
          </div>
        ) : installSuccess ? (
          <div className="p-4 rounded-2xl bg-[#14BEB8]/15 border border-[#14BEB8]/40 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#14BEB8] mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-[#006B70] dark:text-[#28D2CB]">App Installed Successfully!</h4>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
              OFIS is now added to your device home screen.
            </p>
          </div>
        ) : (
          <>
            {/* Always-Active 1-Click Install Button */}
            <button
              type="button"
              id="install-ofis-action-btn"
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer ring-2 ring-[#14BEB8]/30"
            >
              <Download className="w-4 h-4 animate-pulse" />
              <span>{deferredPrompt ? 'Tap to Install OFIS on Device' : isIOS ? 'Tap for iPhone / iPad Instructions' : 'Tap to Install OFIS (WebAPK / Android)'}</span>
            </button>

            {showManualHelp && (
              <div className="p-3 rounded-2xl bg-[#FFA987]/15 border border-[#FFA987]/40 text-xs text-[#12383B] dark:text-white flex items-center space-x-2.5 animate-in fade-in duration-200">
                <Sparkles className="w-4 h-4 text-[#FFA987] shrink-0" />
                <p className="text-[11px] leading-snug">
                  {isIOS 
                    ? 'Follow the 3 quick steps below to save OFIS to your iPhone Home Screen.' 
                    : 'To install on Android: Tap Chrome\'s 3 dots (⋮) in the top-right corner, then tap "Install app" or "Add to Home screen".'}
                </p>
              </div>
            )}

            {/* Direct APK vs WebAPK clarification */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#E2ECEB] dark:border-[#166D74] space-y-1">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#006B70] dark:text-[#28D2CB]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#14BEB8]" />
                <span>Zero APK Side-loading Required</span>
              </div>
              <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] leading-relaxed">
                OFIS uses Google's verified <strong>WebAPK standard</strong>. It installs directly into your Android app drawer without downloading unknown <code>.apk</code> installer files or triggering security warnings.
              </p>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 pt-1">
              <div className="text-[11px] font-mono uppercase font-bold text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center justify-between">
                <span>{isIOS ? 'iPhone / iPad (Safari)' : 'Android / Chrome'}</span>
                <span className="text-[10px] text-[#FFA987] font-semibold">Native PWA</span>
              </div>

              {isIOS ? (
                // iOS Instructions
                <div className="space-y-2.5 bg-[#FFF9F4] dark:bg-[#07383D] p-3.5 rounded-2xl border border-[#E2ECEB] dark:border-[#166D74] text-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-lg bg-[#FFA987]/20 border border-[#FFA987]/40 flex items-center justify-center text-[#FFA987] font-bold text-[11px] shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Tap the Share button</p>
                      <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1 mt-0.5">
                        <span>Tap the</span>
                        <Share className="w-3.5 h-3.5 text-[#006B70] dark:text-[#28D2CB] inline" />
                        <span>icon at the bottom of Safari.</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-lg bg-[#FFA987]/20 border border-[#FFA987]/40 flex items-center justify-center text-[#FFA987] font-bold text-[11px] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Select "Add to Home Screen"</p>
                      <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center gap-1 mt-0.5">
                        <span>Scroll down and tap</span>
                        <PlusSquare className="w-3.5 h-3.5 text-[#006B70] dark:text-[#28D2CB] inline" />
                        <span className="font-bold">Add to Home Screen</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-lg bg-[#FFA987]/20 border border-[#FFA987]/40 flex items-center justify-center text-[#FFA987] font-bold text-[11px] shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Tap "Add" in Top Right</p>
                      <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] mt-0.5">
                        OFIS will appear on your iPhone screen with full offline access.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Android Instructions
                <div className="space-y-2.5 bg-[#FFF9F4] dark:bg-[#07383D] p-3.5 rounded-2xl border border-[#E2ECEB] dark:border-[#166D74] text-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-lg bg-[#14BEB8]/20 border border-[#14BEB8]/40 flex items-center justify-center text-[#14BEB8] font-bold text-[11px] shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Tap the Browser Menu</p>
                      <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] mt-0.5">
                        Tap the three dots (⋮) in the top-right corner of Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-lg bg-[#14BEB8]/20 border border-[#14BEB8]/40 flex items-center justify-center text-[#14BEB8] font-bold text-[11px] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Select "Install App" or "Add to Home screen"</p>
                      <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] mt-0.5">
                        Tap the prompt to install the lightweight app immediately.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Native App Benefits */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#E2ECEB] dark:border-[#166D74] flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#FFA987] shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">Instant offline QR passes</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#E2ECEB] dark:border-[#166D74] flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#14BEB8] shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">Zero app-store bloat</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[#5D7A7D] dark:text-[#B8D1D0] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
