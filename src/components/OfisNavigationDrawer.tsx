import React from 'react';
import { 
  X, 
  Info, 
  HelpCircle, 
  Headphones, 
  Mail, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Building2, 
  Handshake, 
  ChevronRight,
  Settings,
  Compass,
  MapPin,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OFISWordmark } from './OFISWordmark';

export const OfisNavigationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    openInfoModal,
    setIsListSpaceModalOpen,
    setIsInstallAppModalOpen,
    setIsSettingsOpen,
    setCurrentView,
    theme,
  } = useApp();

  if (!isDrawerOpen) return null;

  const handleOpenInfo = (tab: 'about' | 'faq' | 'help' | 'support' | 'report' | 'privacy' | 'terms' | 'partner' | 'rate' | 'share') => {
    setIsDrawerOpen(false);
    openInfoModal(tab);
  };

  const handleBecomeHost = () => {
    setIsDrawerOpen(false);
    setIsListSpaceModalOpen(true);
  };

  const handleOpenSettings = () => {
    setIsDrawerOpen(false);
    setIsSettingsOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer on the LEFT side */}
      <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-white dark:bg-[#07383D] border-r border-[#E2ECEB] dark:border-[#166D74] shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250 ease-out transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-between bg-[#FFF9F4] dark:bg-[#07383D]">
          <OFISWordmark size="md" />
          <button
            type="button"
            id="drawer-close-btn"
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* Section 0: Main Experience Navigation */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#5D7A7D] dark:text-[#B8D1D0] tracking-wider px-2 pb-1">
              Core Platform
            </p>

            <button
              type="button"
              id="drawer-explore-marketplace-btn"
              onClick={() => {
                setIsDrawerOpen(false);
                setCurrentView('explore');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#12383B] dark:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Compass className="w-4 h-4 text-[#FFA987]" />
                <span>Explore Spaces</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>

            <button
              type="button"
              id="drawer-map-btn"
              onClick={() => {
                setIsDrawerOpen(false);
                setCurrentView('map');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#12383B] dark:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-[#FFA987]" />
                <span>Around Me Interactive Map</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>

            <button
              type="button"
              id="drawer-install-pwa-btn"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsInstallAppModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#14BEB8]/15 hover:bg-[#14BEB8]/25 border border-[#14BEB8]/30 text-xs font-bold text-[#006B70] dark:text-[#28D2CB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Download className="w-4 h-4 text-[#14BEB8]" />
                <span>Download Mobile App (PWA)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#14BEB8]" />
            </button>
          </div>

          {/* Section 1: Preferences */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#5D7A7D] dark:text-[#B8D1D0] tracking-wider px-2 pb-1">
              Preferences
            </p>

            <button
              type="button"
              id="drawer-settings-btn"
              onClick={handleOpenSettings}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#12383B] dark:text-white transition-colors cursor-pointer border border-[#E2ECEB] dark:border-[#166D74] bg-[#FFF9F4]/60 dark:bg-[#0B4A50]/50 hover:border-[#FFA987]/60"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-[#FFA987]/20 text-[#006B70] dark:text-[#FFA987]">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Preferences</div>
                  <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] font-normal">
                    Currency, Notifications & Theme
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>
          </div>

          {/* Section 2: About & Support */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#5D7A7D] dark:text-[#B8D1D0] tracking-wider px-2 pb-1">
              About & Support
            </p>

            <button
              type="button"
              id="drawer-about-btn"
              onClick={() => handleOpenInfo('about')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#12383B] dark:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Info className="w-4 h-4 text-[#FFA987]" />
                <span>About OFIS</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>

            <button
              type="button"
              id="drawer-faq-btn"
              onClick={() => handleOpenInfo('faq')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#12383B] dark:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-4 h-4 text-[#FFA987]" />
                <span>Frequently Asked Questions (FAQ)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>

            <button
              type="button"
              id="drawer-contact-support-btn"
              onClick={() => handleOpenInfo('support')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#12383B] dark:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#FFA987]" />
                <span>Contact Support (hello@ofis.ng)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>

            <button
              type="button"
              id="drawer-report-problem-btn"
              onClick={() => handleOpenInfo('report')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#C05621] dark:text-[#FFA987] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-[#FFA987]" />
                <span>Report an Issue</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>
          </div>

          {/* Section 4: Host & Partner Network */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#5D7A7D] dark:text-[#B8D1D0] tracking-wider px-2 pb-1">
              Hosts & Partnerships
            </p>

            <button
              type="button"
              id="drawer-become-host-btn"
              onClick={handleBecomeHost}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#14BEB8]/25 text-xs font-bold text-[#006B70] dark:text-[#28D2CB] transition-colors cursor-pointer border border-[#FFA987]/40 bg-[#FFA987]/15"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-[#FFA987]" />
                <span>List a Space (Host)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FFA987]" />
            </button>

            <button
              type="button"
              id="drawer-partner-btn"
              onClick={() => handleOpenInfo('partner')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#12383B] dark:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Handshake className="w-4 h-4 text-[#FFA987]" />
                <span>Partner With OFIS</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>
          </div>

          {/* Section 5: Legal & Policy */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#5D7A7D] dark:text-[#B8D1D0] tracking-wider px-2 pb-1">
              Legal & Trust
            </p>

            <button
              type="button"
              id="drawer-privacy-policy-btn"
              onClick={() => handleOpenInfo('privacy')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>

            <button
              type="button"
              id="drawer-terms-btn"
              onClick={() => handleOpenInfo('terms')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50] text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
                <span>Terms of Service</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5D7A7D] dark:text-[#B8D1D0]" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#E2ECEB] dark:border-[#166D74] bg-[#FFF9F4] dark:bg-[#07383D]">
          <div className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] font-mono flex items-center justify-between">
            <span>OFIS Nigeria</span>
            <span className="text-[#006B70] dark:text-[#28D2CB] font-bold">● hello@ofis.ng</span>
          </div>
        </div>

      </div>
    </div>
  );
};
