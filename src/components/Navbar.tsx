import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  MapPin, 
  Compass, 
  Ticket, 
  Building2, 
  Bell, 
  User, 
  ChevronDown, 
  Sparkles, 
  PlusCircle, 
  ShieldCheck, 
  Settings,
  CheckCircle2,
  Zap,
  Search,
  X,
  CreditCard,
  QrCode,
  CheckCheck,
  AlertCircle,
  Inbox
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../mockData';
import ofisWordmark from '../assets/ofis-wordmark.png';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchUser,
    currentView,
    setCurrentView,
    filters,
    updateFilter,
    setIsNavDrawerOpen,
    setIsAuthModalOpen,
    setIsListSpaceOpen,
    setIsAiAssistantOpen,
    setIsSettingsOpen,
    userBookings,
    setActivePassBooking,
    setSelectedBookingDetails,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    focusSearchInput,
    currency,
    setCurrency,
    formatPrice,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global hotkey to focus search (CMD+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const activeBooking = userBookings.find(b => b.bookingStatus === 'confirmed');
  const activePassesCount = userBookings.filter(b => b.bookingStatus === 'confirmed').length;

  const handleNavClick = (view: 'explore' | 'map' | 'bookings' | 'host') => {
    if (view === 'explore') {
      focusSearchInput();
    } else {
      setCurrentView(view);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter('searchQuery', e.target.value);
    if (currentView !== 'explore' && e.target.value.trim().length > 0) {
      setCurrentView('explore');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#1E2522] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px] gap-2 sm:gap-4">
          
          {/* ========================================================================= */}
          {/* LEFT: Logo & Desktop Navigation Links                                     */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 min-w-0">
            
            {/* Logo: First Element with Transparent Background & Precise 38-42px Height */}
            <button
              id="nav-brand-logo-btn"
              type="button"
              onClick={() => handleNavClick('explore')}
              className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C878]/50 rounded-lg p-0.5 transition-opacity duration-200 hover:opacity-90"
              aria-label="OFIS Home"
            >
              <img
                src={ofisWordmark}
                alt="OFIS"
                className="h-[38px] sm:h-[40px] w-auto object-contain select-none block"
              />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary Navigation">
              
              <button
                id="nav-link-spaces"
                type="button"
                onClick={() => handleNavClick('explore')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
                  currentView === 'explore'
                    ? 'text-[#00C878] bg-[#00C878]/10 font-semibold'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19]'
                }`}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Spaces</span>
              </button>

              <button
                id="nav-link-map"
                type="button"
                onClick={() => handleNavClick('map')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
                  currentView === 'map'
                    ? 'text-[#00C878] bg-[#00C878]/10 font-semibold'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19]'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0 text-[#00C878]" />
                <span>Around Me</span>
              </button>

              <button
                id="nav-link-passes"
                type="button"
                onClick={() => handleNavClick('bookings')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out relative ${
                  currentView === 'bookings'
                    ? 'text-[#00C878] bg-[#00C878]/10 font-semibold'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19]'
                }`}
              >
                <Ticket className="w-4 h-4 shrink-0" />
                <span>Access Passes</span>
                {activePassesCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold bg-[#00C878] text-[#0D0D0D] rounded-full min-w-[18px] h-[18px]">
                    {activePassesCount}
                  </span>
                )}
              </button>

              <button
                id="nav-link-host"
                type="button"
                onClick={() => handleNavClick('host')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
                  currentView === 'host'
                    ? 'text-[#00C878] bg-[#00C878]/10 font-semibold'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19]'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Host Portal</span>
              </button>
            </nav>

          </div>

          {/* ========================================================================= */}
          {/* CENTER: Desktop Sleek Search Input                                        */}
          {/* ========================================================================= */}
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-2">
            <div className={`relative w-full flex items-center rounded-xl bg-[#141816] border transition-all duration-200 ${
              searchFocused 
                ? 'border-[#00C878]/60 bg-[#161C19] ring-2 ring-[#00C878]/15' 
                : 'border-[#232D28] hover:border-[#35433C]'
            }`}>
              <Search className="w-4 h-4 absolute left-3 text-[#718079] pointer-events-none shrink-0" />
              
              <input
                ref={searchInputRef}
                type="text"
                value={filters.searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search spaces, areas, cities..."
                className="w-full pl-9 pr-14 py-2 bg-transparent text-xs text-[#F2F2F2] placeholder-[#718079] focus:outline-none"
              />

              {filters.searchQuery ? (
                <button
                  type="button"
                  onClick={() => updateFilter('searchQuery', '')}
                  className="absolute right-2.5 p-1 rounded-md text-[#718079] hover:text-[#F2F2F2] hover:bg-[#232D28] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#1C2420] border border-[#2B3831] text-[10px] text-[#718079] font-mono select-none pointer-events-none">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: Actions, Notifications, User Profile & Mobile Hamburger            */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Currency Switcher Quick Toggle (Desktop) */}
            <div className="hidden lg:flex items-center bg-[#141816] border border-[#232D28] rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCurrency('NGN')}
                className={`px-2 py-1 rounded transition-all flex items-center gap-0.5 ${
                  currency === 'NGN'
                    ? 'bg-[#00C878] text-[#0D0D0D] shadow-sm'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2]'
                }`}
                title="Nigerian Naira"
              >
                <span>₦</span>
                <span>NGN</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded transition-all flex items-center gap-0.5 ${
                  currency === 'USD'
                    ? 'bg-[#00C878] text-[#0D0D0D] shadow-sm'
                    : 'text-[#9EABA3] hover:text-[#F2F2F2]'
                }`}
                title="US Dollar (Auto-converted)"
              >
                <span>$</span>
                <span>USD</span>
              </button>
            </div>

            {/* AI Assistant Quick Trigger (Desktop) */}
            <button
              id="nav-ai-assistant-btn"
              type="button"
              onClick={() => setIsAiAssistantOpen(true)}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141816] border border-[#232D28] hover:border-[#00C878]/40 text-xs font-medium text-[#9EABA3] hover:text-[#00C878] transition-all duration-200 ease-out"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00C878]" />
              <span>AI Concierge</span>
            </button>

            {/* List Space CTA (Desktop) */}
            <button
              id="nav-list-space-btn"
              type="button"
              onClick={() => setIsListSpaceOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#0D0D0D] bg-[#00C878] hover:bg-[#00E58B] transition-all duration-200 ease-out active:scale-[0.98]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Space</span>
            </button>

            {/* Notification Bell (Desktop & Mobile) */}
            <div className="relative" ref={notifRef}>
              <button
                id="nav-notifications-btn"
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 sm:p-2.5 rounded-lg border text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19] transition-all duration-200 ease-out relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C878]/50 ${
                  isNotificationsOpen 
                    ? 'bg-[#161D19] border-[#232D28] text-[#F2F2F2]' 
                    : 'border-transparent hover:border-[#232D28]'
                }`}
                aria-label="View notifications"
                aria-expanded={isNotificationsOpen}
              >
                <Bell className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#00C878] text-[#0D0D0D] text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[#0D0D0D]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#121614] border border-[#232D28] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1E2522]">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#F2F2F2]">Notifications</h4>
                      {unreadNotificationsCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#00C878]/15 text-[#00C878]">
                          {unreadNotificationsCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-semibold text-[#00C878] hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => {
                        return (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.bookingId) {
                                const matchedBooking = userBookings.find(b => b.id === notif.bookingId);
                                if (matchedBooking) {
                                  if (matchedBooking.bookingStatus === 'active' || matchedBooking.bookingStatus === 'confirmed') {
                                    setActivePassBooking(matchedBooking);
                                  } else {
                                    setSelectedBookingDetails(matchedBooking);
                                  }
                                } else {
                                  setCurrentView('bookings');
                                }
                              } else if (notif.spaceId) {
                                setCurrentView('explore');
                              }
                              setIsNotificationsOpen(false);
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                              notif.read
                                ? 'bg-[#141816] border-[#1E2522] text-[#9EABA3] hover:border-[#2A3630]'
                                : 'bg-[#17201B] border-[#00C878]/30 text-[#F2F2F2] hover:border-[#00C878]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-xs font-semibold">
                                {notif.type === 'booking_confirmed' && <Zap className="w-3.5 h-3.5 text-[#00C878]" />}
                                {notif.type === 'payment_confirmed' && <ShieldCheck className="w-3.5 h-3.5 text-[#00C878]" />}
                                {notif.type === 'booking_cancelled' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                                {notif.type === 'host_verification_update' && <ShieldCheck className="w-3.5 h-3.5 text-[#00C878]" />}
                                {notif.type === 'listing_published' && <Building2 className="w-3.5 h-3.5 text-[#00C878]" />}
                                <span className={notif.read ? 'text-[#9EABA3]' : 'text-[#00C878]'}>{notif.title}</span>
                              </div>
                              <span className="text-[10px] text-[#718079] whitespace-nowrap">{notif.timestamp}</span>
                            </div>
                            <p className="text-xs text-[#9EABA3] mt-1 leading-relaxed">{notif.message}</p>
                            {notif.reference && (
                              <div className="mt-1.5 text-[10px] font-mono text-[#718079]">
                                Ref: {notif.reference}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-[#718079] space-y-1.5">
                        <Inbox className="w-8 h-8 mx-auto opacity-40 text-[#9EABA3]" />
                        <p className="text-xs font-semibold text-[#9EABA3]">You're all caught up.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar Dropdown (Desktop & Mobile) */}
            <div className="relative" ref={profileRef}>
              <button
                id="nav-user-profile-btn"
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C878]/50 ${
                  isProfileOpen 
                    ? 'bg-[#161D19] border-[#35433C]' 
                    : 'bg-[#141816] border-[#232D28] hover:border-[#35433C]'
                }`}
                aria-label="User menu"
                aria-expanded={isProfileOpen}
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#00C878]/30 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-[#232D28] flex items-center justify-center text-[#00C878] shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="text-xs font-semibold text-[#F2F2F2] hidden sm:inline max-w-[85px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#718079] hidden sm:inline transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180 text-[#00C878]' : ''
                }`} />
              </button>

              {/* User Dropdown Popover */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#121614] border border-[#232D28] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Card */}
                  <div className="p-2.5 pb-3 border-b border-[#1E2522]">
                    <div className="flex items-center gap-2.5">
                      {currentUser.avatarUrl && (
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#00C878]/40"
                        />
                      )}
                      <div className="overflow-hidden min-w-0">
                        <p className="text-xs font-bold text-[#F2F2F2] truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-[#718079] truncate">{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs bg-[#161D19] px-2.5 py-1.5 rounded-lg border border-[#1E2522]">
                      <span className="text-[#9EABA3] flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#718079]" />
                        <span>Wallet</span>
                      </span>
                      <span className="font-semibold text-[#00C878]">{formatPrice(currentUser.walletBalance)}</span>
                    </div>
                  </div>

                  {/* Switch Demo Roles */}
                  <div className="py-2 border-b border-[#1E2522]">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#718079] px-2 mb-1">
                      Switch Role
                    </p>
                    <div className="space-y-0.5">
                      {DEMO_USERS.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            switchUser(u.id);
                            setIsProfileOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 ${
                            currentUser.id === u.id
                              ? 'bg-[#00C878]/10 text-[#00C878] font-semibold'
                              : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19]'
                          }`}
                        >
                          <span className="truncate">{u.name} ({u.role})</span>
                          {currentUser.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19] transition-colors duration-150"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Account Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19] transition-colors duration-150"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00C878]" />
                      <span>Sign In / Auth</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="nav-mobile-hamburger-btn"
              type="button"
              onClick={() => setIsNavDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#161D19] border border-transparent hover:border-[#232D28] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C878]/50"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

