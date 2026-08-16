import React from 'react';
import {
  Compass,
  MapPin,
  Ticket,
  PlusCircle,
  User,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileBottomNavProps {
  currentView: 'explore' | 'results' | 'passes' | 'host' | 'ops';
  setCurrentView: (view: 'explore' | 'results' | 'passes' | 'host' | 'ops') => void;
  onOpenNavDrawer: () => void;
}

/**
 * Mobile Bottom Navigation Bar (Hotels.ng simplicity)
 * Provides 1-tap navigation for mobile and tablet users.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  onOpenNavDrawer,
}) => {
  const {
    currentUser,
    bookings,
    setIsListSpaceModalOpen,
    openAuthModal,
    setSelectedSpace,
  } = useApp();

  const activeBookingsCount = currentUser
    ? bookings.filter(
        b => b.coworkerId === currentUser.id && (b.status === 'confirmed' || b.status === 'checked_in')
      ).length
    : 0;

  return (
    <div
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-lg border-t border-[#222222] px-2 py-1.5 shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Explore */}
        <button
          type="button"
          id="mobile-nav-explore-btn"
          onClick={() => {
            setSelectedSpace(null);
            setCurrentView('explore');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'explore'
              ? 'text-[#00C878] font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <Compass className={`w-5 h-5 mb-0.5 ${currentView === 'explore' ? 'text-[#00C878]' : ''}`} />
          <span className="text-[10px]">Explore</span>
        </button>

        {/* 2. Map Search */}
        <button
          type="button"
          id="mobile-nav-map-btn"
          onClick={() => {
            setSelectedSpace(null);
            setCurrentView('results');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'results'
              ? 'text-[#00C878] font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <MapPin className={`w-5 h-5 mb-0.5 ${currentView === 'results' ? 'text-[#00C878]' : ''}`} />
          <span className="text-[10px]">Map</span>
        </button>

        {/* 3. List Space CTA (Center Highlight) */}
        <button
          type="button"
          id="mobile-nav-list-btn"
          onClick={() => setIsListSpaceModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#00C878] hover:text-[#00B06A] transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-[#00C878]/15 border border-[#00C878]/40 flex items-center justify-center text-[#00C878] group-active:scale-95 transition-transform mb-0.5">
            <PlusCircle className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-[#00C878]">List Space</span>
        </button>

        {/* 4. Passes */}
        <button
          type="button"
          id="mobile-nav-passes-btn"
          onClick={() => {
            setSelectedSpace(null);
            setCurrentView('passes');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
            currentView === 'passes'
              ? 'text-[#00C878] font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <div className="relative">
            <Ticket className={`w-5 h-5 mb-0.5 ${currentView === 'passes' ? 'text-[#00C878]' : ''}`} />
            {activeBookingsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#00C878] text-[9px] font-black text-[#0D0D0D] flex items-center justify-center">
                {activeBookingsCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Passes</span>
        </button>

        {/* 5. Menu / Account */}
        <button
          type="button"
          id="mobile-nav-menu-btn"
          onClick={onOpenNavDrawer}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#888888] hover:text-white transition-all cursor-pointer"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </div>
    </div>
  );
};
