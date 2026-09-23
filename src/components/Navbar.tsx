import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Bookmark, 
  CalendarCheck, 
  Sparkles, 
  PlusCircle, 
  Menu, 
  Bell, 
  Settings, 
  User, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  ChevronDown, 
  RefreshCw, 
  Building2, 
  Activity, 
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OFISWordmark } from './OFISWordmark';
import { NotificationCenterDropdown } from './NotificationCenterDropdown';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    savedSpaceIds,
    unreadNotificationsCount,
    openAuthModal,
    setIsListSpaceModalOpen,
    setIsAiModalOpen,
    setIsDrawerOpen,
    setIsSettingsOpen,
    setIsDiagnosticsModalOpen,
    setIsAdminReviewModalOpen,
    pendingSpacesCount,
    signOut,
    isGuest,
    switchUserRole,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#07383D]/95 backdrop-blur-md border-b border-[#E2ECEB] dark:border-[#105A60] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[70px] flex items-center justify-between gap-4">
        
        {/* Left Side: Hamburger Menu + Brand Logo */}
        <div className="flex items-center space-x-3.5 sm:space-x-4 shrink-0">
          <button
            type="button"
            id="navbar-menu-drawer-btn"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#0B4A50] hover:bg-[#E2ECEB] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-[#12383B] hover:text-[#006B70] dark:text-[#B8D1D0] dark:hover:text-white transition-all cursor-pointer shadow-2xs"
            aria-label="Open Navigation Menu"
            title="Explore About, FAQ, Help & Information"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            className="flex items-center cursor-pointer transition-transform hover:opacity-95" 
            onClick={() => setCurrentView('explore')}
          >
            <OFISWordmark size="md" />
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
          <button
            type="button"
            id="nav-explore-btn"
            onClick={() => setCurrentView('explore')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentView === 'explore' 
                ? 'bg-[#14BEB8]/10 dark:bg-[#28D2CB]/15 text-[#006B70] dark:text-[#28D2CB] border border-[#14BEB8]/30 font-bold shadow-2xs' 
                : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#14BEB8]" />
            <span>Marketplace</span>
          </button>

          <button
            type="button"
            id="nav-around-me-btn"
            onClick={() => setCurrentView('map')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentView === 'map' 
                ? 'bg-[#14BEB8]/10 dark:bg-[#28D2CB]/15 text-[#006B70] dark:text-[#28D2CB] border border-[#14BEB8]/30 font-bold shadow-2xs' 
                : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50]'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#14BEB8]" />
            <span>Around Me</span>
          </button>

          <button
            type="button"
            id="nav-bookings-btn"
            onClick={() => setCurrentView('bookings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentView === 'bookings' 
                ? 'bg-[#14BEB8]/10 dark:bg-[#28D2CB]/15 text-[#006B70] dark:text-[#28D2CB] border border-[#14BEB8]/30 font-bold shadow-2xs' 
                : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50]'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-[#14BEB8]" />
            <span>My Bookings</span>
          </button>

          <button
            type="button"
            id="nav-saved-btn"
            onClick={() => setCurrentView('saved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentView === 'saved' 
                ? 'bg-[#14BEB8]/10 dark:bg-[#28D2CB]/15 text-[#006B70] dark:text-[#28D2CB] border border-[#14BEB8]/30 font-bold shadow-2xs' 
                : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50]'
            }`}
          >
            <Bookmark className="w-4 h-4 text-[#14BEB8]" />
            <span>Saved</span>
            {savedSpaceIds.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FFA987] text-[#12383B] font-bold text-[10px] flex items-center justify-center shadow-xs">
                {savedSpaceIds.length}
              </span>
            )}
          </button>

          {/* Ofis Assistant Trigger with Soft Peach styling */}
          <button
            type="button"
            id="nav-assistant-btn"
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#006B70] dark:text-[#FFA987] bg-[#FFD0BD]/25 hover:bg-[#FFD0BD]/40 dark:bg-[#FFA987]/15 dark:hover:bg-[#FFA987]/25 border border-[#FFA987]/40 transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFA987]" />
            <span>Ofis Assistant</span>
          </button>
        </nav>

        {/* Right Side: List Space CTA, Notifications, Account Button */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">

          {/* List Space CTA - Primary Teal Button */}
          <button
            type="button"
            id="navbar-list-space-btn"
            onClick={() => setIsListSpaceModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>List Space</span>
          </button>

          {/* Header Notification Center Bell */}
          <div className="relative" ref={notificationButtonRef}>
            <button
              type="button"
              id="navbar-notifications-btn"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                isNotificationsOpen 
                  ? 'bg-[#FFD0BD]/30 border-[#FFA987] text-[#006B70] dark:text-[#FFA987]' 
                  : 'bg-[#FFF9F4] dark:bg-[#0B4A50] hover:bg-[#E2ECEB] dark:hover:bg-[#105A60] border-[#E2ECEB] dark:border-[#166D74] text-[#12383B] dark:text-[#B8D1D0]'
              }`}
              title="Notifications & Space Availability Alerts"
              aria-label="View notifications and availability alerts"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-4.5 px-1 rounded-full bg-[#FFA987] text-[#12383B] text-[10px] font-black flex items-center justify-center shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Container */}
            <NotificationCenterDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* Extreme Right: Unified User Account / Sign In Control */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              id="navbar-user-profile-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/60 text-xs font-semibold text-[#12383B] dark:text-white transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-5 h-5 rounded-lg bg-[#FFD0BD]/40 text-[#006B70] dark:text-[#FFA987] flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate">
                {isGuest ? 'Sign In' : currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#5D7A7D] dark:text-[#B8D1D0] transition-transform ${isUserMenuOpen ? 'rotate-180 text-[#14BEB8]' : ''}`} />
            </button>

            {/* Profile Dropdown Popover */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-xl p-2.5 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* User Info Header */}
                <div className="p-2.5 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#12383B] dark:text-white truncate">{currentUser.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#FFD0BD]/50 text-[#006B70] dark:text-[#FFA987]">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] truncate">{currentUser.email}</p>
                </div>

                {/* Switch Role Trigger */}
                <button
                  type="button"
                  id="menu-switch-role-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    switchUserRole(currentUser.role === 'user' ? 'host' : 'user');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#12383B] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors text-left cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#14BEB8]" />
                  <span>Switch to {currentUser.role === 'user' ? 'Host Mode' : 'Guest Mode'}</span>
                </button>

                {/* Host Dashboard Link (Host Only) */}
                {currentUser.role === 'host' && (
                  <button
                    type="button"
                    id="menu-host-dashboard-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setCurrentView('host_dashboard');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#12383B] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors text-left cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#14BEB8]" />
                    <span>Host Dashboard</span>
                  </button>
                )}

                {/* Admin Verification Portal Link */}
                <button
                  type="button"
                  id="menu-admin-verification-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsAdminReviewModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#12383B] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#14BEB8]" />
                    <span>Admin Review Portal</span>
                  </div>
                  {pendingSpacesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFA987] text-[#12383B]">
                      {pendingSpacesCount}
                    </span>
                  )}
                </button>

                {/* Host Diagnostics Trigger */}
                {currentUser.role === 'host' && (
                  <button
                    type="button"
                    id="menu-diagnostics-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsDiagnosticsModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#12383B] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors text-left cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-[#14BEB8]" />
                    <span>System Diagnostics</span>
                  </button>
                )}

                {/* Profile Edit Trigger */}
                <button
                  type="button"
                  id="menu-edit-profile-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openAuthModal('profile');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#12383B] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#14BEB8]" />
                  <span>Profile & Account</span>
                </button>

                {/* Platform Preferences Trigger */}
                <button
                  type="button"
                  id="menu-settings-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#12383B] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#FFA987]" />
                  <span>Preferences</span>
                </button>

                {/* Auth Actions (Sign In / Sign Up vs Sign Out) */}
                <div className="pt-1 border-t border-[#E2ECEB] dark:border-[#166D74] space-y-1">
                  {isGuest ? (
                    <>
                      <button
                        type="button"
                        id="menu-sign-up-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('signup');
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#006B70] dark:text-[#28D2CB] hover:bg-[#14BEB8]/10 transition-colors text-left cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-[#14BEB8]" />
                        <span>Create Account</span>
                      </button>
                      <button
                        type="button"
                        id="menu-sign-in-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#12383B] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] transition-colors text-left cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 text-[#5D7A7D]" />
                        <span>Sign In</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      id="menu-sign-out-btn"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};


