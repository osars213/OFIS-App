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
  UserPlus,
  Palette
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
    setIsLogoGalleryOpen,
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#101827]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1E293B] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[70px] flex items-center justify-between gap-4">
        
        {/* Left Side: Hamburger Menu on FAR LEFT + Brand Logo */}
        <div className="flex items-center space-x-3.5 sm:space-x-4 shrink-0">
          <button
            type="button"
            id="navbar-menu-drawer-btn"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] hover:text-[#111827] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] transition-all cursor-pointer shadow-2xs"
            aria-label="Open Navigation Menu"
            title="Explore About, FAQ, Help & Information"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center cursor-pointer transition-transform hover:opacity-95" onClick={() => setCurrentView('explore')}>
            <OFISWordmark size="md" />
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2.5">
          <button
            type="button"
            id="nav-explore-btn"
            onClick={() => setCurrentView('explore')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentView === 'explore' 
                ? 'bg-[#D1FAE5] dark:bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold shadow-2xs' 
                : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </button>

          <button
            type="button"
            id="nav-around-me-btn"
            onClick={() => setCurrentView('map')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentView === 'map' 
                ? 'bg-[#D1FAE5] dark:bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold shadow-2xs' 
                : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Around Me</span>
          </button>

          <button
            type="button"
            id="nav-bookings-btn"
            onClick={() => setCurrentView('bookings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentView === 'bookings' 
                ? 'bg-[#D1FAE5] dark:bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold shadow-2xs' 
                : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>My Bookings</span>
          </button>

          <button
            type="button"
            id="nav-saved-btn"
            onClick={() => setCurrentView('saved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentView === 'saved' 
                ? 'bg-[#D1FAE5] dark:bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold shadow-2xs' 
                : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#172033]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
            {savedSpaceIds.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#10B981] text-white font-bold text-[10px] flex items-center justify-center">
                {savedSpaceIds.length}
              </span>
            )}
          </button>

          {/* Ofis Assistant Trigger */}
          <button
            type="button"
            id="nav-assistant-btn"
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#10B981] bg-[#D1FAE5] dark:bg-[#10B981]/10 hover:bg-[#A7F3D0] dark:hover:bg-[#10B981]/20 border border-[#10B981]/30 transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ofis Assistant</span>
          </button>
        </nav>

        {/* Right Side: List Space CTA, Notifications, Avatar */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">

          {/* List Space CTA (Responsive) */}
          <button
            type="button"
            id="navbar-list-space-btn"
            onClick={() => setIsListSpaceModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#172033] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#1E293B] text-xs font-semibold text-[#111827] dark:text-[#F8FAFC] hover:border-[#10B981]/50 transition-all cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#10B981]" />
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
                  ? 'bg-[#D1FAE5] dark:bg-[#10B981]/15 border-[#10B981] text-[#10B981]' 
                  : 'bg-[#F1F5F9] dark:bg-[#172033] hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] hover:text-[#111827] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
              }`}
              title="Notifications & Space Availability Alerts"
              aria-label="View notifications and availability alerts"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-4.5 px-1 rounded-full bg-[#10B981] text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-pulse">
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

          {/* Extreme Right: Unified User Account / Avatar Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              id="navbar-user-profile-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1F2937] hover:bg-[#E2E8F0] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-xs transition-all cursor-pointer group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#16A34A]"
              />
              <span className="hidden sm:inline font-semibold text-[#111827] dark:text-[#F9FAFB] max-w-[90px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] dark:text-[#9CA3AF] transition-transform ${isUserMenuOpen ? 'rotate-180 text-[#16A34A]' : ''}`} />
            </button>

            {/* Profile Dropdown Popover */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] shadow-xl p-2.5 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* User Info Header */}
                <div className="p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] truncate">{currentUser.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#DCFCE7] dark:bg-[#16A34A]/15 text-[#16A34A]">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">{currentUser.email}</p>
                </div>

                {/* Switch Role Trigger */}
                <button
                  type="button"
                  id="menu-switch-role-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    switchUserRole(currentUser.role === 'user' ? 'host' : 'user');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors text-left cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#16A34A]" />
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
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors text-left cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#16A34A]" />
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
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                    <span>Admin Review Portal</span>
                  </div>
                  {pendingSpacesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B] text-white">
                      {pendingSpacesCount}
                    </span>
                  )}
                </button>

                {/* My Bookings Shortcut */}
                <button
                  type="button"
                  id="menu-my-bookings-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setCurrentView('bookings');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors text-left cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>My Bookings & Passes</span>
                </button>

                {/* Saved Spaces Shortcut */}
                <button
                  type="button"
                  id="menu-saved-spaces-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setCurrentView('saved');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Bookmark className="w-4 h-4 text-[#16A34A]" />
                    <span>Saved Spaces</span>
                  </div>
                  {savedSpaceIds.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A] text-white">
                      {savedSpaceIds.length}
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
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors text-left cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-[#16A34A]" />
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
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#16A34A]" />
                  <span>Edit Profile & Account</span>
                </button>

                {/* Platform Settings Trigger */}
                <button
                  type="button"
                  id="menu-settings-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#16A34A]" />
                  <span>Settings & Theme Preferences</span>
                </button>

                {/* Auth Actions (Sign In / Sign Up vs Sign Out) */}
                <div className="pt-1 border-t border-[#E5E7EB] dark:border-[#374151] space-y-1">
                  {isGuest ? (
                    <>
                      <button
                        type="button"
                        id="menu-sign-up-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('signup');
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#16A34A] hover:bg-[#DCFCE7] dark:hover:bg-[#16A34A]/10 transition-colors text-left cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account (+₦25k)</span>
                      </button>
                      <button
                        type="button"
                        id="menu-sign-in-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] transition-colors text-left cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                        <span>Sign In / Log In</span>
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
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#EF4444]/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#EF4444]" />
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


