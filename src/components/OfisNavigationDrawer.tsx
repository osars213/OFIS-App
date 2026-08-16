import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Building2,
  Compass,
  HelpCircle,
  Mail,
  ShieldCheck,
  FileText,
  Lock,
  PlusCircle,
  Clock,
  Info,
  ChevronRight
} from 'lucide-react';
import { OfisLogo } from './OfisLogo';
import { InfoModalSection } from './OfisInfoModal';

interface OfisNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'explore' | 'results' | 'passes' | 'host' | 'ops') => void;
  onOpenListSpace: () => void;
  onOpenInfoSection: (section: InfoModalSection) => void;
}

/**
 * OFIS Information & Navigation Drawer (☰ Top Left Menu)
 * Strict, clear information architecture:
 * - About OFIS
 * - How It Works
 * - Why OFIS
 * - Explore Spaces
 * - List a Space
 * - How Hosting Works
 * - Help Centre
 * - Contact Us
 * - Terms & Conditions
 * - Privacy Policy
 */
export const OfisNavigationDrawer: React.FC<OfisNavigationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenListSpace,
  onOpenInfoSection,
}) => {
  if (!isOpen) return null;

  const handleAction = (cb: () => void) => {
    onClose();
    cb();
  };

  return (
    <div
      id="ofis-nav-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <motion.div
        id="ofis-nav-drawer-panel"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-y-0 left-0 w-full max-w-[340px] sm:max-w-sm bg-[#0E0E0E] border-r border-[#222222] text-white shadow-2xl flex flex-col z-50 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[#222222] flex items-center justify-between bg-[#121212] shrink-0">
          <div className="flex items-center">
            <OfisLogo size="md" />
          </div>

          <button
            type="button"
            id="drawer-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Links Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-sm">
          
          {/* Main Discover & Experience Section */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-black text-[#00C878] uppercase tracking-wider">
              Navigation & Guide
            </div>

            <div className="bg-[#151515] border border-[#242424] rounded-2xl p-1 space-y-0.5">
              {/* 1. About OFIS */}
              <button
                type="button"
                id="drawer-item-about"
                onClick={() => handleAction(() => onOpenInfoSection('about'))}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-200 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-[#00C878]" />
                  <span>About OFIS</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300 transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* 2. How It Works */}
              <button
                type="button"
                id="drawer-item-how-it-works"
                onClick={() => handleAction(() => onOpenInfoSection('how_it_works'))}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-200 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#00C878]" />
                  <span>How It Works</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300 transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* 3. Why OFIS */}
              <button
                type="button"
                id="drawer-item-why-ofis"
                onClick={() => handleAction(() => onOpenInfoSection('why_ofis'))}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-200 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#00C878]" />
                  <span>Why OFIS</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300 transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* 4. Explore Spaces */}
              <button
                type="button"
                id="drawer-item-explore-spaces"
                onClick={() => handleAction(() => onNavigate('explore'))}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-[#00C878] hover:bg-[#063B2A]/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-[#00C878]" />
                  <span>Explore Spaces</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#00C878] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Hosting Section */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-black text-[#00C878] uppercase tracking-wider">
              Space Owners
            </div>

            <div className="bg-[#151515] border border-[#242424] rounded-2xl p-1 space-y-0.5">
              {/* 5. List a Space */}
              <button
                type="button"
                id="drawer-item-list-space"
                onClick={() => handleAction(() => onOpenListSpace())}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-[#00C878]/10 text-[#00C878] hover:bg-[#00C878]/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-[#00C878]" />
                  <span>List a Space</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#00C878] transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* 6. How Hosting Works */}
              <button
                type="button"
                id="drawer-item-how-hosting-works"
                onClick={() => handleAction(() => onOpenInfoSection('how_hosting_works'))}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-200 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-[#00C878]" />
                  <span>How Hosting Works</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-black text-[#00C878] uppercase tracking-wider">
              Help & Support
            </div>

            <div className="bg-[#151515] border border-[#242424] rounded-2xl p-1 space-y-0.5">
              {/* 7. Help Centre */}
              <button
                type="button"
                id="drawer-item-help-centre"
                onClick={() => handleAction(() => onOpenInfoSection('help_centre'))}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-200 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#00C878]" />
                  <span>Help Centre</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300 transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* 8. Contact Us */}
              <button
                type="button"
                id="drawer-item-contact-us"
                onClick={() => handleAction(() => onOpenInfoSection('contact_us'))}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-200 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#00C878]" />
                  <span>Contact Us</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Legal Section */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-black text-stone-400 uppercase tracking-wider">
              Legal
            </div>

            <div className="bg-[#151515] border border-[#242424] rounded-2xl p-1 space-y-0.5">
              {/* 9. Terms & Conditions */}
              <button
                type="button"
                id="drawer-item-terms"
                onClick={() => handleAction(() => onOpenInfoSection('terms'))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 hover:bg-[#202020] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>Terms & Conditions</span>
                </div>
                <ChevronRight className="w-3 h-3 text-stone-600" />
              </button>

              {/* 10. Privacy Policy */}
              <button
                type="button"
                id="drawer-item-privacy"
                onClick={() => handleAction(() => onOpenInfoSection('privacy'))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 hover:bg-[#202020] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Privacy Policy</span>
                </div>
                <ChevronRight className="w-3 h-3 text-stone-600" />
              </button>
            </div>
          </div>
        </div>

        {/* MENU FOOTER */}
        <div className="p-5 border-t border-[#222222] bg-[#121212] shrink-0 text-center">
          <div className="flex justify-center mb-1.5">
            <OfisLogo size="sm" />
          </div>
          <p className="text-[11px] text-[#00C878] font-semibold">
            Nigeria's Physical Space Network
          </p>
        </div>
      </motion.div>
    </div>
  );
};
