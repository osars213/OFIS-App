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

export const Footer: React.FC = () => {
  const { 
    openInfoModal, 
    setIsListSpaceModalOpen, 
    setIsInstallAppModalOpen,
    setIsAiModalOpen,
    setCurrentView 
  } = useApp();

  return (
    <footer className="mt-auto border-t border-[#E2ECEB] dark:border-[#166D74] bg-[#F7FBFB] dark:bg-[#062E32] text-[#12383B] dark:text-[#FFFFFF] transition-colors pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-10 border-b border-[#E2ECEB] dark:border-[#166D74]">
          
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
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
                  <Sparkles className="w-3.5 h-3.5 text-[#FFA987]" />
                  <span>Ofis AI Assistant</span>
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
                <Sparkles className="w-3.5 h-3.5 text-[#FFA987]" />
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
