import React, { useState } from 'react';
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  Ticket,
  Bookmark,
  Check,
  Camera,
  MessageSquare,
  Settings,
  LogIn,
  UserPlus,
  MapPin,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../mockData';
import { OfisLogo } from './OfisLogo';

interface NavbarProps {
  currentView: 'explore' | 'results' | 'passes' | 'host' | 'ops';
  setCurrentView: (view: 'explore' | 'results' | 'passes' | 'host' | 'ops') => void;
  onOpenNavDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenNavDrawer,
}) => {
  const {
    currentUser,
    isAuthenticated,
    signOut,
    switchDemoUser,
    setCategoryFilter,
    setIsListSpaceModalOpen,
    openAiModal,
    openAuthModal,
    openAvatarModal,
    showToast,
    bookings,
    favorites,
  } = useApp();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Active bookings count
  const activeBookingsCount = currentUser
    ? bookings.filter(
        b => b.coworkerId === currentUser.id && (b.status === 'confirmed' || b.status === 'checked_in')
      ).length
    : 0;

  const closeAllDropdowns = () => {
    setIsProfileDropdownOpen(false);
    setIsNotificationOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md text-white border-b border-[#222222] shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Header Bar: TOP LEFT (☰) | HEADER CENTRE (OFIS LOGO) | TOP RIGHT (Currency, Notifications, Avatar) */}
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* TOP LEFT: Hamburger Menu ☰ (Opens Navigation & Information Drawer) */}
          <div className="flex items-center gap-3">
            <button
              id="header-hamburger-drawer-btn"
              type="button"
              onClick={() => {
                closeAllDropdowns();
                onOpenNavDrawer();
              }}
              className="p-2 sm:p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-[#1E1E1E] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Open navigation menu drawer"
            >
              <Menu className="w-6 h-6 text-stone-200 hover:text-[#00C878] transition-colors" />
            </button>

            {/* Desktop Quick Nav (Hotels.ng simplicity) */}
            <nav className="hidden md:flex items-center gap-1 bg-[#171717] p-1 rounded-2xl border border-[#262626]">
              <button
                type="button"
                id="nav-explore-btn"
                onClick={() => {
                  setCurrentView('explore');
                  closeAllDropdowns();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'explore'
                    ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 font-black'
                    : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Spaces</span>
              </button>

              <button
                type="button"
                id="nav-map-results-btn"
                onClick={() => {
                  setCurrentView('results');
                  closeAllDropdowns();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'results'
                    ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 font-black'
                    : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>

              <button
                type="button"
                id="nav-passes-btn"
                onClick={() => {
                  setCurrentView('passes');
                  closeAllDropdowns();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'passes'
                    ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 font-black'
                    : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Passes</span>
                {activeBookingsCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-[#00C878] text-[#0D0D0D]">
                    {activeBookingsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="nav-host-hub-btn"
                onClick={() => {
                  setCurrentView('host');
                  closeAllDropdowns();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'host'
                    ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 font-black'
                    : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Host Hub</span>
              </button>
            </nav>
          </div>

          {/* HEADER CENTRE: Exact Locked OFIS Logo Asset */}
          <div className="flex items-center justify-center">
            <button
              id="brand-logo-btn"
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setCurrentView('explore');
                closeAllDropdowns();
              }}
              className="flex items-center justify-center py-1 group focus:outline-none cursor-pointer transition-opacity hover:opacity-95"
              aria-label="OFIS Home"
            >
              <OfisLogo size="md" />
            </button>
          </div>

          {/* TOP RIGHT: List Your Space CTA | AI Advisor | Notifications | User Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Hotels.ng style Prominent "List Your Space" Button */}
            <button
              type="button"
              id="header-list-space-btn"
              onClick={() => setIsListSpaceModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00C878] hover:bg-[#00B06A] text-[#0A0A0A] font-bold text-xs transition-all shadow-md shadow-[#00C878]/15 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Your Space</span>
            </button>

            {/* AI Advisor Button */}
            <button
              type="button"
              id="ai-advisor-nav-btn"
              onClick={() => openAiModal('match')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#171717] hover:bg-[#222222] text-[#F2F2F2] border border-[#2A2A2A] hover:border-[#D6A83A]/60 text-xs font-bold transition-all cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D6A83A] group-hover:scale-110 transition-transform" />
              <span className="text-[11px]">AI Match</span>
            </button>

            {/* Notification Bell (🔔) */}
            <div className="relative">
              <button
                type="button"
                id="header-notification-btn"
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileDropdownOpen(false);
                }}
                className="p-2 rounded-xl border border-[#282828] bg-[#171717] hover:bg-[#222222] text-[#9A9A9A] hover:text-white transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#00C878] text-[9px] font-black text-[#0D0D0D] flex items-center justify-center shadow-sm">
                  2
                </span>
              </button>

              {isNotificationOpen && (
                <div
                  id="notifications-panel"
                  className="absolute right-0 mt-2 w-80 bg-[#171717] rounded-2xl shadow-2xl border border-[#2A2A2A] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#282828]">
                    <span className="text-xs font-bold text-[#F2F2F2]">Notifications</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#063B2A] text-[#00C878] font-bold">
                      2 Active
                    </span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="p-2.5 rounded-xl bg-[#222222] border border-[#2D2D2D] text-xs">
                      <div className="font-bold text-[#00C878]">Booking Confirmed!</div>
                      <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                        Your desk pass at Greenhouse Studio (Lekki Phase 1) is active.
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#1C1C1C] border border-[#282828] text-xs">
                      <div className="font-bold text-[#00C878]">⚡ 24/7 Power Guaranteed</div>
                      <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                        Dual generators & solar inverters active across all verified spaces.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="header-profile-avatar-btn"
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center justify-center p-0.5 rounded-full ring-2 ring-[#282828] hover:ring-[#00C878] transition-all cursor-pointer group focus:outline-none"
                aria-label="User account menu"
              >
                {isAuthenticated && currentUser ? (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-[#1A1A1A] relative shadow-md">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00C878] rounded-full ring-1 ring-[#0D0D0D]" />
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1C1C1C] border border-[#333333] flex items-center justify-center text-stone-300 hover:text-white hover:bg-[#252525] transition-colors">
                    <User className="w-4 h-4 text-stone-400 group-hover:text-[#00C878] transition-colors" />
                  </div>
                )}
              </button>

              {/* Avatar Menu Dropdown matching User Request */}
              {isProfileDropdownOpen && (
                <div
                  id="profile-menu-dropdown"
                  className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#161616] rounded-2xl shadow-2xl border border-[#2A2A2A] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white"
                >
                  {isAuthenticated && currentUser ? (
                    <>
                      {/* Logged-In User Profile Header */}
                      <div className="p-3 bg-[#1D1D1D] rounded-xl border border-[#2A2A2A] mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-[#242424] ring-2 ring-[#00C878]/60 shrink-0">
                            <img
                              src={currentUser.avatar}
                              alt={currentUser.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
                            <div className="text-xs text-[#9A9A9A] truncate">{currentUser.email}</div>
                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#063B2A] text-[#00C878] border border-[#00C878]/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00C878]" />
                              {(currentUser?.role || 'coworker').toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Required Avatar Menu Links */}
                      <div className="space-y-0.5 py-1">
                        {/* 1. My Profile */}
                        <button
                          type="button"
                          id="menu-item-my-profile"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            openAvatarModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-200 hover:bg-[#222222] hover:text-[#00C878] transition-colors cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-[#00C878]" />
                          <span>My Profile</span>
                        </button>

                        {/* 2. My Bookings */}
                        <button
                          type="button"
                          id="menu-item-my-bookings"
                          onClick={() => {
                            setCurrentView('passes');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-200 hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Ticket className="w-4 h-4 text-stone-400" />
                            <span>My Bookings</span>
                          </div>
                          {activeBookingsCount > 0 && (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#00C878] text-[#0D0D0D] rounded-full">
                              {activeBookingsCount}
                            </span>
                          )}
                        </button>

                        {/* 3. Saved Spaces */}
                        <button
                          type="button"
                          id="menu-item-saved-spaces"
                          onClick={() => {
                            setCategoryFilter('saved');
                            setCurrentView('results');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-200 hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Bookmark className="w-4 h-4 text-stone-400" />
                            <span>Saved Spaces</span>
                          </div>
                          <span className="text-[11px] text-[#9A9A9A]">{favorites.length}</span>
                        </button>

                        {/* 4. Messages */}
                        <button
                          type="button"
                          id="menu-item-messages"
                          onClick={() => {
                            showToast('Host messaging channel is active.', 'info');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-200 hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 text-stone-400" />
                          <span>Messages</span>
                        </button>

                        {/* 5. List a Space */}
                        <button
                          type="button"
                          id="menu-item-list-space"
                          onClick={() => {
                            setIsListSpaceModalOpen(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#00C878] hover:bg-[#063B2A]/40 transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-[#00C878]" />
                          <span>List a Space</span>
                        </button>

                        {/* 6. Host Hub */}
                        <button
                          type="button"
                          id="menu-item-host-hub"
                          onClick={() => {
                            setCurrentView('host');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-200 hover:bg-[#222222] transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-stone-400" />
                          <span>Host Hub</span>
                        </button>
                      </div>

                      {/* Demo User Switcher */}
                      <div className="p-2 border-t border-[#262626] mt-1">
                        <div className="px-2 py-1 text-[10px] font-bold text-[#9A9A9A] uppercase tracking-wider">
                          Switch Demo User
                        </div>
                        <div className="space-y-1 mt-1">
                          {DEMO_USERS.map(user => (
                            <button
                              key={user.id}
                              type="button"
                              id={`demo-user-select-${user.id}`}
                              onClick={() => {
                                switchDemoUser(user.id);
                                setIsProfileDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                                currentUser?.id === user.id
                                  ? 'bg-[#063B2A] text-[#00C878] font-bold'
                                  : 'hover:bg-[#222222] text-[#F2F2F2]'
                              }`}
                            >
                              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold truncate">{user.name}</div>
                                <div className="text-[10px] text-[#9A9A9A] capitalize">
                                  {user.role} ({user.company || 'Member'})
                                </div>
                              </div>
                              {currentUser?.id === user.id && <Check className="w-3.5 h-3.5 text-[#00C878] shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 7. Account Settings & 8. Sign Out */}
                      <div className="p-1 border-t border-[#262626] space-y-0.5 mt-1">
                        <button
                          type="button"
                          id="menu-item-account-settings"
                          onClick={() => {
                            showToast('Account settings & notifications configured.', 'info');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Account Settings</span>
                        </button>

                        <button
                          type="button"
                          id="menu-item-signout"
                          onClick={() => {
                            signOut();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* When user is NOT signed in: Sign In & Create Account */
                    <div className="p-2 space-y-2">
                      <div className="p-3 bg-[#1D1D1D] rounded-xl border border-[#2A2A2A] text-center">
                        <div className="w-10 h-10 rounded-full bg-[#063B2A] text-[#00C878] mx-auto flex items-center justify-center mb-2">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-white">Welcome to OFIS</div>
                        <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                          Book physical workspaces across Nigeria
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <button
                          type="button"
                          id="menu-signin-btn"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            openAuthModal('signin');
                          }}
                          className="w-full py-2 px-3 bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Sign In</span>
                        </button>

                        <button
                          type="button"
                          id="menu-create-account-btn"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            openAuthModal('signup');
                          }}
                          className="w-full py-2 px-3 bg-[#222222] hover:bg-[#2A2A2A] text-white font-semibold text-xs rounded-xl border border-[#333333] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4 text-[#00C878]" />
                          <span>Create Account</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
