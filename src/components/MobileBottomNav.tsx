import React from 'react';
import { 
  Compass, 
  MapPin, 
  CalendarCheck, 
  Bookmark, 
  Sparkles,
  Building2,
  Wallet,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    savedSpaceIds, 
    setIsAiModalOpen,
    setIsDiagnosticsModalOpen,
    setIsHostPayoutModalOpen,
    currentUser,
    switchUserRole
  } = useApp();

  if (currentUser.role === 'host') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[64px] bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-xl border-t border-[#E5E7EB] dark:border-[#1E293B] px-3 flex items-center justify-around transition-colors shadow-lg">
        <button
          type="button"
          onClick={() => setCurrentView('host_dashboard')}
          className="flex flex-col items-center justify-center space-y-1 p-1 rounded-xl text-[#10B981] cursor-pointer transition-transform active:scale-95"
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[11px] font-semibold whitespace-nowrap">Hubs</span>
        </button>

        <button
          type="button"
          onClick={() => setIsHostPayoutModalOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 p-1 rounded-xl text-[#6B7280] dark:text-[#94A3B8] hover:text-[#10B981] cursor-pointer transition-transform active:scale-95"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[11px] font-medium whitespace-nowrap">Payouts</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDiagnosticsModalOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 p-1 text-[#10B981] cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-7 h-7 rounded-full bg-[#D1FAE5] dark:bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center -mt-1 shadow-sm">
            <Activity className="w-4 h-4 text-[#10B981]" />
          </div>
          <span className="text-[11px] font-semibold whitespace-nowrap">Health</span>
        </button>

        <button
          type="button"
          onClick={() => switchUserRole('user')}
          className="flex flex-col items-center justify-center space-y-1 p-1 rounded-xl text-[#6B7280] dark:text-[#94A3B8] hover:text-[#10B981] cursor-pointer transition-transform active:scale-95"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[11px] font-medium whitespace-nowrap">Explore</span>
        </button>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[64px] bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-xl border-t border-[#E5E7EB] dark:border-[#1E293B] px-3 flex items-center justify-around transition-colors shadow-lg">
      <button
        type="button"
        onClick={() => setCurrentView('explore')}
        className={`flex flex-col items-center justify-center space-y-1 p-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
          currentView === 'explore' 
            ? 'text-[#10B981] font-semibold scale-105' 
            : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC]'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[11px] whitespace-nowrap">Explore</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('map')}
        className={`flex flex-col items-center justify-center space-y-1 p-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
          currentView === 'map' 
            ? 'text-[#10B981] font-semibold scale-105' 
            : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC]'
        }`}
        title="Around Me"
      >
        <MapPin className="w-5 h-5" />
        <span className="text-[11px] whitespace-nowrap">Around Me</span>
      </button>

      <button
        type="button"
        onClick={() => setIsAiModalOpen(true)}
        className="flex flex-col items-center justify-center space-y-1 p-1 text-[#10B981] cursor-pointer transition-all active:scale-95"
        title="Ofis Assistant"
      >
        <div className="w-7 h-7 rounded-full bg-[#D1FAE5] dark:bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center -mt-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
        </div>
        <span className="text-[10px] font-semibold whitespace-nowrap">Ofis Assistant</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('bookings')}
        className={`flex flex-col items-center justify-center space-y-1 p-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
          currentView === 'bookings' 
            ? 'text-[#10B981] font-semibold scale-105' 
            : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC]'
        }`}
      >
        <CalendarCheck className="w-5 h-5" />
        <span className="text-[11px] whitespace-nowrap">Bookings</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('saved')}
        className={`flex flex-col items-center justify-center space-y-1 p-1 rounded-xl relative transition-all cursor-pointer active:scale-95 ${
          currentView === 'saved' 
            ? 'text-[#10B981] font-semibold scale-105' 
            : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC]'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        {savedSpaceIds.length > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#10B981]" />
        )}
        <span className="text-[11px] whitespace-nowrap">Saved</span>
      </button>
    </div>
  );
};


