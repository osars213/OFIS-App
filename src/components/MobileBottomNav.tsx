import React from 'react';
import { Compass, MapPin, Ticket, Building2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, userBookings, setIsAiAssistantOpen, focusSearchInput } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-lg border-t border-[#1E2522] py-2 px-3">
      <div className="flex items-center justify-around">
        
        <button
          type="button"
          onClick={() => focusSearchInput()}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentView === 'explore' || currentView === 'details'
              ? 'text-[#00C878]'
              : 'text-[#9EABA3] hover:text-[#F2F2F2]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium">Spaces</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('map')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentView === 'map'
              ? 'text-[#00C878]'
              : 'text-[#9EABA3] hover:text-[#F2F2F2]'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-medium">Around Me</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAiAssistantOpen(true)}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-11 h-11 rounded-full bg-[#00C878] text-[#0D0D0D] flex items-center justify-center shadow-[0_2px_12px_rgba(0,200,120,0.4)] ring-4 ring-[#0D0D0D] active:scale-95 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-[#00C878] mt-0.5">AI Concierge</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('bookings')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all relative ${
            currentView === 'bookings'
              ? 'text-[#00C878]'
              : 'text-[#9EABA3] hover:text-[#F2F2F2]'
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span className="text-[10px] font-medium">Passes</span>
          {userBookings.length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#00C878]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('host')}
          className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition-all ${
            currentView === 'host'
              ? 'text-[#00C878]'
              : 'text-[#9EABA3] hover:text-[#F2F2F2]'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Host</span>
        </button>

      </div>
    </nav>
  );
};
