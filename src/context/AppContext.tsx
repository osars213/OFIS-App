import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Space, Booking, UserProfile, SearchFilterState, SpaceCategory, AppNotification } from '../types';
import { authService } from '../services/authService';
import { spacesService } from '../services/spacesService';
import { bookingsService } from '../services/bookingsService';
import { favoritesService } from '../services/favoritesService';
import { notificationsService } from '../services/notificationsService';

export type CurrencyCode = 'NGN' | 'USD';
export const USD_TO_NGN_RATE = 1450; // 1 USD = ₦1,450

interface AppContextType {
  currentUser: UserProfile;
  switchUser: (userId: string) => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  
  // Navigation & Views
  currentView: 'explore' | 'map' | 'bookings' | 'host' | 'details';
  setCurrentView: (view: 'explore' | 'map' | 'bookings' | 'host' | 'details') => void;
  selectedSpaceId: string | null;
  setSelectedSpaceId: (id: string | null) => void;
  
  // Spaces & Search Filters
  spaces: Space[];
  filters: SearchFilterState;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  updateFilter: <K extends keyof SearchFilterState>(key: K, value: SearchFilterState[K]) => void;
  resetFilters: () => void;
  activeCategory: SpaceCategory | 'all';
  setActiveCategory: (cat: SpaceCategory | 'all') => void;
  
  // Bookings
  userBookings: Booking[];
  refreshBookings: () => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'passCode' | 'qrCodeValue'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  activePassBooking: Booking | null;
  setActivePassBooking: (booking: Booking | null) => void;
  selectedBookingDetails: Booking | null;
  setSelectedBookingDetails: (booking: Booking | null) => void;
  
  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  refreshNotifications: () => void;

  // Favorites
  savedSpaceIds: string[];
  toggleSaveSpace: (spaceId: string) => void;
  
  // Modals & Popovers
  isNavDrawerOpen: boolean;
  setIsNavDrawerOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isListSpaceOpen: boolean;
  setIsListSpaceOpen: (open: boolean) => void;
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  checkoutSpace: Space | null;
  setCheckoutSpace: (space: Space | null) => void;
  contactHostData: { hostName: string; spaceTitle: string; phone?: string; email?: string } | null;
  setContactHostData: (data: { hostName: string; spaceTitle: string; phone?: string; email?: string } | null) => void;
  directionsData: { address: string; city: string; title: string; lat?: number; lng?: number } | null;
  setDirectionsData: (data: { address: string; city: string; title: string; lat?: number; lng?: number } | null) => void;
  writeReviewModalData: { spaceId: string; spaceTitle: string } | null;
  setWriteReviewModalData: (data: { spaceId: string; spaceTitle: string } | null) => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Theme & Search Focus
  themeMode: 'light' | 'dark' | 'system' | 'default';
  setThemeMode: (mode: 'light' | 'dark' | 'system' | 'default') => void;
  resolvedTheme: 'light' | 'dark';
  focusSearchInput: () => void;

  // Currency & Geolocation
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  detectedCountry: string | null;
  formatPrice: (amountInNgn: number, options?: { perHour?: boolean; perDay?: boolean; hideUnit?: boolean; compact?: boolean }) => string;
  convertAmount: (amountInNgn: number) => number;
}

const DEFAULT_FILTERS: SearchFilterState = {
  searchQuery: '',
  city: 'All Cities',
  neighborhood: 'All',
  category: 'all',
  minPrice: 0,
  maxPrice: 60000,
  date: 'Today',
  timeSlot: 'Now (Next Available)',
  duration: 2,
  guests: 1,
  needsBackupPower: false,
  needsHighSpeedInternet: false,
  needsSoundproofing: false,
  amenities: [],
  instantBookingOnly: false,
  sortBy: 'recommended',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getCurrentUser());
  const [currentView, setCurrentView] = useState<'explore' | 'map' | 'bookings' | 'host' | 'details'>('explore');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);
  const [activeCategory, setActiveCategory] = useState<SpaceCategory | 'all'>('all');
  const [spaces, setSpaces] = useState<Space[]>(spacesService.getAllSpaces());
  const [userBookings, setUserBookings] = useState<Booking[]>(bookingsService.getUserBookings(currentUser.id));
  const [savedSpaceIds, setSavedSpaceIds] = useState<string[]>(favoritesService.getSavedSpaceIds());
  const [notifications, setNotifications] = useState<AppNotification[]>(notificationsService.getNotifications(currentUser.id));
  
  // Modals state
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isListSpaceOpen, setIsListSpaceOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [checkoutSpace, setCheckoutSpace] = useState<Space | null>(null);
  const [activePassBooking, setActivePassBooking] = useState<Booking | null>(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
  const [contactHostData, setContactHostData] = useState<{ hostName: string; spaceTitle: string; phone?: string; email?: string } | null>(null);
  const [directionsData, setDirectionsData] = useState<{ address: string; city: string; title: string; lat?: number; lng?: number } | null>(null);
  const [writeReviewModalData, setWriteReviewModalData] = useState<{ spaceId: string; spaceTitle: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Theme state: 'light' | 'dark' | 'system' | 'default'
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system' | 'default'>(() => {
    const saved = localStorage.getItem('ofis_theme_mode');
    if (saved === 'dark' || saved === 'light' || saved === 'system' || saved === 'default') {
      return saved as 'light' | 'dark' | 'system' | 'default';
    }
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    themeMode === 'light'
      ? 'light'
      : themeMode === 'dark'
      ? 'dark'
      : systemPrefersDark
      ? 'dark'
      : 'light';

  const setThemeMode = (mode: 'light' | 'dark' | 'system' | 'default') => {
    setThemeModeState(mode);
    localStorage.setItem('ofis_theme_mode', mode);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-theme-mode', themeMode);
    document.documentElement.className = resolvedTheme === 'light' ? 'light' : 'dark';
    if (document.body) {
      document.body.className = resolvedTheme === 'light' ? 'light-mode' : 'dark-mode';
    }
  }, [resolvedTheme, themeMode]);

  // Currency & IP Detection State
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('ofis_user_currency');
    if (saved === 'USD' || saved === 'NGN') return saved;
    // Default heuristic from timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      return (tz.includes('Lagos') || tz.includes('Nigeria') || tz.includes('Africa/')) ? 'NGN' : 'USD';
    } catch {
      return 'NGN';
    }
  });
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  // Auto-detect IP location if user hasn't explicitly set preference
  useEffect(() => {
    const detectIpCountry = async () => {
      const savedPref = localStorage.getItem('ofis_user_currency');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.country_code) {
            const countryCode = data.country_code.toUpperCase();
            setDetectedCountry(countryCode);
            if (!savedPref) {
              const autoCurrency = countryCode === 'NG' ? 'NGN' : 'USD';
              setCurrencyState(autoCurrency);
            }
          }
        }
      } catch {
        // Fallback already set via timezone
      }
    };
    detectIpCountry();
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('ofis_user_currency', c);
    showToast(`Currency switched to ${c === 'USD' ? 'USD ($)' : 'Nigerian Naira (₦)'}`);
  };

  const convertAmount = (amountInNgn: number): number => {
    if (currency === 'USD') {
      return +(amountInNgn / USD_TO_NGN_RATE).toFixed(2);
    }
    return amountInNgn;
  };

  const formatPrice = (
    amountInNgn: number,
    options?: { perHour?: boolean; perDay?: boolean; hideUnit?: boolean; compact?: boolean }
  ): string => {
    let formattedNumber = '';
    if (currency === 'USD') {
      const usdVal = amountInNgn / USD_TO_NGN_RATE;
      if (usdVal >= 100) {
        formattedNumber = `$${Math.round(usdVal).toLocaleString()}`;
      } else if (usdVal % 1 === 0) {
        formattedNumber = `$${usdVal.toFixed(0)}`;
      } else {
        formattedNumber = `$${usdVal.toFixed(2)}`;
      }
    } else {
      formattedNumber = `₦${Math.round(amountInNgn).toLocaleString()}`;
    }

    if (options?.perHour) {
      return `${formattedNumber}/hr`;
    }
    if (options?.perDay) {
      return `${formattedNumber}/day`;
    }
    return formattedNumber;
  };

  const focusSearchInput = () => {
    setCurrentView('explore');
    setSelectedSpaceId(null);
    setIsNavDrawerOpen(false);
    setTimeout(() => {
      const input = document.getElementById('main-search-input') as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const searchSection = document.getElementById('spaces-discovery-section');
        searchSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Sync category filter
  useEffect(() => {
    setFilters(prev => ({ ...prev, category: activeCategory }));
  }, [activeCategory]);

  // Update spaces based on filters
  useEffect(() => {
    setSpaces(spacesService.filterSpaces(filters));
  }, [filters]);

  const refreshNotifications = () => {
    setNotifications(notificationsService.getNotifications(currentUser.id));
  };

  const switchUser = (userId: string) => {
    const user = authService.signInAs(userId);
    setCurrentUser(user);
    setUserBookings(bookingsService.getUserBookings(user.id));
    setNotifications(notificationsService.getNotifications(user.id));
    showToast(`Switched account to ${user.name}`);
  };

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    const updated = authService.updateProfile(updates);
    setCurrentUser(updated);
  };

  const updateFilter = <K extends keyof SearchFilterState>(key: K, value: SearchFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setActiveCategory('all');
  };

  const refreshBookings = () => {
    setUserBookings(bookingsService.getUserBookings(currentUser.id));
    refreshNotifications();
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'passCode' | 'qrCodeValue'>) => {
    const newBooking = bookingsService.createBooking(bookingData);
    refreshBookings();
    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    bookingsService.cancelBooking(bookingId);
    refreshBookings();
    showToast('Booking cancelled. Access pass revoked.');
  };

  const toggleSaveSpace = (spaceId: string) => {
    const isSaved = savedSpaceIds.includes(spaceId);
    const newSaved = favoritesService.toggleSave(spaceId);
    setSavedSpaceIds(newSaved);
    showToast(isSaved ? 'Removed from saved spaces' : 'Added to saved spaces');
  };

  const markNotificationAsRead = (id: string) => {
    notificationsService.markAsRead(id);
    refreshNotifications();
  };

  const markAllNotificationsAsRead = () => {
    notificationsService.markAllAsRead(currentUser.id);
    refreshNotifications();
    showToast('All notifications marked as read');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        updateCurrentUser,
        currentView,
        setCurrentView,
        selectedSpaceId,
        setSelectedSpaceId,
        spaces,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        activeCategory,
        setActiveCategory,
        userBookings,
        refreshBookings,
        createBooking,
        cancelBooking,
        activePassBooking,
        setActivePassBooking,
        selectedBookingDetails,
        setSelectedBookingDetails,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshNotifications,
        savedSpaceIds,
        toggleSaveSpace,
        isNavDrawerOpen,
        setIsNavDrawerOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isListSpaceOpen,
        setIsListSpaceOpen,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        checkoutSpace,
        setCheckoutSpace,
        contactHostData,
        setContactHostData,
        directionsData,
        setDirectionsData,
        writeReviewModalData,
        setWriteReviewModalData,
        toastMessage,
        showToast,
        themeMode,
        setThemeMode,
        resolvedTheme,
        focusSearchInput,
        currency,
        setCurrency,
        detectedCountry,
        formatPrice,
        convertAmount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
