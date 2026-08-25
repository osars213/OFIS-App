import React from 'react';
import { 
  Compass, 
  MapPin, 
  CalendarCheck, 
  Bookmark, 
  Sparkles,
  Building2,
  QrCode,
  Wallet,
  Activity,
  UserCheck
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-lg border-t border-[#1E2522] px-3 py-2 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setCurrentView('host_dashboard')}
          className="flex flex-col items-center space-y-1 p-1 rounded-xl text-[#00C878] cursor-pointer"
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">Hubs</span>
        </button>

        <button
          type="button"
          onClick={() => setIsHostPayoutModalOpen(true)}
          className="flex flex-col items-center space-y-1 p-1 rounded-xl text-[#718079] hover:text-[#00C878] cursor-pointer"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-medium">Payouts</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDiagnosticsModalOpen(true)}
          className="flex flex-col items-center space-y-1 p-1 text-[#00C878] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#00C878]/15 border border-[#00C878]/40 flex items-center justify-center -mt-3 shadow-md">
            <Activity className="w-4 h-4 text-[#00C878]" />
          </div>
          <span className="text-[10px] font-bold">Health</span>
        </button>

        <button
          type="button"
          onClick={() => switchUserRole('user')}
          className="flex flex-col items-center space-y-1 p-1 rounded-xl text-[#718079] hover:text-[#00C878] cursor-pointer"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium">Explore</span>
        </button>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-lg border-t border-[#1E2522] px-3 py-2 flex items-center justify-around">
      <button
        type="button"
        onClick={() => setCurrentView('explore')}
        className={`flex flex-col items-center space-y-1 p-1 rounded-xl transition-colors cursor-pointer ${
          currentView === 'explore' ? 'text-[#00C878]' : 'text-[#718079]'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium">Explore</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('map')}
        className={`flex flex-col items-center space-y-1 p-1 rounded-xl transition-colors cursor-pointer ${
          currentView === 'map' ? 'text-[#00C878]' : 'text-[#718079]'
        }`}
        title="Around Me"
      >
        <MapPin className="w-5 h-5" />
        <span className="text-[10px] font-medium">Around Me</span>
      </button>

      <button
        type="button"
        onClick={() => setIsAiModalOpen(true)}
        className="flex flex-col items-center space-y-1 p-1 text-[#00C878] cursor-pointer"
        title="Ofis Assistant"
      >
        <div className="w-8 h-8 rounded-full bg-[#00C878]/15 border border-[#00C878]/40 flex items-center justify-center -mt-3 shadow-md">
          <Sparkles className="w-4 h-4 text-[#00C878]" />
        </div>
        <span className="text-[10px] font-bold">Ofis Assistant</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('bookings')}
        className={`flex flex-col items-center space-y-1 p-1 rounded-xl transition-colors cursor-pointer ${
          currentView === 'bookings' ? 'text-[#00C878]' : 'text-[#718079]'
        }`}
      >
        <CalendarCheck className="w-5 h-5" />
        <span className="text-[10px] font-medium">Bookings</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('saved')}
        className={`flex flex-col items-center space-y-1 p-1 rounded-xl relative transition-colors cursor-pointer ${
          currentView === 'saved' ? 'text-[#00C878]' : 'text-[#718079]'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        {savedSpaceIds.length > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#00C878]" />
        )}
        <span className="text-[10px] font-medium">Saved</span>
      </button>
    </div>
  );
};
