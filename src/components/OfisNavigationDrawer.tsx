import React from 'react';
import { 
  X, 
  Compass, 
  MapPin, 
  Ticket, 
  Building2, 
  PlusCircle, 
  Sparkles, 
  Shield, 
  HelpCircle, 
  PhoneCall, 
  Settings,
  ChevronRight,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ofisWordmark from '../assets/ofis-wordmark.png';
import { POPULAR_CITIES, CATEGORY_METADATA } from '../mockData';
import { SpaceCategory } from '../types';

export const OfisNavigationDrawer: React.FC = () => {
  const {
    isNavDrawerOpen,
    setIsNavDrawerOpen,
    currentView,
    setCurrentView,
    activeCategory,
    setActiveCategory,
    updateFilter,
    setIsListSpaceOpen,
    setIsAiAssistantOpen,
    setIsSettingsOpen,
    setIsAuthModalOpen,
    currentUser,
    focusSearchInput,
    currency,
    setCurrency,
    formatPrice,
  } = useApp();

  if (!isNavDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsNavDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-sm bg-[#121714] border-r border-[#1E2522] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
          
          {/* Header */}
          <div className="p-5 border-b border-[#1E2522] flex items-center justify-between">
            <div>
              <img
                src={ofisWordmark}
                alt="OFIS"
                className="h-9 w-auto object-contain"
              />
              <p className="text-[9px] font-mono font-bold tracking-widest text-[#00C878] uppercase mt-1">
                Nigeria's Physical Space Network
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNavDrawerOpen(false)}
              className="p-2 rounded-xl text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A231E] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 px-4 py-5 space-y-6">
            
            {/* Primary Explore Navigation */}
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#718079] mb-2">
                Explore Spaces
              </p>
              
              <button
                type="button"
                onClick={() => {
                  focusSearchInput();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentView === 'explore'
                    ? 'bg-[#00C878]/10 text-[#00C878] font-bold border border-[#00C878]/30'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Compass className="w-4 h-4" />
                  <span>Spaces (Search & Browse)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('map');
                  setIsNavDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentView === 'map'
                    ? 'bg-[#00C878]/10 text-[#00C878] font-bold border border-[#00C878]/30'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-[#00C878]" />
                  <span>Around Me (Map View)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('bookings');
                  setIsNavDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentView === 'bookings'
                    ? 'bg-[#00C878]/10 text-[#00C878] font-bold border border-[#00C878]/30'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Ticket className="w-4 h-4" />
                  <span>My Passes & Bookings</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>
            </div>

            {/* Reposted Dedicated Host Menu */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#141A17] border border-[#1E2722]">
              <div className="flex items-center justify-between px-1 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#00C878]">
                  Host Menu
                </p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00C878]/15 text-[#00C878]">
                  Host Earn ₦
                </span>
              </div>

              {/* Host a space option */}
              <button
                type="button"
                onClick={() => {
                  setIsListSpaceOpen(true);
                  setIsNavDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-[#0D0D0D] bg-[#00C878] hover:bg-[#00E58B] transition-all shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center space-x-2.5">
                  <PlusCircle className="w-4 h-4" />
                  <span>Host a Space</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Host Portal & Management */}
              <button
                type="button"
                onClick={() => {
                  setCurrentView('host');
                  setIsNavDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentView === 'host'
                    ? 'bg-[#00C878]/10 text-[#00C878] font-bold border border-[#00C878]/30'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#1A221E]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>Host Portal & Dashboard</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            {/* Quick Cities */}
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#718079] mb-2">
                Filter by City
              </p>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_CITIES.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      updateFilter('city', city);
                      setCurrentView('explore');
                      setIsNavDrawerOpen(false);
                    }}
                    className="p-2 text-xs font-semibold text-left rounded-xl bg-[#161D19] hover:bg-[#1E2522] text-[#9EABA3] hover:text-[#00C878] transition-all border border-[#1E2522]"
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions & Tools */}
            <div className="space-y-2 pt-2 border-t border-[#1E2522]">
              <button
                type="button"
                onClick={() => {
                  setIsAiAssistantOpen(true);
                  setIsNavDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#161D19] border border-[#232D28] hover:border-[#00C878]/50 text-xs font-semibold text-[#00C878] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask OFIS AI Concierge</span>
              </button>
            </div>
          </div>

          {/* Footer Profile status */}
          <div className="p-4 border-t border-[#1E2522] bg-[#0E1210] space-y-3">
            {/* Quick Currency Selector */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#161D19] border border-[#232D28]">
              <span className="text-[11px] text-[#9EABA3] flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Currency</span>
              </span>
              <div className="flex items-center bg-[#101412] p-0.5 rounded-lg border border-[#1E2522] text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setCurrency('NGN')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    currency === 'NGN'
                      ? 'bg-[#00C878] text-[#0D0D0D]'
                      : 'text-[#9EABA3] hover:text-[#F2F2F2]'
                  }`}
                >
                  ₦ NGN
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    currency === 'USD'
                      ? 'bg-[#00C878] text-[#0D0D0D]'
                      : 'text-[#9EABA3] hover:text-[#F2F2F2]'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                {currentUser.avatarUrl && (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#00C878]/30"
                  />
                )}
                <div>
                  <p className="text-xs font-bold text-[#F2F2F2]">{currentUser.name}</p>
                  <p className="text-[10px] text-[#00C878] font-medium">{formatPrice(currentUser.walletBalance)} Wallet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsNavDrawerOpen(false);
                }}
                className="p-2 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19] transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-[#1A231E] flex items-center justify-between text-[10px] text-[#718079]">
              <span className="font-mono font-semibold text-[#9EABA3]">OFIS v2.1.1</span>
              <span>Lagos • Abuja • Port Harcourt</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
