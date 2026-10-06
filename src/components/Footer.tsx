import React from 'react';
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Compass, 
  Mail, 
  HelpCircle, 
  Heart,
  Globe,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OFISWordmark } from './OFISWordmark';
import { OfisAssistantIcon } from './OfisAssistantIcon';

export const Footer: React.FC = () => {
  const { 
    openInfoModal, 
    setIsListSpaceModalOpen, 
    setIsInstallAppModalOpen,
    setIsAiModalOpen,
    setCurrentView,
    setSelectedSpaceId,
  } = useApp();

  const navigateHome = () => {
    setCurrentView('explore');
    setSelectedSpaceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto border-t border-[#E2ECEB] dark:border-[#166D74] bg-[#F7FBFB] dark:bg-[#062E32] text-[#12383B] dark:text-[#FFFFFF] transition-colors pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        
        {/* Prominent Ofis Assistant Banner (Visible & Touch-Optimized for Mobile & Desktop) */}
        <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFD0BD]/25 via-white to-[#FFA987]/15 dark:from-[#FFA987]/15 dark:via-[#0B4A50] dark:to-[#07383D] border border-[#FFA987]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFA987]/20 border border-[#FFA987]/50 flex items-center justify-center shrink-0 shadow-2xs">
              <OfisAssistantIcon size="sm" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#12383B] dark:text-white flex items-center gap-2">
                <span>Ofis Assistant</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFA987]/30 text-[#006B70] dark:text-[#FFA987] font-extrabold uppercase">
                  Available 24/7
                </span>
              </h4>
              <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                Instant intelligent concierge for finding verified spaces with guaranteed Starlink, generator backups & quiet recording booths.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="footer-banner-assistant-btn"
            onClick={() => setIsAiModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#006B70] hover:bg-[#005256] text-white text-xs font-bold border border-[#FFA987]/50 shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer active:scale-95"
          >
            <OfisAssistantIcon size="xs" />
            <span>Chat With Ofis Assistant</span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-10 border-b border-[#E2ECEB] dark:border-[#166D74]">
          
          {/* Column 1: Brand & Tagline - Logo Redirects to Home */}
          <div className="space-y-4 md:col-span-1">
            <div 
              onClick={navigateHome}
              className="flex items-center space-x-2 cursor-pointer transition-transform hover:opacity-90 w-fit"
              title="Return to Home / Explore"
            >
              <OFISWordmark className="h-6 w-auto" />
            </div>
            <p className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0] leading-relaxed">
              Work Meet Create Record — On-demand workspaces & studios across Nigeria. Book verified desks, executive boardrooms, podcast suites, and event spaces by the hour or day.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#006B70] dark:text-[#28D2CB] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#14BEB8] animate-pulse" />
              <span>Real-Time Lagos & Abuja Availability</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#5D7A7D] dark:text-[#B8D1D0] tracking-wider">
              Explore Spaces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  type="button"
                  onClick={() => setCurrentView('explore')}
                  className="hover:text-[#14BEB8] transition-colors cursor-pointer text-left"
                >
                  Coworking & Hot Desks
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setCurrentView('explore')}
                  className="hover:text-[#14BEB8] transition-colors cursor-pointer text-left"
                >
                  Podcast & Media Studios
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setCurrentView('explore')}
                  className="hover:text-[#14BEB8] transition-colors cursor-pointer text-left"
                >
                  Executive Boardrooms
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setCurrentView('map')}
                  className="hover:text-[#14BEB8] transition-colors cursor-pointer text-left flex items-center space-x-1"
                >
                  <MapPin className="w-3 h-3 text-[#FFA987]" />
                  <span>Around Me Interactive Map</span>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  id="footer-assistant-link"
                  onClick={() => setIsAiModalOpen(true)}
                  className="hover:text-[#FFA987] transition-colors cursor-pointer text-left flex items-center space-x-1.5 text-[#006B70] dark:text-[#FFA987] font-semibold"
                >
                  <OfisAssistantIcon size="xs" />
                  <span>Ofis Assistant</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#5D7A7D] dark:text-[#B8D1D0] tracking-wider">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  type="button"
                  onClick={() => openInfoModal('about')}
                  className="hover:text-[#14BEB8] transition-colors cursor-pointer text-left"
                >
                  About OFIS Network
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => openInfoModal('faq')}
                  className="hover:text-[#14BEB8] transition-colors cursor-pointer text-left"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => openInfoModal('terms')}
                  className="hover:text-[#14BEB8] transition-colors cursor-pointer text-left"
                >
                  Terms of Service & Cancellation
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => openInfoModal('support')}
                  className="hover:text-[#14BEB8] transition-colors cursor-pointer text-left flex items-center space-x-1"
                >
                  <Mail className="w-3 h-3 text-[#14BEB8]" />
                  <span>hello@ofis.ng</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Download App Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-xs">
            <div className="flex items-center space-x-2 text-[#006B70] dark:text-[#28D2CB]">
              <Smartphone className="w-4 h-4 text-[#14BEB8]" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Install Mobile App
              </h4>
            </div>
            <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] leading-snug">
              Add OFIS to your phone’s App Drawer for instant offline turnstile QR access & 1-tap booking.
            </p>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="footer-assistant-card-btn"
                onClick={() => setIsAiModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-[#FFD0BD]/25 hover:bg-[#FFD0BD]/40 dark:bg-[#FFA987]/15 dark:hover:bg-[#FFA987]/25 border border-[#FFA987]/40 text-[#006B70] dark:text-[#FFA987] text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
              >
                <OfisAssistantIcon size="xs" />
                <span>Ask Ofis Assistant</span>
              </button>
              <button
                type="button"
                id="footer-download-app-btn"
                onClick={() => setIsInstallAppModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download / Install App</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] pt-1">
              <span>Android App Drawer</span>
              <span>•</span>
              <span>iOS Home Screen</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5D7A7D] dark:text-[#B8D1D0] gap-4">
          <p>© {new Date().getFullYear()} OFIS Technologies Ltd. Built for the modern Nigerian remote workforce.</p>
          <div className="flex items-center space-x-4">
            <button 
              type="button"
              onClick={() => setIsListSpaceModalOpen(true)}
              className="text-[#006B70] dark:text-[#28D2CB] font-semibold hover:underline cursor-pointer"
            >
              Become a Space Host
            </button>
            <span>•</span>
            <button 
              type="button"
              onClick={() => openInfoModal('privacy')}
              className="hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
