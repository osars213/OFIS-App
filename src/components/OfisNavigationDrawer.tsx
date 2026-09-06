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
  Star, 
  Share2, 
  ChevronRight,
  Settings,
  Sun,
  Palette
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OFISWordmark } from './OFISWordmark';

export const OfisNavigationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    openInfoModal,
    setIsListSpaceModalOpen,
    setIsSettingsOpen,
    setIsLogoGalleryOpen,
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
      <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-white dark:bg-[#111827] border-r border-[#E5E7EB] dark:border-[#374151] shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250 ease-out transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] dark:border-[#374151] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1F2937]">
          <OFISWordmark size="md" />
          <button
            type="button"
            id="drawer-close-btn"
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#E2E8F0] dark:hover:bg-[#374151] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational & Secondary Navigation Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* Section 0: Preferences & Theme */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-2 pb-1">
              Preferences & System
            </p>

            <button
              type="button"
              id="drawer-settings-btn"
              onClick={handleOpenSettings}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer border border-[#E5E7EB] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]/50"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-lg bg-[#DCFCE7] dark:bg-[#16A34A]/20 text-[#16A34A]">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Settings & Appearance</div>
                  <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-normal">
                    Theme: {theme === 'system' ? 'System Default' : theme === 'dark' ? 'Dark Mode' : 'Light Mode'} • Currency
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>

            <button
              type="button"
              id="drawer-logos-btn"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsLogoGalleryOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 mt-1.5"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                    <span>10 Logo Concepts</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500 text-white font-mono">NEW</span>
                  </div>
                  <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-normal">
                    Preview & switch handmade brand designs
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-500" />
            </button>
          </div>

          {/* Section 1: Overview & Community */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-2 pb-1">
              About & Community
            </p>

            <button
              type="button"
              id="drawer-about-btn"
              onClick={() => handleOpenInfo('about')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Info className="w-4 h-4 text-[#16A34A]" />
                <span>About OFIS</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>

            <button
              type="button"
              id="drawer-faq-btn"
              onClick={() => handleOpenInfo('faq')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-4 h-4 text-[#16A34A]" />
                <span>Frequently Asked Questions (FAQ)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>

            <button
              type="button"
              id="drawer-help-centre-btn"
              onClick={() => handleOpenInfo('help')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Headphones className="w-4 h-4 text-[#16A34A]" />
                <span>Help Centre</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>
          </div>

          {/* Section 2: Support & Assistance */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-2 pb-1">
              Support & Inquiries
            </p>

            <button
              type="button"
              id="drawer-contact-support-btn"
              onClick={() => handleOpenInfo('support')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#16A34A]" />
                <span>Contact Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>

            <button
              type="button"
              id="drawer-report-problem-btn"
              onClick={() => handleOpenInfo('report')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#D97706] dark:text-[#F59E0B] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
                <span>Report a Problem</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>
          </div>

          {/* Section 3: Host & Partner Network */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-2 pb-1">
              Hosts & Partnerships
            </p>

            <button
              type="button"
              id="drawer-become-host-btn"
              onClick={handleBecomeHost}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#DCFCE7] dark:hover:bg-[#16A34A]/20 text-xs font-bold text-[#16A34A] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-[#16A34A]" />
                <span>Become a Host</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#16A34A]" />
            </button>

            <button
              type="button"
              id="drawer-partner-btn"
              onClick={() => handleOpenInfo('partner')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Handshake className="w-4 h-4 text-[#16A34A]" />
                <span>Partner With OFIS</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>
          </div>

          {/* Section 4: Engagement & Feedback */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-2 pb-1">
              Community & Growth
            </p>

            <button
              type="button"
              id="drawer-rate-app-btn"
              onClick={() => handleOpenInfo('rate')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Star className="w-4 h-4 text-[#F59E0B]" />
                <span>Rate the App</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>

            <button
              type="button"
              id="drawer-share-ofis-btn"
              onClick={() => handleOpenInfo('share')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Share2 className="w-4 h-4 text-[#16A34A]" />
                <span>Share OFIS</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>
          </div>

          {/* Section 5: Legal & Policy */}
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-bold uppercase text-[#6B7280] dark:text-[#9CA3AF] tracking-wider px-2 pb-1">
              Legal & Trust
            </p>

            <button
              type="button"
              id="drawer-privacy-policy-btn"
              onClick={() => handleOpenInfo('privacy')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>

            <button
              type="button"
              id="drawer-terms-btn"
              onClick={() => handleOpenInfo('terms')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                <span>Terms of Service</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#E5E7EB] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
          <div className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-mono flex items-center justify-between">
            <span>OFIS Nigeria</span>
            <span className="text-[#16A34A] font-bold">● Verified Workspaces</span>
          </div>
        </div>

      </div>
    </div>
  );
};
