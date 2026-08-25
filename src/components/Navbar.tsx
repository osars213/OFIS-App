import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
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

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    savedSpaceIds,
    unreadNotificationsCount,
    setIsAuthModalOpen,
    openAuthModal,
    setIsListSpaceModalOpen,
    setIsAiModalOpen,
    setIsDrawerOpen,
    setIsSettingsOpen,
    setIsDiagnosticsModalOpen,
    signOut,
    signIn,
    isGuest,
    switchUserRole,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#1E2522] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo / Wordmark */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('explore')}>
          <OFISWordmark size="md" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <button
            type="button"
            onClick={() => setCurrentView('explore')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              currentView === 'explore' 
                ? 'bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30' 
                : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              currentView === 'map' 
                ? 'bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30' 
                : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Around Me</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('bookings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              currentView === 'bookings' 
                ? 'bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30' 
                : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B]'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>My Bookings</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('saved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              currentView === 'saved' 
                ? 'bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30' 
                : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
            {savedSpaceIds.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#00C878] text-[#0D0D0D] font-bold text-[10px] flex items-center justify-center">
                {savedSpaceIds.length}
              </span>
            )}
          </button>

          {/* Ofis Assistant Trigger */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#00C878] bg-[#00C878]/10 hover:bg-[#00C878]/20 border border-[#00C878]/30 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ofis Assistant</span>
          </button>
        </nav>

        {/* Right Action Icons & User Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* System Diagnostics Trigger (Host Mode Only) */}
          {currentUser.role === 'host' && (
            <button
              type="button"
              id="navbar-diagnostics-btn"
              onClick={() => setIsDiagnosticsModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#141816] border border-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#00C878] hover:border-[#00C878]/50 transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Run System Diagnostics & Health Check"
            >
              <Activity className="w-3.5 h-3.5 text-[#00C878]" />
              <span className="hidden md:inline">Diagnostics</span>
            </button>
          )}

          {/* List a Space Button (Hosts) */}
          <button
            type="button"
            onClick={() => setIsListSpaceModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#00C878]" />
            <span>List Space</span>
          </button>

          {/* User Account / Profile Dropdown with Prominent Sign Out */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              id="navbar-user-profile-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#141816] hover:bg-[#18201B] border border-[#232D28] text-xs transition-all cursor-pointer group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#00C878]"
              />
              <span className="hidden sm:inline font-semibold text-[#F2F2F2] max-w-[100px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#718079] transition-transform ${isUserMenuOpen ? 'rotate-180 text-[#00C878]' : ''}`} />
            </button>

            {/* Profile Dropdown Popover */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141816] border border-[#232D28] shadow-2xl p-2.5 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* User Info Header */}
                <div className="p-2.5 rounded-xl bg-[#18201B] border border-[#232D28] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F2F2F2] truncate">{currentUser.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#00C878]/15 text-[#00C878]">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#718079] truncate">{currentUser.email}</p>
                </div>

                {/* Profile Modal Trigger */}
                <button
                  type="button"
                  id="menu-edit-profile-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openAuthModal('profile');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B] transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#00C878]" />
                  <span>Edit Profile & Account</span>
                </button>

                {/* Switch Role Trigger */}
                <button
                  type="button"
                  id="menu-switch-role-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    switchUserRole(currentUser.role === 'user' ? 'host' : 'user');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B] transition-colors text-left cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#00C878]" />
                  <span>Switch to {currentUser.role === 'user' ? 'Host Mode' : 'Guest Mode'}</span>
                </button>

                {/* Host Dashboard Link */}
                {currentUser.role === 'host' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setCurrentView('host_dashboard');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B] transition-colors text-left cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#00C878]" />
                    <span>Host Dashboard</span>
                  </button>
                )}

                <div className="pt-1 border-t border-[#232D28] space-y-1">
                  {isGuest ? (
                    <>
                      <button
                        type="button"
                        id="menu-sign-up-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('signup');
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#00C878] hover:bg-[#00C878]/10 transition-colors text-left cursor-pointer"
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
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B] transition-colors text-left cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 text-[#718079]" />
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
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#FF5C5C] hover:bg-[#FF5C5C]/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#FF5C5C]" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Dedicated Sign Out Button on Desktop if logged in */}
          {!isGuest && (
            <button
              type="button"
              id="navbar-sign-out-btn"
              onClick={signOut}
              title="Sign Out of OFIS"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#2D1616]/70 hover:bg-[#3D1A1A] border border-[#FF5C5C]/30 text-xs font-semibold text-[#FF8585] hover:text-[#FF5C5C] transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FF5C5C]" />
              <span>Sign Out</span>
            </button>
          )}

          {/* Sign In & Sign Up buttons if guest */}
          {isGuest && (
            <div className="hidden lg:flex items-center space-x-2">
              <button
                type="button"
                id="navbar-sign-in-btn"
                onClick={() => openAuthModal('login')}
                title="Sign In to OFIS"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] border border-[#232D28] text-xs font-semibold text-[#F2F2F2] transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#718079]" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                id="navbar-sign-up-btn"
                onClick={() => openAuthModal('signup')}
                title="Create OFIS Account"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-xs font-bold text-[#0D0D0D] shadow-md transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-xl bg-[#141816] hover:bg-[#18201B] border border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2] transition-all relative"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00C878]" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
