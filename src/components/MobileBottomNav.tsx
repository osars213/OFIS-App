import React from 'react';
import { 
  Compass, 
  MapPin, 
  CalendarCheck, 
  Bookmark, 
  Building2, 
  Wallet, 
  Activity 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OfisAssistantIcon } from './OfisAssistantIcon';

export const MobileBottomNav: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    savedSpaceIds, 
    isAiModalOpen,
    setIsAiModalOpen,
    setIsDiagnosticsModalOpen,
    setIsHostPayoutModalOpen,
    currentUser,
    switchUserRole
  } = useApp();

  if (currentUser.role === 'host') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[64px] bg-white/95 dark:bg-[#07383D]/95 backdrop-blur-xl border-t border-[#E2ECEB] dark:border-[#166D74] px-3 flex items-center justify-around transition-colors shadow-lg">
        <button
          type="button"
          onClick={() => setCurrentView('host_dashboard')}
          className="flex flex-col items-center justify-center space-y-1 p-1 rounded-xl text-[#006B70] dark:text-[#FFA987] cursor-pointer transition-transform active:scale-95"
        >
          <Building2 className="w-5 h-5 text-[#FFA987]" />
          <span className="text-[11px] font-semibold whitespace-nowrap">Hubs</span>
        </button>

        <button
          type="button"
          onClick={() => setIsHostPayoutModalOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 p-1 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-[#FFA987] cursor-pointer transition-transform active:scale-95"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[11px] font-medium whitespace-nowrap">Payouts</span>
        </button>

        {/* Center Ofis Assistant Trigger in Host Mode */}
        <button
          type="button"
          id="mobile-bottom-host-assistant-btn"
          onClick={() => setIsAiModalOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 p-1 text-[#006B70] dark:text-[#FFA987] cursor-pointer transition-all active:scale-95"
          title="Ofis Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-[#FFD0BD]/35 dark:bg-[#FFA987]/25 border border-[#FFA987]/60 flex items-center justify-center -mt-1 shadow-xs">
            <OfisAssistantIcon size="xs" />
          </div>
          <span className="text-[10px] font-bold text-[#006B70] dark:text-[#FFA987] whitespace-nowrap">Ofis Assistant</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDiagnosticsModalOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 p-1 text-[#006B70] dark:text-[#FFA987] cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-7 h-7 rounded-full bg-[#FFA987]/15 dark:bg-[#FFA987]/20 border border-[#FFA987]/40 flex items-center justify-center -mt-1 shadow-xs">
            <Activity className="w-4 h-4 text-[#FFA987]" />
          </div>
          <span className="text-[11px] font-semibold whitespace-nowrap">Health</span>
        </button>

        <button
          type="button"
          onClick={() => switchUserRole('user')}
          className="flex flex-col items-center justify-center space-y-1 p-1 rounded-xl text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-[#28D2CB] cursor-pointer transition-transform active:scale-95"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[11px] font-medium whitespace-nowrap">Explore</span>
        </button>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[64px] bg-white/95 dark:bg-[#07383D]/95 backdrop-blur-xl border-t border-[#E2ECEB] dark:border-[#166D74] px-3 flex items-center justify-around transition-colors shadow-lg">
      <button
        type="button"
        onClick={() => setCurrentView('explore')}
        className={`flex flex-col items-center justify-center space-y-1 p-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
          currentView === 'explore' 
            ? 'text-[#006B70] dark:text-[#28D2CB] font-bold scale-105' 
            : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
        }`}
      >
        <Compass className={`w-5 h-5 ${currentView === 'explore' ? 'text-[#14BEB8]' : ''}`} />
        <span className="text-[11px] whitespace-nowrap font-medium">Explore</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('map')}
        className={`flex flex-col items-center justify-center space-y-1 p-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
          currentView === 'map' 
            ? 'text-[#006B70] dark:text-[#28D2CB] font-bold scale-105' 
            : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
        }`}
        title="Around Me"
      >
        <MapPin className={`w-5 h-5 ${currentView === 'map' ? 'text-[#14BEB8]' : ''}`} />
        <span className="text-[10px] whitespace-nowrap font-medium">Around Me</span>
      </button>

      {/* Prominent Center Ofis Assistant Trigger in User Mode */}
      <button
        type="button"
        id="mobile-bottom-assistant-btn"
        onClick={() => setIsAiModalOpen(true)}
        className="flex flex-col items-center justify-center space-y-1 p-1 text-[#006B70] dark:text-[#FFA987] cursor-pointer transition-all active:scale-95"
        title="Ofis Assistant"
      >
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center -mt-1 shadow-xs transition-all ${
          isAiModalOpen 
            ? 'bg-[#FFA987] border-[#FFA987] scale-110' 
            : 'bg-[#FFD0BD]/35 dark:bg-[#FFA987]/25 border-[#FFA987]/60'
        }`}>
          <OfisAssistantIcon size="xs" />
        </div>
        <span className="text-[10px] font-bold text-[#006B70] dark:text-[#FFA987] whitespace-nowrap">Ofis Assistant</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('bookings')}
        className={`flex flex-col items-center justify-center space-y-1 p-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
          currentView === 'bookings' 
            ? 'text-[#006B70] dark:text-[#28D2CB] font-bold scale-105' 
            : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
        }`}
      >
        <CalendarCheck className={`w-5 h-5 ${currentView === 'bookings' ? 'text-[#14BEB8]' : ''}`} />
        <span className="text-[10px] whitespace-nowrap font-medium">Bookings</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('saved')}
        className={`flex flex-col items-center justify-center space-y-1 p-1 rounded-xl relative transition-all cursor-pointer active:scale-95 ${
          currentView === 'saved' 
            ? 'text-[#006B70] dark:text-[#28D2CB] font-bold scale-105' 
            : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
        }`}
      >
        <Bookmark className={`w-5 h-5 ${currentView === 'saved' ? 'text-[#14BEB8]' : ''}`} />
        {savedSpaceIds.length > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#FFA987] ring-2 ring-white dark:ring-[#07383D]" />
        )}
        <span className="text-[10px] whitespace-nowrap font-medium">Saved</span>
      </button>
    </div>
  );
};
