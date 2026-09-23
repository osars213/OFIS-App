import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Space, UserProfile, SearchFilters, Booking, SpaceCategory, AppNotification, HostPayout, DiagnosticItem, PricingRules, HostMessage, SavedComparison, AppTheme } from '../types';
import { spacesService } from '../services/spacesService';
import { authService } from '../services/authService';
import { bookingsService } from '../services/bookingsService';
import { favoritesService } from '../services/favoritesService';
import { notificationsService } from '../services/notificationsService';
import { recommendationsService } from '../services/recommendationsService';
import { reviewsService } from '../services/reviewsService';
import { compareService } from '../services/compareService';
import { storage } from '../services/storageService';
import { formatTimeDisplay } from '../utils/timeFormat';
import { currencyService, SupportedCurrency, IpDetectionResult, CURRENCY_RATES } from '../services/currencyService';
import { availabilityAlertsService, AvailabilityAlert } from '../services/availabilityAlertsService';
import { getSupabaseClient, checkSupabaseConnection, isSupabaseConfigured, mapDbBookingToBooking, mapDbSpaceToSpace } from '../services/supabaseClient';

export type AppView = 'explore' | 'map' | 'details' | 'bookings' | 'host_dashboard' | 'saved';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  updateCurrentUser: (data: Partial<UserProfile>) => void;
  registerUser: (payload: { name: string; email: string; phone: string; role: 'user' | 'host'; company?: string; password?: string; avatar?: string }) => Promise<{ success: boolean; user?: UserProfile; message: string }>;
  loginUser: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; user?: UserProfile; message: string }>;
  switchUserRole: (role: 'user' | 'host') => void;
  signOut: () => void;
  signIn: (role?: 'user' | 'host') => void;
  openAuthModal: (tab?: 'signup' | 'login' | 'profile') => void;
  authModalTab: 'signup' | 'login' | 'profile';
  setAuthModalTab: (tab: 'signup' | 'login' | 'profile') => void;
  isGuest: boolean;
  isAuthLoading: boolean;

  spaces: Space[];
  allSpaces: Space[];
  refreshSpaces: () => Promise<void>;
  isLoadingSpaces: boolean;
  spacesError: string | null;
  addNewSpace: (spaceData: any) => Promise<void>;
  updateSpace: (space: Space) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;
  toggleSpaceActive: (spaceId: string) => Promise<void>;

  filters: SearchFilters;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  resetFilters: () => void;

  activeCategory: SpaceCategory | 'all';
  setActiveCategory: (cat: SpaceCategory | 'all') => void;

  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  selectedSpaceId: string | null;
  setSelectedSpaceId: (id: string | null) => void;
  selectedSpace: Space | undefined;

  savedSpaceIds: string[];
  toggleSaveSpace: (id: string) => void;

  bookings: Booking[];
  isLoadingBookings: boolean;
  bookingsError: string | null;
  refreshBookings: () => Promise<void>;
  createBooking: (data: Omit<Booking, 'id' | 'qrCodeValue' | 'digitalPassCode' | 'createdAt'>) => Booking;
  cancelBooking: (id: string) => void;
  approveBooking: (id: string) => { success: boolean; message: string; booking?: Booking };
  cancelBookingWithReason: (id: string, reason: string) => { success: boolean; message: string; booking?: Booking };
  checkInGuest: (bookingIdOrCode: string) => { success: boolean; message: string; booking?: Booking };
  requestEarlyAccess: (bookingId: string) => { success: boolean; message: string; booking?: Booking };
  extendBooking: (bookingId: string, options: { additionalHours?: number; additionalDays?: number } | number, paymentMethod?: 'paystack' | 'flutterwave' | 'wallet' | 'card') => { success: boolean; message: string; booking?: Booking };
  checkOutBooking: (bookingId: string) => { success: boolean; message: string; booking?: Booking };
  submitPostVisitReview: (bookingId: string, data: { rating: number; hostRating?: number; powerRating: number; internetRating: number; noiseRating: number; comment: string; verifiedAmenities?: string[]; photos?: string[] }) => void;
  toggleBookingReminder: (bookingId: string) => boolean;

  // Host Space Configuration & Messaging
  hostMessages: HostMessage[];
  sendHostMessage: (msg: Omit<HostMessage, 'id' | 'timestamp'>) => HostMessage;
  toggleBlockSpaceDate: (spaceId: string, dateStr: string) => void;
  updateSpacePricingRules: (spaceId: string, rules: PricingRules) => void;
  updateSpacePhotos: (spaceId: string, images: string[], featuredImage?: string) => void;
  updateSpaceAmenities: (spaceId: string, amenities: string[]) => void;
  updateSpaceOperatingHours: (spaceId: string, hours: { open: string; close: string; days: string }) => void;

  // Host Payouts
  hostPayouts: HostPayout[];
  requestHostPayout: (data: { amountNgn: number; bankName: string; accountNumber: string; accountName: string }) => HostPayout;

  // Recommendations & History
  recentlyViewedIds: string[];
  recordSpaceView: (spaceId: string) => void;
  clearRecentlyViewed: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  trendingSearches: string[];
  executeSearchQuery: (query: string, category?: SpaceCategory | 'all') => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { timestamp?: string; read?: boolean }) => void;

  // Currency & Internationalization
  currency: SupportedCurrency;
  currencyMode: 'auto_ip' | 'manual';
  detectedIpInfo: IpDetectionResult;
  setCurrency: (c: SupportedCurrency) => void;
  setCurrencyMode: (mode: 'auto_ip' | 'manual') => void;
  resetCurrencyToAutoIp: () => void;
  formatPrice: (amountNgn?: number | null, options?: { perHour?: boolean; perDay?: boolean; forceCurrency?: SupportedCurrency }) => string;

  // Space Availability Alerts
  availabilityAlerts: AvailabilityAlert[];
  createAvailabilityAlert: (alert: Omit<AvailabilityAlert, 'id' | 'createdAt' | 'status'>) => AvailabilityAlert;
  cancelAvailabilityAlert: (alertId: string) => boolean;
  triggerAvailabilityAlertSim: (alertId: string) => { success: boolean; notification?: AppNotification; smsMessage?: string; emailSubject?: string };
  isAvailabilityModalOpen: boolean;
  setIsAvailabilityModalOpen: (open: boolean) => void;
  availabilityModalSpace: Space | null;
  setAvailabilityModalSpace: (space: Space | null) => void;
  openAvailabilityAlertModal: (space: Space, prefillDates?: { startDate?: string; endDate?: string }) => void;

  timeFormat: '12h' | '24h';
  setTimeFormat: (format: '12h' | '24h') => void;
  toggleTimeFormat: () => void;
  formatTime: (timeStr?: string | null) => string;

  // Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  isListSpaceModalOpen: boolean;
  setIsListSpaceModalOpen: (open: boolean) => void;

  isEditSpaceModalOpen: boolean;
  setIsEditSpaceModalOpen: (open: boolean) => void;
  editingSpace: Space | null;
  setEditingSpace: (space: Space | null) => void;

  isHostPayoutModalOpen: boolean;
  setIsHostPayoutModalOpen: (open: boolean) => void;

  isDiagnosticsModalOpen: boolean;
  setIsDiagnosticsModalOpen: (open: boolean) => void;

  isAdminReviewModalOpen: boolean;
  setIsAdminReviewModalOpen: (open: boolean) => void;
  adminReviewSpace: Space | null;
  setAdminReviewSpace: (space: Space | null) => void;
  verifySpaceByAdmin: (spaceId: string, approve: boolean, notes?: string) => Promise<void>;
  pendingSpacesCount: number;

  isEmailVerificationModalOpen: boolean;
  setIsEmailVerificationModalOpen: (open: boolean) => void;
  emailVerificationReason: 'listing' | 'payment' | 'general' | null;
  setEmailVerificationReason: (reason: 'listing' | 'payment' | 'general' | null) => void;
  openEmailVerificationModal: (reason?: 'listing' | 'payment' | 'general') => void;
  verifyUserEmail: (code?: string) => Promise<{ success: boolean; message: string }>;
  sendVerificationEmail: (email?: string) => Promise<{ success: boolean; code: string; message: string }>;
  toggleUserEmailVerification: (isVerified?: boolean) => void;

  isInfoModalOpen: boolean;
  setIsInfoModalOpen: (open: boolean) => void;
  infoModalTab: 'about' | 'faq' | 'help' | 'support' | 'report' | 'privacy' | 'terms' | 'partner' | 'rate' | 'share';
  setInfoModalTab: (tab: 'about' | 'faq' | 'help' | 'support' | 'report' | 'privacy' | 'terms' | 'partner' | 'rate' | 'share') => void;
  openInfoModal: (tab?: 'about' | 'faq' | 'help' | 'support' | 'report' | 'privacy' | 'terms' | 'partner' | 'rate' | 'share') => void;

  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;

  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  checkoutSpace: Space | null;
  setCheckoutSpace: (space: Space | null) => void;
  checkoutPrefillSlot: { date: string; startTime: string } | null;
  setCheckoutPrefillSlot: (slot: { date: string; startTime: string } | null) => void;
  openQuickBook: (space: Space, prefillSlot?: { date: string; startTime: string }) => void;

  isDigitalPassOpen: boolean;
  setIsDigitalPassOpen: (open: boolean) => void;
  activeDigitalPassBooking: Booking | null;
  setActiveDigitalPassBooking: (b: Booking | null) => void;

  isBookingDetailsOpen: boolean;
  setIsBookingDetailsOpen: (open: boolean) => void;
  activeBookingDetails: Booking | null;
  setActiveBookingDetails: (b: Booking | null) => void;

  isDirectionsOpen: boolean;
  setIsDirectionsOpen: (open: boolean) => void;
  directionsSpace: Space | null;
  setDirectionsSpace: (s: Space | null) => void;

  isContactOpen: boolean;
  setIsContactOpen: (open: boolean) => void;
  contactSpace: Space | null;
  setContactSpace: (s: Space | null) => void;

  isWriteReviewOpen: boolean;
  setIsWriteReviewOpen: (open: boolean) => void;
  reviewSpace: Space | null;
  setReviewSpace: (s: Space | null) => void;

  // Workspace Comparison & Smart Match
  comparedSpaceIds: string[];
  addSpaceToCompare: (spaceId: string) => { success: boolean; message: string };
  removeSpaceFromCompare: (spaceId: string) => void;
  toggleSpaceCompare: (spaceId: string) => void;
  clearCompareList: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  savedComparisons: SavedComparison[];
  saveCurrentComparison: (customTitle?: string) => SavedComparison;
  deleteSavedComparison: (id: string) => void;
  loadSavedComparison: (id: string) => void;
  compareToast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  setCompareToast: (t: { message: string; type: 'success' | 'info' | 'warning' } | null) => void;

  // Supabase Status
  supabaseStatus: 'ready' | 'connected' | 'unconfigured' | 'tables_missing' | 'error';
  supabaseMessage: string;
  checkSupabaseHealth: () => Promise<void>;

  // Theme & Appearance
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;

  // Logo Concept Selection
  selectedLogoConceptId: number;
  setSelectedLogoConceptId: (id: number) => void;
  isLogoGalleryOpen: boolean;
  setIsLogoGalleryOpen: (open: boolean) => void;

  // Global Action State for Logo Breathing
  isAppPerformingAction: boolean;
  triggerAppAction: (durationMs?: number) => void;
}


const DEFAULT_FILTERS: SearchFilters = {
  searchQuery: '',
  city: 'All Cities',
  neighborhood: 'All',
  category: 'all',
  minPrice: 0,
  maxPrice: 150000,
  minCapacity: 0,
  date: 'Today',
  timeSlot: 'Now (Next Available)',
  startHour: 'any',
  duration: 2,
  guests: 1,
  needsBackupPower: false,
  needsHighSpeedInternet: false,
  needsFixedInternet: false,
  needsWiredInternet: false,
  needsSoundproofing: false,
  amenities: [],
  instantBookingOnly: false,
  availableNowOnly: false,
  sortBy: 'recommended',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getCurrentUser());
  const [allSpaces, setAllSpaces] = useState<Space[]>(spacesService.getSpaces());
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [activeCategory, setActiveCategoryState] = useState<SpaceCategory | 'all'>('all');
  const [currentView, setCurrentViewState] = useState<AppView>(() => {
    const saved = storage.get<string>('ofis_current_view', 'explore');
    if (saved === 'launch' || !['explore', 'map', 'details', 'bookings', 'host_dashboard', 'saved'].includes(saved)) {
      return 'explore';
    }
    return saved as AppView;
  });
  const setCurrentView = (view: AppView) => {
    setCurrentViewState(view);
    storage.set('ofis_current_view', view);
  };
  const [selectedSpaceId, setSelectedSpaceIdState] = useState<string | null>(null);
  const [savedSpaceIds, setSavedSpaceIds] = useState<string[]>(favoritesService.getSavedIds());
  const [bookings, setBookings] = useState<Booking[]>(bookingsService.getBookings());
  const [notifications, setNotifications] = useState<AppNotification[]>(notificationsService.getNotifications());
  
  // Currency & Internationalization (IP-Dependent by default)
  const [detectedIpInfo, setDetectedIpInfo] = useState<IpDetectionResult>(() => currencyService.detectCurrencyFromIp());
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => currencyService.getInitialCurrency());
  const [currencyMode, setCurrencyModeState] = useState<'auto_ip' | 'manual'>(() =>
    currencyService.hasManualOverride() ? 'manual' : 'auto_ip'
  );

  // Authoritative asynchronous IP detection on startup (auto-adapts by default)
  useEffect(() => {
    let isMounted = true;
    currencyService.detectCurrencyAsync().then((result) => {
      if (!isMounted) return;
      setDetectedIpInfo(result);
      // If user hasn't manually overridden currency, automatically sync to detected IP currency
      if (!currencyService.hasManualOverride()) {
        setCurrencyState(result.detectedCurrency);
        setCurrencyModeState('auto_ip');
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    currencyService.setManualOverride(true);
    currencyService.setSavedCurrency(c);
    setCurrencyModeState('manual');
  };

  const setCurrencyMode = (mode: 'auto_ip' | 'manual') => {
    setCurrencyModeState(mode);
    if (mode === 'auto_ip') {
      currencyService.setManualOverride(false);
      const autoDetected = detectedIpInfo.detectedCurrency;
      setCurrencyState(autoDetected);
      currencyService.resetToAutoDetectedCurrency();
    } else {
      currencyService.setManualOverride(true);
    }
  };

  const resetCurrencyToAutoIp = () => {
    currencyService.setManualOverride(false);
    setCurrencyModeState('auto_ip');
    setCurrencyState(detectedIpInfo.detectedCurrency);
    currencyService.resetToAutoDetectedCurrency();
  };

  // Availability Alerts State
  const [availabilityAlerts, setAvailabilityAlerts] = useState<AvailabilityAlert[]>(() => availabilityAlertsService.getAllAlerts());
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [availabilityModalSpace, setAvailabilityModalSpace] = useState<Space | null>(null);

  const openAvailabilityAlertModal = (space: Space, prefillDates?: { startDate?: string; endDate?: string }) => {
    setAvailabilityModalSpace(space);
    setIsAvailabilityModalOpen(true);
  };

  const createAvailabilityAlert = (alertData: Omit<AvailabilityAlert, 'id' | 'createdAt' | 'status'>): AvailabilityAlert => {
    const created = availabilityAlertsService.createAlert(alertData);
    setAvailabilityAlerts(availabilityAlertsService.getAllAlerts());
    setNotifications(notificationsService.getNotifications());
    return created;
  };

  const cancelAvailabilityAlert = (alertId: string): boolean => {
    const success = availabilityAlertsService.cancelAlert(alertId);
    if (success) {
      setAvailabilityAlerts(availabilityAlertsService.getAllAlerts());
    }
    return success;
  };

  const triggerAvailabilityAlertSim = (alertId: string) => {
    const res = availabilityAlertsService.triggerAlert(alertId);
    setAvailabilityAlerts(availabilityAlertsService.getAllAlerts());
    setNotifications(notificationsService.getNotifications());
    return res;
  };

  const deleteNotification = (id: string) => {
    const updated = notificationsService.removeNotification(id);
    setNotifications(updated);
  };

  const clearAllNotifications = () => {
    const updated = notificationsService.clearAll();
    setNotifications(updated);
  };

  const [timeFormat, setTimeFormatState] = useState<'12h' | '24h'>(() => storage.get<'12h' | '24h'>('time_format_pref', '12h'));
  
  // Theme & Appearance (Light mode as primary brand experience)
  const [theme, setThemeState] = useState<AppTheme>(() => storage.get<AppTheme>('theme_pref', 'light'));
  const [selectedLogoConceptId, setSelectedLogoConceptIdState] = useState<number>(() => storage.get<number>('ofis_selected_logo_concept', 1));
  const [isLogoGalleryOpen, setIsLogoGalleryOpen] = useState<boolean>(false);

  const setSelectedLogoConceptId = (id: number) => {
    setSelectedLogoConceptIdState(id);
    storage.set('ofis_selected_logo_concept', id);
  };
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemIsDark]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [resolvedTheme]);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    storage.set('theme_pref', t);
  };

  const toggleTheme = () => {
    const nextTheme: AppTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  // Async Loading & Error States
  const [isManualAppAction, setIsManualAppAction] = useState(false);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Logo Breathing state is active during space loading, booking actions, auth loading, or manual triggered actions
  const isAppPerformingAction = useMemo(() => {
    return isLoadingSpaces || isLoadingBookings || isAuthLoading || isManualAppAction;
  }, [isLoadingSpaces, isLoadingBookings, isAuthLoading, isManualAppAction]);

  const triggerAppAction = (durationMs = 2400) => {
    setIsManualAppAction(true);
    setTimeout(() => {
      setIsManualAppAction(false);
    }, durationMs);
  };
  const [supabaseStatus, setSupabaseStatus] = useState<'ready' | 'connected' | 'unconfigured' | 'tables_missing' | 'error'>('unconfigured');
  const [supabaseMessage, setSupabaseMessage] = useState('Initializing Supabase connection...');

  const [hostPayouts, setHostPayouts] = useState<HostPayout[]>(() => storage.get<HostPayout[]>('ofis_host_payouts', [
    {
      id: 'payout-101',
      hostId: 'host-1',
      amountNgn: 185000,
      bankName: 'Access Bank PLC',
      accountNumber: '0123456789',
      accountName: 'WorkHub Africa Ltd',
      status: 'completed',
      reference: 'PAY-NG-98421',
      createdAt: '2025-02-20',
    }
  ]));

  // Recommendation & History States
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => recommendationsService.getRecentlyViewedIds());
  const [recentSearches, setRecentSearches] = useState<string[]>(() => recommendationsService.getRecentSearches());
  const trendingSearches = recommendationsService.getTrendingSearches();

  const recordSpaceView = (spaceId: string) => {
    if (!spaceId) return;
    const updated = recommendationsService.recordSpaceView(spaceId);
    setRecentlyViewedIds(updated);
  };

  const clearRecentlyViewed = () => {
    const updated = recommendationsService.clearRecentlyViewed();
    setRecentlyViewedIds(updated);
  };

  const addRecentSearch = (query: string) => {
    if (!query || !query.trim()) return;
    const updated = recommendationsService.addRecentSearch(query);
    setRecentSearches(updated);
  };

  const clearRecentSearches = () => {
    const updated = recommendationsService.clearRecentSearches();
    setRecentSearches(updated);
  };

  const setSelectedSpaceId = (id: string | null) => {
    setSelectedSpaceIdState(id);
    if (id) {
      recordSpaceView(id);
    }
  };

  const executeSearchQuery = (query?: string, category?: SpaceCategory | 'all') => {
    const cleanQuery = (query || '').trim();
    if (cleanQuery) {
      addRecentSearch(cleanQuery);
    }

    let catToSet: SpaceCategory | 'all' = category || 'all';
    const lower = cleanQuery.toLowerCase();
    if (lower.includes('meeting') || lower.includes('boardroom')) {
      catToSet = 'meeting';
    } else if (lower.includes('podcast') || lower.includes('audio') || lower.includes('recording')) {
      catToSet = 'podcast';
    } else if (lower.includes('photo') || lower.includes('studio') || lower.includes('film') || lower.includes('camera')) {
      catToSet = 'photography';
    } else if (lower.includes('office') || lower.includes('suite') || lower.includes('private')) {
      catToSet = 'private_office';
    } else if (lower.includes('coworking') || lower.includes('desk') || lower.includes('day pass') || lower.includes('hot desk')) {
      catToSet = 'coworking';
    } else if (lower.includes('event') || lower.includes('hall')) {
      catToSet = 'event';
    }

    updateFilter('searchQuery', cleanQuery);
    if (catToSet !== 'all') {
      setActiveCategory(catToSet);
    }

    if (currentView !== 'explore') {
      setCurrentView('explore');
    }
    setSelectedSpaceIdState(null);

    setTimeout(() => {
      const resultsEl = document.getElementById('spaces-results-section');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const setTimeFormat = (format: '12h' | '24h') => {
    setTimeFormatState(format);
    storage.set('time_format_pref', format);
  };

  const toggleTimeFormat = () => {
    const nextFormat = timeFormat === '12h' ? '24h' : '12h';
    setTimeFormat(nextFormat);
  };

  const formatTime = (timeStr?: string | null): string => {
    return formatTimeDisplay(timeStr, timeFormat);
  };

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signup' | 'login' | 'profile'>('signup');
  const [isListSpaceModalOpen, setIsListSpaceModalOpen] = useState(false);
  const [isEditSpaceModalOpen, setIsEditSpaceModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [isHostPayoutModalOpen, setIsHostPayoutModalOpen] = useState(false);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState(false);
  const [isAdminReviewModalOpen, setIsAdminReviewModalOpen] = useState(false);
  const [adminReviewSpace, setAdminReviewSpace] = useState<Space | null>(null);

  // Email Verification Gating State
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
  const [emailVerificationReason, setEmailVerificationReason] = useState<'listing' | 'payment' | 'general' | null>(null);

  // Info Modal State
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<'about' | 'faq' | 'help' | 'support' | 'report' | 'privacy' | 'terms' | 'partner' | 'rate' | 'share'>('about');

  const openInfoModal = (tab: 'about' | 'faq' | 'help' | 'support' | 'report' | 'privacy' | 'terms' | 'partner' | 'rate' | 'share' = 'about') => {
    setInfoModalTab(tab);
    setIsInfoModalOpen(true);
  };

  const openEmailVerificationModal = (reason: 'listing' | 'payment' | 'general' = 'general') => {
    setEmailVerificationReason(reason);
    setIsEmailVerificationModalOpen(true);
  };

  const verifyUserEmail = async (code?: string): Promise<{ success: boolean; message: string }> => {
    const updated = authService.verifyEmail(currentUser.id);
    setCurrentUser(updated);
    addNotification({
      title: 'Email Address Verified! 🎉',
      message: `Your email (${updated.email}) is now verified. You can now list workspaces and pay for passes without restriction.`,
      type: 'system',
      read: false,
    });
    return {
      success: true,
      message: `Your email (${updated.email}) has been verified successfully.`,
    };
  };

  const sendVerificationEmail = async (email?: string): Promise<{ success: boolean; code: string; message: string }> => {
    const targetEmail = email || currentUser.email;
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    addNotification({
      title: 'Verification Code Dispatched',
      message: `Security OTP ${generatedOtp} sent to ${targetEmail}.`,
      type: 'system',
      read: false,
    });
    return {
      success: true,
      code: generatedOtp,
      message: `Verification code sent to ${targetEmail}`,
    };
  };

  const toggleUserEmailVerification = (isVerified?: boolean) => {
    const targetState = isVerified !== undefined ? isVerified : !currentUser.isEmailVerified;
    const updated = authService.setEmailVerifiedStatus(currentUser.id, targetState);
    setCurrentUser(updated);
    addNotification({
      title: targetState ? 'Email Verified' : 'Email Verification Cleared',
      message: targetState 
        ? `Your email (${updated.email}) is verified.`
        : `Email verification reset. Verification is required before listing or paying.`,
      type: 'system',
      read: false,
    });
  };

  const openAuthModal = (tab: 'signup' | 'login' | 'profile' = 'signup') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSpace, setCheckoutSpace] = useState<Space | null>(null);
  const [checkoutPrefillSlot, setCheckoutPrefillSlot] = useState<{ date: string; startTime: string } | null>(null);

  const openQuickBook = (space: Space, prefillSlot?: { date: string; startTime: string }) => {
    setCheckoutSpace(space);
    if (prefillSlot) {
      setCheckoutPrefillSlot(prefillSlot);
    } else if (space.nextAvailableSlot) {
      setCheckoutPrefillSlot({
        date: space.nextAvailableSlot.date,
        startTime: space.nextAvailableSlot.time,
      });
    } else {
      setCheckoutPrefillSlot(null);
    }
    setIsCheckoutOpen(true);
  };

  const [isDigitalPassOpen, setIsDigitalPassOpen] = useState(false);
  const [activeDigitalPassBooking, setActiveDigitalPassBooking] = useState<Booking | null>(null);

  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [activeBookingDetails, setActiveBookingDetails] = useState<Booking | null>(null);

  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [directionsSpace, setDirectionsSpace] = useState<Space | null>(null);

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactSpace, setContactSpace] = useState<Space | null>(null);

  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewSpace, setReviewSpace] = useState<Space | null>(null);

  // Comparison & Smart Match States
  const [comparedSpaceIds, setComparedSpaceIds] = useState<string[]>(() => storage.get<string[]>('compared_spaces_ids', []));
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>(() => compareService.getSavedComparisons());
  const [compareToast, setCompareToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const addSpaceToCompare = (spaceId: string) => {
    if (comparedSpaceIds.includes(spaceId)) {
      return { success: true, message: 'Already in compare list' };
    }
    if (comparedSpaceIds.length >= 3) {
      setCompareToast({
        message: 'You can compare up to 3 workspaces at a time. Remove one to add another.',
        type: 'warning',
      });
      setTimeout(() => setCompareToast(null), 3500);
      return { success: false, message: 'Max 3 workspaces' };
    }
    const updated = [...comparedSpaceIds, spaceId];
    setComparedSpaceIds(updated);
    storage.set('compared_spaces_ids', updated);
    setCompareToast({
      message: `Added to compare list (${updated.length}/3)`,
      type: 'success',
    });
    setTimeout(() => setCompareToast(null), 2500);
    return { success: true, message: 'Added to compare list' };
  };

  const removeSpaceFromCompare = (spaceId: string) => {
    const updated = comparedSpaceIds.filter(id => id !== spaceId);
    setComparedSpaceIds(updated);
    storage.set('compared_spaces_ids', updated);
    setCompareToast({
      message: `Removed from compare list (${updated.length}/3)`,
      type: 'info',
    });
    setTimeout(() => setCompareToast(null), 2000);
  };

  const toggleSpaceCompare = (spaceId: string) => {
    if (comparedSpaceIds.includes(spaceId)) {
      removeSpaceFromCompare(spaceId);
    } else {
      addSpaceToCompare(spaceId);
    }
  };

  const clearCompareList = () => {
    setComparedSpaceIds([]);
    storage.set('compared_spaces_ids', []);
    setCompareToast({
      message: 'Comparison list cleared',
      type: 'info',
    });
    setTimeout(() => setCompareToast(null), 2000);
  };

  const saveCurrentComparison = (customTitle?: string): SavedComparison => {
    const spacesToSave = allSpaces.filter(s => comparedSpaceIds.includes(s.id));
    const saved = compareService.saveComparison(spacesToSave, customTitle);
    setSavedComparisons(compareService.getSavedComparisons());
    setCompareToast({
      message: 'Comparison saved to your profile!',
      type: 'success',
    });
    setTimeout(() => setCompareToast(null), 2500);
    return saved;
  };

  const deleteSavedComparison = (id: string) => {
    const updated = compareService.deleteSavedComparison(id);
    setSavedComparisons(updated);
    setCompareToast({
      message: 'Saved comparison removed',
      type: 'info',
    });
    setTimeout(() => setCompareToast(null), 2000);
  };

  const loadSavedComparison = (id: string) => {
    const target = savedComparisons.find(c => c.id === id);
    if (target) {
      setComparedSpaceIds(target.spaceIds.slice(0, 3));
      storage.set('compared_spaces_ids', target.spaceIds.slice(0, 3));
      setIsCompareModalOpen(true);
    }
  };

  // Supabase Data Loaders
  const checkSupabaseHealth = async () => {
    const res = await checkSupabaseConnection();
    setSupabaseStatus(res.status);
    setSupabaseMessage(res.message);
  };

  const refreshSpaces = async () => {
    setIsLoadingSpaces(true);
    setSpacesError(null);
    try {
      const res = await spacesService.fetchSpacesAsync();
      setAllSpaces(res.spaces);
    } catch (err: any) {
      setSpacesError(err.message || 'Failed to refresh spaces');
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const refreshBookings = async () => {
    setIsLoadingBookings(true);
    setBookingsError(null);
    try {
      const res = await bookingsService.fetchBookingsAsync(currentUser.id);
      setBookings(res.bookings);
    } catch (err: any) {
      setBookingsError(err.message || 'Failed to refresh bookings');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Initial Boot: Supabase Health & Data Hydration
  useEffect(() => {
    let isMounted = true;

    async function initializeData() {
      await checkSupabaseHealth();
      if (!isMounted) return;

      // 1. Fetch spaces from Supabase
      refreshSpaces();

      // 2. Fetch bookings for current user
      refreshBookings();

      // 3. Fetch saved favorites
      if (currentUser.id && !currentUser.id.startsWith('guest')) {
        favoritesService.fetchFavoritesAsync(currentUser.id).then(ids => {
          if (isMounted) setSavedSpaceIds(ids);
        });
      }

      // 4. Listen to Supabase Auth State Changes if client is active
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            if (event === 'SIGNED_IN' && session?.user) {
              const profile = await authService.fetchProfileAsync(session.user.id);
              if (profile && isMounted) {
                setCurrentUser(profile);
                setSavedSpaceIds(profile.savedSpaceIds || []);
              }
            } else if (event === 'SIGNED_OUT') {
              // Sign out handled gracefully
            }
          });

          // Realtime subscriptions for live updates
          const spacesChannel = client
            .channel('public:spaces_live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'spaces' }, () => {
              if (isMounted) refreshSpaces();
            })
            .subscribe();

          const bookingsChannel = client
            .channel('public:bookings_live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
              if (isMounted) refreshBookings();
            })
            .subscribe();

          return () => {
            authListener?.subscription?.unsubscribe();
            spacesChannel.unsubscribe();
            bookingsChannel.unsubscribe();
          };
        } catch (err) {
          console.warn('[AppContext] Supabase realtime listener notice:', err);
        }
      }
    }

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setActiveCategoryState('all');
  };

  const setActiveCategory = (cat: SpaceCategory | 'all') => {
    setActiveCategoryState(cat);
    updateFilter('category', cat);
  };

  const updateCurrentUser = (data: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    authService.setCurrentUser(updated);
    if (currentUser.id && !currentUser.id.startsWith('guest')) {
      authService.updateProfileAsync(currentUser.id, data);
    }
  };

  const addNewSpace = async (spaceData: any) => {
    const newSpace: Space = {
      id: `space-${Date.now()}`,
      state: spaceData.city === 'Abuja' ? 'FCT' : `${spaceData.city} State`,
      rules: ['No loud calls in quiet focus zones', 'Keep desks neat and sanitized'],
      tags: ['Verified Power', 'High Speed', spaceData.city],
      isActive: false,
      isVerified: false,
      verificationStatus: 'pending',
      submittedAt: new Date().toISOString(),
      ...spaceData,
    };
    await spacesService.addSpace(newSpace);
    await refreshSpaces();
    addNotification({
      title: 'Space Submitted for Admin Verification',
      message: `"${newSpace.title}" has been submitted for review. The OFIS Admin Agent will audit photos and power specs before public activation.`,
      type: 'system',
      read: false,
    });
  };

  const verifySpaceByAdmin = async (spaceId: string, approve: boolean, notes?: string) => {
    const status = approve ? 'verified' : 'rejected';
    const updated = await spacesService.verifySpace(spaceId, status, notes);
    await refreshSpaces();
    if (updated) {
      if (approve) {
        addNotification({
          title: 'Workspace Verified & Live 🎉',
          message: `"${updated.title}" has passed Admin Agent verification and is now active for bookings!`,
          type: 'system',
          read: false,
        });
      } else {
        addNotification({
          title: 'Workspace Verification Notice ⚠️',
          message: `Admin review for "${updated.title}": ${notes || 'Please update pictures or power specs before activation.'}`,
          type: 'system',
          read: false,
        });
      }
    }
  };

  const updateSpace = async (updatedSpace: Space) => {
    await spacesService.updateSpace(updatedSpace);
    await refreshSpaces();
    addNotification({
      title: 'Workspace Updated',
      message: `Modifications to "${updatedSpace.title}" are now live across OFIS.`,
      type: 'system',
      read: false,
    });
  };

  const deleteSpace = async (spaceId: string) => {
    const target = allSpaces.find(s => s.id === spaceId);
    await spacesService.deleteSpace(spaceId);
    await refreshSpaces();
    addNotification({
      title: 'Listing Removed',
      message: `"${target?.title || 'Workspace'}" was deleted from your listings.`,
      type: 'system',
      read: false,
    });
  };

  const toggleSpaceActive = async (spaceId: string) => {
    const target = await spacesService.toggleSpaceActive(spaceId);
    await refreshSpaces();
    if (target) {
      addNotification({
        title: target.isActive !== false ? 'Hub Resumed' : 'Hub Paused',
        message: `"${target.title}" is now ${target.isActive !== false ? 'accepting instant bookings' : 'hidden from public search'}.`,
        type: 'system',
        read: false,
      });
    }
  };

  const checkInGuest = (bookingIdOrCode: string): { success: boolean; message: string; booking?: Booking } => {
    const res = bookingsService.checkInBooking(bookingIdOrCode);
    if (res.success && res.booking) {
      setBookings(bookingsService.getBookings());
      addNotification({
        title: '✓ Guest Checked In',
        message: `${res.booking.userName} has successfully scanned turnstile pass for ${res.booking.spaceTitle}.`,
        type: 'booking',
        read: false,
        bookingId: res.booking.id,
      });
      return res;
    }
    return {
      success: false,
      message: res.message || `Pass or Booking code "${bookingIdOrCode}" not found. Please verify the code.`,
    };
  };

  const requestEarlyAccess = (bookingId: string): { success: boolean; message: string; booking?: Booking } => {
    const res = bookingsService.requestEarlyAccess(bookingId);
    if (res.success && res.booking) {
      setBookings(bookingsService.getBookings());
      addNotification({
        title: 'Early Arrival Approved',
        message: `Host approved early access for ${res.booking.spaceTitle}. You can now check in!`,
        type: 'booking',
        read: false,
        bookingId: res.booking.id,
      });
      addNotification({
        title: 'Host Alert: Early Guest Arrival',
        message: `${res.booking.userName} requested early desk access and was granted entrance to ${res.booking.spaceTitle}.`,
        type: 'system',
        read: false,
        bookingId: res.booking.id,
      });
      return res;
    }
    return res;
  };

  const extendBooking = (
    bookingId: string,
    options: { additionalHours?: number; additionalDays?: number } | number,
    paymentMethod: 'paystack' | 'flutterwave' | 'wallet' | 'card' = 'wallet'
  ): { success: boolean; message: string; booking?: Booking } => {
    const target = bookings.find(b => b.id === bookingId);
    const space = allSpaces.find(s => s.id === target?.spaceId);
    
    let unitRate = 3500;
    const isDayExtension = typeof options === 'object' && Boolean(options.additionalDays && options.additionalDays > 0);
    
    if (isDayExtension) {
      unitRate = space?.pricePerDay || (space?.pricePerHour ? space.pricePerHour * 8 : 25000);
    } else {
      unitRate = space?.pricePerHour || (target ? Math.round(target.totalAmount / target.durationHours) : 3500);
    }

    const res = bookingsService.extendBooking(bookingId, options, unitRate, paymentMethod);
    if (res.success && res.booking) {
      setBookings(bookingsService.getBookings());
      
      const label = typeof options === 'number' 
        ? `+${options}h` 
        : options.additionalDays ? `+${options.additionalDays} day(s)` : `+${options.additionalHours || 1}h`;

      addNotification({
        title: `Booking Extended (${label})`,
        message: `Your pass at ${res.booking.spaceTitle} is updated: ${res.message}.`,
        type: 'booking',
        read: false,
        bookingId: res.booking.id,
      });
      addNotification({
        title: 'Host Alert: Session Extended',
        message: `${res.booking.userName} extended stay at ${res.booking.spaceTitle} (${label}). Total: ₦${(res.booking.totalAmount || 0).toLocaleString()}.`,
        type: 'system',
        read: false,
        bookingId: res.booking.id,
      });
      return res;
    }
    return res;
  };

  const checkOutBooking = (bookingId: string): { success: boolean; message: string; booking?: Booking } => {
    const res = bookingsService.checkOutBooking(bookingId);
    if (res.success && res.booking) {
      setBookings(bookingsService.getBookings());
      addNotification({
        title: 'Checked Out Successfully',
        message: `You've checked out from ${res.booking.spaceTitle}. We hope you had a productive session!`,
        type: 'booking',
        read: false,
        bookingId: res.booking.id,
      });
      addNotification({
        title: 'Host Alert: Guest Checked Out',
        message: `${res.booking.userName} has completed their reservation and checked out of ${res.booking.spaceTitle}.`,
        type: 'system',
        read: false,
        bookingId: res.booking.id,
      });

      const matchedSpace = allSpaces.find(s => s.id === res.booking?.spaceId);
      if (matchedSpace) {
        setReviewSpace(matchedSpace);
        setIsWriteReviewOpen(true);
      }

      return res;
    }
    return res;
  };

  const submitPostVisitReview = (
    bookingId: string,
    data: {
      rating: number;
      hostRating?: number;
      powerRating: number;
      internetRating: number;
      noiseRating: number;
      comment: string;
      verifiedAmenities?: string[];
      photos?: string[];
    }
  ) => {
    const b = bookings.find(item => item.id === bookingId);
    const spaceId = b?.spaceId || reviewSpace?.id || 'space-vi-hive';
    const spaceTitle = b?.spaceTitle || reviewSpace?.title || 'Workspace';

    reviewsService.addReview({
      spaceId,
      bookingId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.company || 'Verified Professional',
      rating: data.rating,
      hostRating: data.hostRating,
      powerRating: data.powerRating,
      internetRating: data.internetRating,
      noiseRating: data.noiseRating,
      comment: data.comment,
      verifiedAmenities: data.verifiedAmenities,
      photos: data.photos,
      verifiedBooking: true,
    });

    bookingsService.markReviewed(bookingId);
    setBookings(bookingsService.getBookings());

    addNotification({
      title: '✓ Review Published (Verified Guest)',
      message: `Thank you for reviewing ${spaceTitle}. Your verified feedback gives community members trusted insights.`,
      type: 'booking',
      read: false,
      bookingId,
    });
    addNotification({
      title: 'Host Alert: New Verified Review',
      message: `${currentUser.name} rated ${spaceTitle} ${data.rating}★ with verified amenity checks.`,
      type: 'system',
      read: false,
      bookingId,
    });
  };

  const requestHostPayout = (data: { amountNgn: number; bankName: string; accountNumber: string; accountName: string }): HostPayout => {
    const newPayout: HostPayout = {
      id: `payout-${Date.now()}`,
      hostId: currentUser.id,
      amountNgn: data.amountNgn,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      status: 'processing',
      reference: `PAY-NG-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const nextPayouts = [newPayout, ...hostPayouts];
    setHostPayouts(nextPayouts);
    storage.set('ofis_host_payouts', nextPayouts);

    addNotification({
      title: 'Payout Request Dispatched',
      message: `₦${(data.amountNgn || 0).toLocaleString()} transfer initiated to ${data.bankName} (${data.accountNumber.slice(-4)}). Reference: ${newPayout.reference}.`,
      type: 'payment',
      read: false,
    });

    return newPayout;
  };

  const [hostMessages, setHostMessages] = useState<HostMessage[]>(() => bookingsService.getHostMessages());

  const sendHostMessage = (msg: Omit<HostMessage, 'id' | 'timestamp'>): HostMessage => {
    const created = bookingsService.sendHostMessage(msg);
    setHostMessages(bookingsService.getHostMessages());
    addNotification({
      title: `Message Sent to ${msg.senderRole === 'host' ? 'Guest' : 'Host'}`,
      message: msg.content.length > 60 ? `${msg.content.slice(0, 60)}...` : msg.content,
      type: 'system',
      read: false,
    });
    return created;
  };

  const approveBooking = (bookingId: string) => {
    const res = bookingsService.approveBooking(bookingId);
    if (res.success && res.booking) {
      setBookings(bookingsService.getBookings());
      addNotification({
        title: 'Booking Request Approved',
        message: `Reservation ${res.booking.id} for ${res.booking.userName} (${res.booking.spaceTitle}) is now confirmed.`,
        type: 'booking',
        read: false,
      });
    }
    return res;
  };

  const cancelBookingWithReason = (bookingId: string, reason: string) => {
    const res = bookingsService.cancelBookingWithReason(bookingId, reason);
    if (res.success && res.booking) {
      setBookings(bookingsService.getBookings());
      addNotification({
        title: 'Booking Cancelled',
        message: `Reservation ${res.booking.id} has been cancelled. Reason: "${reason}".`,
        type: 'booking',
        read: false,
      });
    }
    return res;
  };

  const toggleBlockSpaceDate = (spaceId: string, dateStr: string) => {
    const target = allSpaces.find(s => s.id === spaceId);
    if (!target) return;
    const currentBlocked = target.blockedDates || [];
    const isAlreadyBlocked = currentBlocked.includes(dateStr);
    const updatedBlocked = isAlreadyBlocked
      ? currentBlocked.filter(d => d !== dateStr)
      : [...currentBlocked, dateStr];

    const updatedSpace: Space = {
      ...target,
      blockedDates: updatedBlocked,
    };
    updateSpace(updatedSpace);
    addNotification({
      title: isAlreadyBlocked ? 'Date Unblocked' : 'Date Blocked for Maintenance/Private Use',
      message: `${dateStr} is now ${isAlreadyBlocked ? 'available for bookings' : 'blocked'} on "${target.title}".`,
      type: 'system',
      read: false,
    });
  };

  const updateSpacePricingRules = (spaceId: string, rules: PricingRules) => {
    const target = allSpaces.find(s => s.id === spaceId);
    if (!target) return;
    const updatedSpace: Space = {
      ...target,
      pricingRules: rules,
    };
    updateSpace(updatedSpace);
    addNotification({
      title: 'Pricing Rules Updated',
      message: `Custom hourly/daily & weekend pricing rules saved for "${target.title}".`,
      type: 'system',
      read: false,
    });
  };

  const updateSpacePhotos = (spaceId: string, images: string[], featuredImage?: string) => {
    const target = allSpaces.find(s => s.id === spaceId);
    if (!target) return;
    const updatedSpace: Space = {
      ...target,
      images,
      featuredImage: featuredImage || images[0] || target.featuredImage,
    };
    updateSpace(updatedSpace);
  };

  const updateSpaceAmenities = (spaceId: string, amenities: string[]) => {
    const target = allSpaces.find(s => s.id === spaceId);
    if (!target) return;
    const updatedSpace: Space = {
      ...target,
      amenities,
    };
    updateSpace(updatedSpace);
  };

  const updateSpaceOperatingHours = (spaceId: string, hours: { open: string; close: string; days: string }) => {
    const target = allSpaces.find(s => s.id === spaceId);
    if (!target) return;
    const updatedSpace: Space = {
      ...target,
      operatingHours: hours,
    };
    updateSpace(updatedSpace);
  };

  const registerUser = async (payload: { name: string; email: string; phone: string; role: 'user' | 'host'; company?: string; password?: string; avatar?: string }) => {
    setIsAuthLoading(true);
    try {
      const res = await authService.register(payload);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setSavedSpaceIds(res.user.savedSpaceIds || []);
        addNotification({
          title: 'Welcome to OFIS Network',
          message: `Your account is ready! ₦${(res.user.walletBalanceNgn || 0).toLocaleString()} initial welcome credit has been applied to your wallet.`,
          type: 'system',
          read: false,
        });
        if (res.user.role === 'host') {
          setCurrentView('host_dashboard');
        } else {
          setCurrentView('explore');
        }
      }
      return res;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginUser = async (emailOrPhone: string, password?: string) => {
    setIsAuthLoading(true);
    try {
      const res = await authService.login(emailOrPhone, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setSavedSpaceIds(res.user.savedSpaceIds || []);
        addNotification({
          title: 'Session Authenticated',
          message: `Logged in as ${res.user.name} (${res.user.role === 'host' ? 'Host Portal' : 'Workspace Member'}).`,
          type: 'system',
          read: false,
        });
        if (res.user.role === 'host') {
          setCurrentView('host_dashboard');
        }
        // Fetch user-specific bookings & favorites
        refreshBookings();
        favoritesService.fetchFavoritesAsync(res.user.id).then(ids => setSavedSpaceIds(ids));
      }
      return res;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const switchUserRole = (role: 'user' | 'host') => {
    const updated = authService.switchRole(role);
    setCurrentUser(updated);
    if (role === 'host') {
      setCurrentView('host_dashboard');
    } else {
      setCurrentView('explore');
    }
  };

  const signOut = () => {
    authService.logout().then(guest => {
      setCurrentUser(guest);
      setSavedSpaceIds([]);
      setCurrentView('explore');
      addNotification({
        title: 'Signed Out of OFIS',
        message: 'You are browsing in guest mode. Sign in anytime to book spaces and access your digital passes.',
        type: 'system',
        read: false,
      });
    });
  };

  const signIn = (role: 'user' | 'host' = 'user') => {
    openAuthModal('login');
  };

  const isGuest = currentUser.id === 'guest-user' || currentUser.id === 'guest';

  const toggleSaveSpace = (spaceId: string) => {
    const updated = favoritesService.toggleFavorite(spaceId, currentUser.id);
    setSavedSpaceIds(updated);
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'qrCodeValue' | 'digitalPassCode' | 'createdAt'>): Booking => {
    const newBooking = bookingsService.createBooking(bookingData);
    setBookings(bookingsService.getBookings());

    if (bookingData.hasReminder) {
      const formattedStartTime = formatTimeDisplay(newBooking.startTime, timeFormat);
      const updated = notificationsService.addNotification({
        title: `30-Min Reservation Reminder`,
        message: `Your session at ${newBooking.spaceTitle} starts in 30 minutes (${formattedStartTime}). Pass code: ${newBooking.digitalPassCode}.`,
        type: 'reminder',
        timestamp: '30m before start',
        read: false,
        bookingId: newBooking.id,
      });
      setNotifications(updated);
    }

    return newBooking;
  };

  const cancelBooking = (id: string) => {
    bookingsService.cancelBooking(id);
    setBookings(bookingsService.getBookings());
  };

  const toggleBookingReminder = (bookingId: string): boolean => {
    const currentBookings = bookingsService.getBookings();
    const b = currentBookings.find(item => item.id === bookingId);
    if (!b) return false;

    const newReminderState = !b.hasReminder;
    bookingsService.updateBookingReminder(bookingId, newReminderState);
    setBookings(bookingsService.getBookings());

    if (newReminderState) {
      const formattedStartTime = formatTimeDisplay(b.startTime, timeFormat);
      const updated = notificationsService.addNotification({
        title: `30-Min Reservation Reminder`,
        message: `Your session at ${b.spaceTitle} starts in 30 minutes (${formattedStartTime}). Pass code: ${b.digitalPassCode}.`,
        type: 'reminder',
        timestamp: '30m before start',
        read: false,
        bookingId: b.id,
      });
      setNotifications(updated);
    } else {
      const updated = notificationsService.removeNotificationByBookingIdAndType(bookingId, 'reminder');
      setNotifications(updated);
    }

    return newReminderState;
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { timestamp?: string; read?: boolean }) => {
    const updated = notificationsService.addNotification(notif);
    setNotifications(updated);
  };

  const markNotificationRead = (id: string) => {
    const updated = notificationsService.markAsRead(id);
    setNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notificationsService.markAllAsRead();
    setNotifications(updated);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const filteredSpaces = useMemo(() => {
    return spacesService.filterSpaces({
      ...filters,
      category: activeCategory !== 'all' ? activeCategory : filters.category,
    });
  }, [filters, activeCategory, allSpaces]);

  const selectedSpace = useMemo(() => {
    if (!selectedSpaceId) return undefined;
    return allSpaces.find(s => s.id === selectedSpaceId);
  }, [selectedSpaceId, allSpaces]);

  const formatPrice = (
    amountNgn?: number | null,
    options?: { perHour?: boolean; perDay?: boolean; forceCurrency?: SupportedCurrency }
  ): string => {
    const activeCurr = options?.forceCurrency || currency;
    return currencyService.format(amountNgn, activeCurr, {
      perHour: options?.perHour,
      perDay: options?.perDay,
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        updateCurrentUser,
        registerUser,
        loginUser,
        switchUserRole,
        signOut,
        signIn,
        isGuest,
        isAuthLoading,
        spaces: filteredSpaces,
        allSpaces,
        refreshSpaces,
        isLoadingSpaces,
        spacesError,
        addNewSpace,
        updateSpace,
        deleteSpace,
        toggleSpaceActive,
        filters,
        updateFilter,
        resetFilters,
        activeCategory,
        setActiveCategory,
        currentView,
        setCurrentView,
        selectedSpaceId,
        setSelectedSpaceId,
        selectedSpace,
        savedSpaceIds,
        toggleSaveSpace,
        bookings,
        isLoadingBookings,
        bookingsError,
        refreshBookings,
        createBooking,
        cancelBooking,
        approveBooking,
        cancelBookingWithReason,
        hostMessages,
        sendHostMessage,
        toggleBlockSpaceDate,
        updateSpacePricingRules,
        updateSpacePhotos,
        updateSpaceAmenities,
        updateSpaceOperatingHours,
        checkInGuest,
        requestEarlyAccess,
        extendBooking,
        checkOutBooking,
        submitPostVisitReview,
        toggleBookingReminder,
        hostPayouts,
        requestHostPayout,
        recentlyViewedIds,
        recordSpaceView,
        clearRecentlyViewed,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        trendingSearches,
        executeSearchQuery,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        currency,
        currencyMode,
        detectedIpInfo,
        setCurrency,
        setCurrencyMode,
        resetCurrencyToAutoIp,
        formatPrice,
        availabilityAlerts,
        createAvailabilityAlert,
        cancelAvailabilityAlert,
        triggerAvailabilityAlertSim,
        isAvailabilityModalOpen,
        setIsAvailabilityModalOpen,
        availabilityModalSpace,
        setAvailabilityModalSpace,
        openAvailabilityAlertModal,
        timeFormat,
        setTimeFormat,
        toggleTimeFormat,
        formatTime,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        isListSpaceModalOpen,
        setIsListSpaceModalOpen,
        isEditSpaceModalOpen,
        setIsEditSpaceModalOpen,
        editingSpace,
        setEditingSpace,
        isHostPayoutModalOpen,
        setIsHostPayoutModalOpen,
        isDiagnosticsModalOpen,
        setIsDiagnosticsModalOpen,
        isAdminReviewModalOpen,
        setIsAdminReviewModalOpen,
        adminReviewSpace,
        setAdminReviewSpace,
        verifySpaceByAdmin,
        pendingSpacesCount: allSpaces.filter(s => s.verificationStatus === 'pending' || (s.isVerified === false && s.verificationStatus !== 'rejected')).length,
        isEmailVerificationModalOpen,
        setIsEmailVerificationModalOpen,
        emailVerificationReason,
        setEmailVerificationReason,
        openEmailVerificationModal,
        verifyUserEmail,
        sendVerificationEmail,
        toggleUserEmailVerification,
        isInfoModalOpen,
        setIsInfoModalOpen,
        infoModalTab,
        setInfoModalTab,
        openInfoModal,
        isAiModalOpen,
        setIsAiModalOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isDrawerOpen,
        setIsDrawerOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutSpace,
        setCheckoutSpace,
        checkoutPrefillSlot,
        setCheckoutPrefillSlot,
        openQuickBook,
        isDigitalPassOpen,
        setIsDigitalPassOpen,
        activeDigitalPassBooking,
        setActiveDigitalPassBooking,
        isBookingDetailsOpen,
        setIsBookingDetailsOpen,
        activeBookingDetails,
        setActiveBookingDetails,
        isDirectionsOpen,
        setIsDirectionsOpen,
        directionsSpace,
        setDirectionsSpace,
        isContactOpen,
        setIsContactOpen,
        contactSpace,
        setContactSpace,
        isWriteReviewOpen,
        setIsWriteReviewOpen,
        reviewSpace,
        setReviewSpace,
        comparedSpaceIds,
        addSpaceToCompare,
        removeSpaceFromCompare,
        toggleSpaceCompare,
        clearCompareList,
        isCompareModalOpen,
        setIsCompareModalOpen,
        savedComparisons,
        saveCurrentComparison,
        deleteSavedComparison,
        loadSavedComparison,
        compareToast,
        setCompareToast,
        supabaseStatus,
        supabaseMessage,
        checkSupabaseHealth,
        theme,
        setTheme,
        resolvedTheme,
        toggleTheme,
        selectedLogoConceptId,
        setSelectedLogoConceptId,
        isLogoGalleryOpen,
        setIsLogoGalleryOpen,
        isAppPerformingAction,
        triggerAppAction,
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
