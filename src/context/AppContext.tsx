import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Space,
  Desk,
  Booking,
  User,
  UserRole,
  CurrencyCode,
  CurrencyConfig,
  FilterState,
  PlatformCommissionStats,
  DeskStatus,
  Review,
  BookingDraft,
  PrimaryCategory,
} from '../types';
import {
  SUPPORTED_CURRENCIES,
  DEMO_USERS,
  INITIAL_SPACES,
  INITIAL_BOOKINGS,
  INITIAL_PLATFORM_STATS,
  INITIAL_REVIEWS,
} from '../mockData';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { spacesService } from '../services/spacesService';
import { bookingsService } from '../services/bookingsService';
import { reviewsService } from '../services/reviewsService';
import { favoritesService } from '../services/favoritesService';

interface AppContextType {
  // Supabase Backend Status
  isSupabaseConnected: boolean;
  databaseStatus: 'connected' | 'demo_mode';

  // User & Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  switchDemoUser: (userId: string) => void;

  // Currency
  currentCurrency: CurrencyConfig;
  setCurrencyCode: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number, targetCurrencyCode?: CurrencyCode) => string;
  convertPrice: (amountInUSD: number, targetCurrencyCode?: CurrencyCode) => number;
  formatPriceNaira: (amountInNaira: number) => string;

  // Spaces & Desks
  spaces: Space[];
  isSpacesLoading: boolean;
  selectedSpace: Space | null;
  setSelectedSpace: (space: Space | null) => void;
  selectedDesk: Desk | null;
  setSelectedDesk: (desk: Desk | null) => void;
  updateDeskStatus: (spaceId: string, deskId: string, newStatus: DeskStatus, occupantInfo?: any) => void;
  createSpace: (newSpaceData: Partial<Space>) => Promise<Space>;
  addSpace: (newSpace: Omit<Space, 'id' | 'createdAt'>) => Promise<Space>;
  updateSpace: (spaceId: string, updates: Partial<Space>) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;
  refreshSpaces: () => Promise<void>;

  // Bookings
  bookings: BookingsState;
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'transactionId' | 'qrCodeUrl' | 'bookingReference'>) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  checkInBooking: (bookingId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  activePassBooking: Booking | null;
  setActivePassBooking: (booking: Booking | null) => void;

  // Reviews & Ratings
  reviews: Review[];
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'helpfulUserIds'>) => Promise<void>;
  toggleHelpfulReview: (reviewId: string) => Promise<void>;
  addHostReply: (reviewId: string, replyMessage: string) => Promise<void>;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  reviewTargetSpace: Space | null;
  setReviewTargetSpace: (space: Space | null) => void;
  reviewTargetBooking: Booking | null;
  setReviewTargetBooking: (booking: Booking | null) => void;
  openWriteReviewModal: (space: Space, booking?: Booking) => void;
  isUserVerifiedForSpace: (userId: string, spaceId: string) => boolean;

  // Platform & Host stats
  platformStats: PlatformCommissionStats;

  // Filters & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  setCategoryFilter: (category: PrimaryCategory | 'all' | 'saved') => void;

  // Favorites / Saved Spaces
  favorites: string[];
  toggleFavorite: (spaceId: string) => Promise<void>;
  isFavorite: (spaceId: string) => boolean;

  // Booking Draft State
  bookingDraft: BookingDraft;
  setBookingDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;

  // Modals & UI
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  isAvatarModalOpen: boolean;
  setIsAvatarModalOpen: (open: boolean) => void;
  openAvatarModal: () => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  isPassModalOpen: boolean;
  setIsPassModalOpen: (open: boolean) => void;
  isBookingSuccessModalOpen: boolean;
  setIsBookingSuccessModalOpen: (open: boolean) => void;
  latestSuccessBooking: Booking | null;
  setLatestSuccessBooking: (booking: Booking | null) => void;
  isListSpaceModalOpen: boolean;
  setIsListSpaceModalOpen: (open: boolean) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  aiModalInitialMode: 'match' | 'optimize';
  openAiModal: (mode: 'match' | 'optimize') => void;

  // 1-Hour Desk Session Reminder
  reminderBooking: Booking | null;
  setReminderBooking: (booking: Booking | null) => void;
  isReminderModalOpen: boolean;
  setIsReminderModalOpen: (open: boolean) => void;
  isReminderToastVisible: boolean;
  setIsReminderToastVisible: (visible: boolean) => void;
  triggerSessionReminder: (targetBooking?: Booking, openModalImmediately?: boolean) => void;
  dismissSessionReminder: () => void;
  snoozeSessionReminder: (minutes?: number) => void;

  // Live simulation toggle
  liveSimulationActive: boolean;
  setLiveSimulationActive: (active: boolean) => void;

  // Notifications / Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

type BookingsState = Booking[];

const defaultFilters: FilterState = {
  searchQuery: '',
  city: 'all',
  category: 'all',
  subcategory: 'all',
  spaceType: 'all',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00 AM',
  durationHours: 4,
  durationType: 'hourly',
  zone: 'all',
  minPrice: 0,
  maxPrice: 200,
  minPriceNGN: 0,
  maxPriceNGN: 75000,
  priceRateType: 'hourly',
  minDailyPriceNGN: 0,
  maxDailyPriceNGN: 350000,
  minCapacity: 1,
  sortBy: 'recommended',

  availableNow: false,
  availableToday: false,
  under5k: false,
  hour24Access: false,
  hasParking: false,
  hasWifi: false,
  hasAC: false,
  hasGeneratorPower: false,
  hasReception: false,
  isPrivate: false,
  isSoundproof: false,
  hasPhotoEquipment: false,
  hasPodcastEquipment: false,
  hasGreenScreen: false,

  standingDeskOnly: false,
  monitorsOnly: false,
  amenities: [],
  instantBookOnly: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_CURRENCY = 'ofis_currency_ng_v4';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isSupabaseConfigured();
  const [databaseStatus] = useState<'connected' | 'demo_mode'>(
    isConfigured ? 'connected' : 'demo_mode'
  );

  // Current user & role
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('coworker');
  const isAuthenticated = !!currentUser;

  // Currency - default to NGN (Naira)
  const [currencyCode, setCurrencyCodeState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENCY);
    return (saved as CurrencyCode) || 'NGN';
  });

  const currentCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  const setCurrencyCode = (code: CurrencyCode) => {
    setCurrencyCodeState(code);
    localStorage.setItem(LOCAL_STORAGE_KEY_CURRENCY, code);
  };

  // Spaces state
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [isSpacesLoading, setIsSpacesLoading] = useState<boolean>(true);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  // Platform stats
  const [platformStats, setPlatformStats] = useState<PlatformCommissionStats>(INITIAL_PLATFORM_STATS);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(['space-1', 'space-2']);

  // Selected space & desk
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [activePassBooking, setActivePassBooking] = useState<Booking | null>(null);

  // Reviews modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetSpace, setReviewTargetSpace] = useState<Space | null>(null);
  const [reviewTargetBooking, setReviewTargetBooking] = useState<Booking | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const resetFilters = () => setFilters(defaultFilters);
  const setCategoryFilter = (cat: PrimaryCategory | 'all' | 'saved') => {
    setFilters(prev => ({ ...prev, category: cat, subcategory: 'all' }));
  };

  // Booking Draft
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>({
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00 AM',
    durationUnits: 3,
    durationType: 'hourly',
  });

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const openAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isBookingSuccessModalOpen, setIsBookingSuccessModalOpen] = useState(false);
  const [latestSuccessBooking, setLatestSuccessBooking] = useState<Booking | null>(null);
  const [isListSpaceModalOpen, setIsListSpaceModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalInitialMode, setAiModalInitialMode] = useState<'match' | 'optimize'>('match');

  // 1-Hour Desk Session Reminder State
  const [reminderBooking, setReminderBooking] = useState<Booking | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isReminderToastVisible, setIsReminderToastVisible] = useState(false);

  // Live simulation toggle
  const [liveSimulationActive, setLiveSimulationActive] = useState(true);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // 1. Initial Load & Auth Session Synchronization
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      setIsSpacesLoading(true);
      try {
        // Restore Supabase user session if active
        if (isConfigured && supabase) {
          const activeUser = await authService.getCurrentSessionUser();
          if (isMounted && activeUser) {
            setCurrentUser(activeUser);
            setCurrentRole(activeUser.role);
          }
        }

        // Fetch spaces from central database / fallback
        const { spaces: loadedSpaces } = await spacesService.fetchSpaces();
        if (isMounted && loadedSpaces && loadedSpaces.length > 0) {
          setSpaces(loadedSpaces);
        }
      } catch (err) {
        console.error('Initialization error in AppProvider:', err);
      } finally {
        if (isMounted) setIsSpacesLoading(false);
      }
    };

    initializeData();

    // Listen to Supabase Auth State changes
    let authListener: { subscription?: { unsubscribe: () => void } } | null = null;
    if (isConfigured && supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await authService.getCurrentSessionUser();
          if (user) {
            setCurrentUser(user);
            setCurrentRole(user.role);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });
      authListener = listener;
    }

    return () => {
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [isConfigured]);

  // 2. Realtime Spaces & Listings Updates (Supabase Realtime)
  useEffect(() => {
    if (!isConfigured || !supabase) return;

    const { unsubscribe } = spacesService.subscribeToSpaces((payload) => {
      console.log('Realtime space event received:', payload);
      if (payload.eventType === 'INSERT') {
        const newSpace = payload.new;
        setSpaces(prev => {
          if (prev.some(s => s.id === newSpace.id)) return prev;
          return [{
            ...INITIAL_SPACES[0],
            id: newSpace.id,
            name: newSpace.name,
            tagline: newSpace.tagline || '',
            description: newSpace.description || '',
            primaryCategory: newSpace.primary_category || 'WORK',
            city: newSpace.city || 'Lagos',
            address: newSpace.address || '',
            hourlyRateNGN: Number(newSpace.hourly_rate_ngn) || 5000,
            dailyRateNGN: Number(newSpace.daily_rate_ngn) || 25000,
            hourlyRate: Math.round((Number(newSpace.hourly_rate_ngn) || 5000) / 1550),
            dailyRate: Math.round((Number(newSpace.daily_rate_ngn) || 25000) / 1550),
            images: newSpace.images || ['https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80'],
            desks: [],
            capacity: Number(newSpace.capacity) || 10,
            amenities: newSpace.amenities || [],
            rules: newSpace.rules || [],
            createdAt: newSpace.created_at,
          }, ...prev];
        });
      } else if (payload.eventType === 'UPDATE') {
        const updated = payload.new;
        setSpaces(prev => prev.map(s => {
          if (s.id !== updated.id) return s;
          return {
            ...s,
            name: updated.name ?? s.name,
            tagline: updated.tagline ?? s.tagline,
            description: updated.description ?? s.description,
            hourlyRateNGN: updated.hourly_rate_ngn ? Number(updated.hourly_rate_ngn) : s.hourlyRateNGN,
            dailyRateNGN: updated.daily_rate_ngn ? Number(updated.daily_rate_ngn) : s.dailyRateNGN,
            hourlyRate: updated.hourly_rate_ngn ? Math.round(Number(updated.hourly_rate_ngn) / 1550) : s.hourlyRate,
            dailyRate: updated.daily_rate_ngn ? Math.round(Number(updated.daily_rate_ngn) / 1550) : s.dailyRate,
            capacity: updated.capacity ? Number(updated.capacity) : s.capacity,
            amenities: updated.amenities ?? s.amenities,
            images: updated.images ?? s.images,
          };
        }));
      } else if (payload.eventType === 'DELETE') {
        const oldId = payload.old?.id;
        if (oldId) {
          setSpaces(prev => prev.filter(s => s.id !== oldId));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConfigured]);

  // 3. User Bookings & Favorites when User logs in
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    const fetchUserData = async () => {
      const { bookings: userBookings } = await bookingsService.fetchUserBookings(currentUser.id);
      if (isMounted && userBookings && userBookings.length > 0) {
        setBookings(userBookings);
      }

      const { favoriteSpaceIds } = await favoritesService.fetchFavorites(currentUser.id);
      if (isMounted && favoriteSpaceIds) {
        setFavorites(favoriteSpaceIds);
      }
    };

    fetchUserData();

    const { unsubscribe } = bookingsService.subscribeToBookings(currentUser.id, () => {
      fetchUserData();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser]);

  // Auth: Sign Out
  const signOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    showToast('Signed out of OFIS successfully', 'info');
  };

  // Favorites
  const toggleFavorite = useCallback(async (spaceId: string) => {
    const userId = currentUser?.id || 'guest-user';
    const { isFavorited } = await favoritesService.toggleFavorite(userId, spaceId);
    setFavorites(prev => {
      if (isFavorited) {
        showToast('Space saved to your favorites ❤️', 'success');
        return prev.includes(spaceId) ? prev : [...prev, spaceId];
      } else {
        showToast('Removed space from saved list', 'info');
        return prev.filter(id => id !== spaceId);
      }
    });
  }, [currentUser, showToast]);

  const isFavorite = useCallback((spaceId: string) => {
    return favorites.includes(spaceId);
  }, [favorites]);

  // Price conversion helper
  const convertPrice = useCallback((amountInUSD: number, targetCurrencyCode?: CurrencyCode): number => {
    const targetCode = targetCurrencyCode || currentCurrency.code;
    const config = SUPPORTED_CURRENCIES.find(c => c.code === targetCode) || currentCurrency;
    return +(amountInUSD * config.rateToUSD).toFixed(2);
  }, [currentCurrency]);

  const formatPrice = useCallback((amountInUSD: number, targetCurrencyCode?: CurrencyCode): string => {
    const targetCode = targetCurrencyCode || currentCurrency.code;
    const config = SUPPORTED_CURRENCIES.find(c => c.code === targetCode) || currentCurrency;
    const converted = convertPrice(amountInUSD, targetCode);

    if (config.code === 'NGN') {
      return `₦${Math.round(converted).toLocaleString('en-NG')}`;
    }
    return `${config.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [convertPrice, currentCurrency]);

  const formatPriceNaira = useCallback((amountInNaira: number): string => {
    return `₦${Math.round(amountInNaira).toLocaleString('en-NG')}`;
  }, []);

  // Switch demo user
  const switchDemoUser = (userId: string) => {
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setCurrentRole(found.role);
      showToast(`Switched account to ${found.name} (${found.role.toUpperCase()})`, 'info');
    }
  };

  // Space management
  const updateDeskStatus = (spaceId: string, deskId: string, newStatus: DeskStatus, occupantInfo?: any) => {
    setSpaces(prevSpaces =>
      (prevSpaces || []).map(sp => {
        if (sp.id !== spaceId) return sp;
        const currentDesks = Array.isArray(sp.desks) ? sp.desks : [];
        return {
          ...sp,
          desks: currentDesks.map(desk => {
            if (desk.id !== deskId) return desk;
            return {
              ...desk,
              status: newStatus,
              currentOccupant: occupantInfo !== undefined ? occupantInfo : desk.currentOccupant,
            };
          }),
        };
      })
    );
  };

  const refreshSpaces = async () => {
    setIsSpacesLoading(true);
    const { spaces: fetched } = await spacesService.fetchSpaces();
    if (fetched && fetched.length > 0) {
      setSpaces(fetched);
    }
    setIsSpacesLoading(false);
  };

  const createSpace = async (newSpaceData: Partial<Space>): Promise<Space> => {
    const ownerId = currentUser?.id || 'host-user-1';
    const { space: created, error } = await spacesService.createSpace(newSpaceData, ownerId);

    if (error) {
      showToast(error, 'error');
    }

    const resolvedSpace = created || {
      ...(INITIAL_SPACES[0]),
      id: `space-${Date.now()}`,
      name: newSpaceData.name || 'New Workspace',
      hostId: ownerId,
      ...newSpaceData,
    } as Space;

    setSpaces(prev => [resolvedSpace, ...prev.filter(s => s.id !== resolvedSpace.id)]);
    showToast(`"${resolvedSpace.name}" is now live on OFIS!`, 'success');
    return resolvedSpace;
  };

  const addSpace = async (newSpace: Omit<Space, 'id' | 'createdAt'>): Promise<Space> => {
    return createSpace(newSpace);
  };

  const updateSpace = async (spaceId: string, updates: Partial<Space>) => {
    setSpaces(prev => prev.map(s => (s.id === spaceId ? { ...s, ...updates } : s)));
    await spacesService.updateSpace(spaceId, updates);
    showToast('Space listing updated successfully.', 'success');
  };

  const deleteSpace = async (spaceId: string) => {
    setSpaces(prev => prev.filter(s => s.id !== spaceId));
    await spacesService.deleteSpace(spaceId);
    showToast('Space listing removed.', 'info');
  };

  // Booking management with double-booking verification
  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'transactionId' | 'qrCodeUrl' | 'bookingReference'>
  ): Promise<Booking> => {
    const { booking, error } = await bookingsService.createBooking(bookingData);

    if (error) {
      showToast(error, 'error');
      throw new Error(error);
    }

    const confirmedBooking = booking!;

    // Update desk status in space
    updateDeskStatus(bookingData.spaceId, bookingData.deskId, 'reserved', {
      userId: currentUser?.id || 'guest-user',
      userName: currentUser?.name || bookingData.coworkerName || 'Guest Coworker',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      checkInTime: bookingData.startTime,
      untilTime: bookingData.endTime,
      bookingId: confirmedBooking.id,
    });

    // Update platform ledger
    setPlatformStats(prev => ({
      ...prev,
      totalGrossVolumeUSD: +(prev.totalGrossVolumeUSD + (confirmedBooking.totalAmount / 1550)).toFixed(2),
      totalPlatformCommissionUSD: +(prev.totalPlatformCommissionUSD + (confirmedBooking.platformCommissionFee / 1550)).toFixed(2),
      totalHostPayoutsUSD: +(prev.totalHostPayoutsUSD + (confirmedBooking.hostNetPayout / 1550)).toFixed(2),
      totalBookingsCount: prev.totalBookingsCount + 1,
      transactionsLedger: [
        {
          bookingId: confirmedBooking.id,
          spaceName: confirmedBooking.spaceName,
          hostName: confirmedBooking.hostName,
          coworkerName: confirmedBooking.coworkerName,
          grossUSD: +(confirmedBooking.totalAmount / 1550).toFixed(2),
          platformFeeUSD: +(confirmedBooking.platformCommissionFee / 1550).toFixed(2),
          hostPayoutUSD: +(confirmedBooking.hostNetPayout / 1550).toFixed(2),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        },
        ...prev.transactionsLedger,
      ],
    }));

    setBookings(prev => [confirmedBooking, ...prev.filter(b => b.id !== confirmedBooking.id)]);
    setActivePassBooking(confirmedBooking);

    showToast(`Booking Confirmed! Pass Reference: ${confirmedBooking.bookingReference}`, 'success');
    return confirmedBooking;
  };

  const cancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );

    await bookingsService.updateBookingStatus(bookingId, 'cancelled');

    // Free up desk
    updateDeskStatus(booking.spaceId, booking.deskId, 'available', undefined);
    showToast(`Booking ${booking.bookingReference || bookingId} cancelled. Refund initiated to original payment method.`, 'info');
  };

  const checkInBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'checked_in' } : b))
    );

    await bookingsService.updateBookingStatus(bookingId, 'checked_in');

    updateDeskStatus(booking.spaceId, booking.deskId, 'occupied', {
      userId: booking.coworkerId,
      userName: booking.coworkerName,
      avatar: booking.coworkerAvatar,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      untilTime: booking.endTime,
      bookingId,
    });

    showToast(`Checked in to ${booking.deskCode} at ${booking.spaceName}!`, 'success');
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status } : b)));
    await bookingsService.updateBookingStatus(bookingId, status);
    showToast(`Booking status updated to ${status}.`, 'info');
  };

  // Review management
  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'helpfulUserIds'>) => {
    const { review, error } = await reviewsService.createReview(reviewData);

    if (error) {
      showToast(error, 'error');
    }

    const finalReview: Review = review || {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      helpfulUserIds: [],
    };

    setReviews(prev => [finalReview, ...prev]);

    // Recalculate average rating of target space
    setSpaces(prev =>
      (prev || []).map(sp => {
        if (sp.id !== reviewData.spaceId) return sp;
        const allSpaceReviews = [finalReview, ...reviews.filter(r => r.spaceId === sp.id)];
        const avg = +(allSpaceReviews.reduce((sum, r) => sum + r.rating, 0) / (allSpaceReviews.length || 1)).toFixed(2);
        return {
          ...sp,
          rating: avg,
          reviewCount: allSpaceReviews.length,
        };
      })
    );

    showToast('Thank you! Your verified space review has been published.', 'success');
  };

  const toggleHelpfulReview = async (reviewId: string) => {
    const currentUserId = currentUser?.id || 'guest';
    await reviewsService.toggleHelpful(reviewId, currentUserId);

    setReviews(prev =>
      (prev || []).map(r => {
        if (r.id !== reviewId) return r;
        const helpfulUserIds = r.helpfulUserIds || [];
        const isHelpful = helpfulUserIds.includes(currentUserId);
        const newHelpfulUserIds = isHelpful
          ? helpfulUserIds.filter(id => id !== currentUserId)
          : [...helpfulUserIds, currentUserId];
        return {
          ...r,
          helpfulCount: isHelpful ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1,
          helpfulUserIds: newHelpfulUserIds,
        };
      })
    );
  };

  const addHostReply = async (reviewId: string, replyMessage: string) => {
    setReviews(prev =>
      (prev || []).map(r => {
        if (r.id !== reviewId) return r;
        return {
          ...r,
          hostReply: {
            hostName: currentUser?.name || 'Host Manager',
            hostAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            message: replyMessage,
            createdAt: new Date().toISOString(),
          },
        };
      })
    );
    showToast('Your host response has been posted.', 'success');
  };

  const openWriteReviewModal = (space: Space, booking?: Booking) => {
    setReviewTargetSpace(space);
    if (booking) setReviewTargetBooking(booking);
    setIsReviewModalOpen(true);
  };

  const isUserVerifiedForSpace = (userId: string, spaceId: string): boolean => {
    return bookings.some(b => b.coworkerId === userId && b.spaceId === spaceId && (b.status === 'completed' || b.status === 'checked_in'));
  };

  // AI Modal
  const openAiModal = (mode: 'match' | 'optimize') => {
    setAiModalInitialMode(mode);
    setIsAiModalOpen(true);
  };

  // Session Reminders
  const triggerSessionReminder = (targetBooking?: Booking, openModalImmediately: boolean = false) => {
    const booking = targetBooking || bookings.find(b => b.status === 'checked_in') || bookings[0];
    if (!booking) return;
    setReminderBooking(booking);
    if (openModalImmediately) {
      setIsReminderModalOpen(true);
    } else {
      setIsReminderToastVisible(true);
    }
  };

  const dismissSessionReminder = () => {
    setIsReminderToastVisible(false);
    setIsReminderModalOpen(false);
  };

  const snoozeSessionReminder = (minutes: number = 15) => {
    setIsReminderToastVisible(false);
    setIsReminderModalOpen(false);
    showToast(`Session reminder snoozed for ${minutes} minutes.`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isSupabaseConnected: isConfigured,
        databaseStatus,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        signOut,
        currentRole,
        setCurrentRole,
        switchDemoUser,
        currentCurrency,
        setCurrencyCode,
        formatPrice,
        convertPrice,
        formatPriceNaira,
        spaces,
        isSpacesLoading,
        selectedSpace,
        setSelectedSpace,
        selectedDesk,
        setSelectedDesk,
        updateDeskStatus,
        createSpace,
        addSpace,
        updateSpace,
        deleteSpace,
        refreshSpaces,
        bookings,
        createBooking,
        cancelBooking,
        checkInBooking,
        updateBookingStatus,
        activePassBooking,
        setActivePassBooking,
        reviews,
        addReview,
        toggleHelpfulReview,
        addHostReply,
        isReviewModalOpen,
        setIsReviewModalOpen,
        reviewTargetSpace,
        setReviewTargetSpace,
        reviewTargetBooking,
        setReviewTargetBooking,
        openWriteReviewModal,
        isUserVerifiedForSpace,
        platformStats,
        filters,
        setFilters,
        resetFilters,
        setCategoryFilter,
        favorites,
        toggleFavorite,
        isFavorite,
        bookingDraft,
        setBookingDraft,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        isAvatarModalOpen,
        setIsAvatarModalOpen,
        openAvatarModal,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        isPassModalOpen,
        setIsPassModalOpen,
        isBookingSuccessModalOpen,
        setIsBookingSuccessModalOpen,
        latestSuccessBooking,
        setLatestSuccessBooking,
        isListSpaceModalOpen,
        setIsListSpaceModalOpen,
        isAiModalOpen,
        setIsAiModalOpen,
        aiModalInitialMode,
        openAiModal,
        reminderBooking,
        setReminderBooking,
        isReminderModalOpen,
        setIsReminderModalOpen,
        isReminderToastVisible,
        setIsReminderToastVisible,
        triggerSessionReminder,
        dismissSessionReminder,
        snoozeSessionReminder,
        liveSimulationActive,
        setLiveSimulationActive,
        toast,
        showToast,
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
