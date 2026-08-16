import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

interface AppContextType {
  // User & Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  signOut: () => void;
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
  selectedSpace: Space | null;
  setSelectedSpace: (space: Space | null) => void;
  selectedDesk: Desk | null;
  setSelectedDesk: (desk: Desk | null) => void;
  updateDeskStatus: (spaceId: string, deskId: string, newStatus: DeskStatus, occupantInfo?: any) => void;
  createSpace: (newSpaceData: Partial<Space>) => Space;
  addSpace: (newSpace: Omit<Space, 'id' | 'createdAt'>) => Space;
  updateSpace: (spaceId: string, updates: Partial<Space>) => void;
  deleteSpace: (spaceId: string) => void;

  // Bookings
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'transactionId' | 'qrCodeUrl' | 'bookingReference'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  checkInBooking: (bookingId: string) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  activePassBooking: Booking | null;
  setActivePassBooking: (booking: Booking | null) => void;

  // Reviews & Ratings
  reviews: Review[];
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'helpfulUserIds'>) => void;
  toggleHelpfulReview: (reviewId: string) => void;
  addHostReply: (reviewId: string, replyMessage: string) => void;
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
  toggleFavorite: (spaceId: string) => void;
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

const LOCAL_STORAGE_KEY_SPACES = 'ofis_spaces_ng_v4';
const LOCAL_STORAGE_KEY_BOOKINGS = 'ofis_bookings_ng_v4';
const LOCAL_STORAGE_KEY_REVIEWS = 'ofis_reviews_ng_v4';
const LOCAL_STORAGE_KEY_STATS = 'ofis_stats_ng_v4';
const LOCAL_STORAGE_KEY_CURRENCY = 'ofis_currency_ng_v4';
const LOCAL_STORAGE_KEY_FAVORITES = 'ofis_favorites_ng_v4';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user & role (null = logged out)
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('coworker');

  const isAuthenticated = !!currentUser;

  const signOut = () => {
    setCurrentUser(null);
    showToast('Signed out of OFIS successfully', 'info');
  };

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

  // Spaces state with persistence & sanitization
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SPACES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => ({
            ...s,
            desks: Array.isArray(s.desks) ? s.desks : [],
            images: Array.isArray(s.images) && s.images.length > 0 ? s.images : ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'],
            amenities: Array.isArray(s.amenities) ? s.amenities : [],
            rules: Array.isArray(s.rules) ? s.rules : [],
            coordinates: s.coordinates && typeof s.coordinates.lat === 'number' ? s.coordinates : { lat: 6.4474, lng: 3.4731 },
            city: s.city || 'Lagos',
            neighborhood: s.neighborhood || s.city || 'Lagos',
            rating: typeof s.rating === 'number' ? s.rating : 4.9,
            reviewCount: typeof s.reviewCount === 'number' ? s.reviewCount : 12,
            primaryCategory: s.primaryCategory || 'WORK',
            subcategory: s.subcategory || 'coworking_desks',
          }));
        }
      } catch (e) {
        console.error('Failed to parse saved spaces', e);
      }
    }
    return INITIAL_SPACES;
  });

  // Bookings state with persistence
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved bookings', e);
      }
    }
    return INITIAL_BOOKINGS;
  });

  // Reviews state with persistence
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REVIEWS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved reviews', e);
      }
    }
    return INITIAL_REVIEWS;
  });

  // Platform stats
  const [platformStats, setPlatformStats] = useState<PlatformCommissionStats>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STATS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved stats', e);
      }
    }
    return INITIAL_PLATFORM_STATS;
  });

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

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FAVORITES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved favorites', e);
      }
    }
    return ['space-1', 'space-2'];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((spaceId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(spaceId);
      if (exists) {
        const next = prev.filter(id => id !== spaceId);
        showToast('Removed space from saved list', 'info');
        return next;
      } else {
        const next = [...prev, spaceId];
        showToast('Space saved to your favorites ❤️', 'success');
        return next;
      }
    });
  }, [showToast]);

  const isFavorite = useCallback((spaceId: string) => {
    return favorites.includes(spaceId);
  }, [favorites]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SPACES, JSON.stringify(spaces));
  }, [spaces]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STATS, JSON.stringify(platformStats));
  }, [platformStats]);

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

  const createSpace = (newSpaceData: Partial<Space>): Space => {
    const newId = `space-${Date.now()}`;
    const primaryCat: PrimaryCategory = newSpaceData.primaryCategory || 'WORK';

    const fullSpace: Space = {
      id: newId,
      listing_id: `OFS-LST-${Math.floor(100 + Math.random() * 900)}`,
      source: 'direct_host',
      name: newSpaceData.name || 'New Nigerian Space',
      tagline: newSpaceData.tagline || 'Modern dedicated workspace and studio with guaranteed power and high-speed internet.',
      description: newSpaceData.description || 'Turnkey professional physical space ready for work, meetings or content creation.',
      primaryCategory: primaryCat,
      subcategory: newSpaceData.subcategory || 'coworking_desks',
      category: newSpaceData.category || 'coworking',
      capacity: newSpaceData.capacity || 10,
      hostId: currentUser?.id || 'host-user-1',
      hostName: currentUser?.name || 'OFIS Host',
      hostAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      hostEmail: currentUser?.email || 'host@ofis.ng',
      hostPhone: currentUser?.phone || '+234 800 000 0000',
      hostWhatsApp: newSpaceData.hostWhatsApp || '+2348000000000',
      hostResponseTime: 'Within 15 minutes',
      isSuperhost: false,
      city: newSpaceData.city || 'Lagos',
      country: 'Nigeria',
      address: newSpaceData.address || 'Plot 1, Lagos Island',
      neighborhood: newSpaceData.neighborhood || 'Victoria Island',
      coordinates: newSpaceData.coordinates || { lat: 6.4474, lng: 3.4731 },
      latitude: newSpaceData.coordinates?.lat || 6.4474,
      longitude: newSpaceData.coordinates?.lng || 3.4731,
      rating: 5.0,
      reviewCount: 0,
      images: newSpaceData.images && newSpaceData.images.length > 0 ? newSpaceData.images : [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80',
      ],
      amenities: newSpaceData.amenities || [
        '24/7 Power (Generator + Solar Inverter)',
        'High-Speed Wi-Fi',
        'Air Conditioning',
        'Gated Security',
      ],
      equipment: newSpaceData.equipment || [],
      rules: newSpaceData.rules || [
        'Respect quiet work policies in shared areas',
        'Clean up upon departure',
      ],
      cancellationPolicy: newSpaceData.cancellationPolicy || 'Flexible: Free cancellation up to 2 hours before start.',
      openingHours: newSpaceData.openingHours || '8:00 AM - 9:00 PM Daily',
      wifiSSID: newSpaceData.wifiSSID || 'OFIS-Guest-Fast',
      wifiPass: newSpaceData.wifiPass || 'OfisNaija2026!',
      doorPIN: newSpaceData.doorPIN || '1234#',
      hourlyRate: newSpaceData.hourlyRate || 5,
      dailyRate: newSpaceData.dailyRate || 25,
      weeklyRate: newSpaceData.weeklyRate || 100,
      monthlyRate: newSpaceData.monthlyRate || 350,
      hourlyRateNGN: newSpaceData.hourlyRateNGN || Math.round((newSpaceData.hourlyRate || 5) * 1550),
      dailyRateNGN: newSpaceData.dailyRateNGN || Math.round((newSpaceData.dailyRate || 25) * 1550),
      instantBook: true,
      quietLevel: 'Moderate',
      createdAt: new Date().toISOString(),
      featured: false,
      desks: newSpaceData.desks || [
        {
          id: `desk-${newId}-1`,
          spaceId: newId,
          name: 'Dedicated Station 01',
          code: 'DS-01',
          row: 0,
          col: 0,
          zone: 'quiet',
          status: 'available',
          features: ['Power Outlets', 'Ergonomic Mesh Chair', 'High-Speed Wi-Fi'],
          monitorSetup: 'Dual 27" 4K LG UltraFine',
          chairType: 'Ergonomic Mesh',
          standingMotorized: true,
          hasPowerOutlet: true,
          hasLanCable: true,
          daylightRating: 4,
          noiseLevel: 'Pin-drop quiet',
        },
      ],
      floorplanLayout: {
        gridRows: 4,
        gridCols: 4,
        roomZones: [
          { id: 'zone-main', name: 'Main Work & Studio Zone', zone: 'quiet', x: 0, y: 0, w: 2, h: 2, color: 'emerald' },
        ],
        facilityPoints: [
          { type: 'coffee', name: 'Coffee Station', x: 0, y: 4 },
          { type: 'entrance', name: 'Main Entrance', x: 2, y: 4 },
        ],
      },
    };

    setSpaces(prev => [fullSpace, ...prev]);
    showToast(`"${fullSpace.name}" is now live on OFIS!`, 'success');
    return fullSpace;
  };

  const addSpace = (newSpace: Omit<Space, 'id' | 'createdAt'>): Space => {
    return createSpace(newSpace);
  };

  const updateSpace = (spaceId: string, updates: Partial<Space>) => {
    setSpaces(prev => prev.map(s => (s.id === spaceId ? { ...s, ...updates } : s)));
    showToast('Space listing updated successfully.', 'success');
  };

  const deleteSpace = (spaceId: string) => {
    setSpaces(prev => prev.filter(s => s.id !== spaceId));
    showToast('Space listing removed.', 'info');
  };

  // Booking management
  const createBooking = (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'transactionId' | 'qrCodeUrl' | 'bookingReference'>
  ): Booking => {
    const bookingId = `bk-${Date.now().toString().slice(-6)}`;
    const randomRefNum = Math.floor(100000 + Math.random() * 900000);
    const cityCode = (bookingData.spaceCity || 'LOS').slice(0, 3).toUpperCase();
    const bookingReference = `OFS-${cityCode}-${randomRefNum}`;
    const transactionId = `pstk_txn_${Math.random().toString(36).substring(2, 12)}`;
    const coworkerNameSafe = (bookingData.coworkerName || 'GUEST').toUpperCase();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=OFIS-${bookingReference}-${bookingData.deskCode || 'HOT-DESK'}-${encodeURIComponent(coworkerNameSafe)}`;

    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      bookingReference,
      transactionId,
      qrCodeUrl,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    // Update desk status in space
    updateDeskStatus(bookingData.spaceId, bookingData.deskId, 'reserved', {
      userId: currentUser?.id || 'guest-user',
      userName: currentUser?.name || bookingData.coworkerName || 'Guest Coworker',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      checkInTime: bookingData.startTime,
      untilTime: bookingData.endTime,
      bookingId,
    });

    // Update Platform ledger
    setPlatformStats(prev => ({
      ...prev,
      totalGrossVolumeUSD: +(prev.totalGrossVolumeUSD + (newBooking.totalAmount / 1550)).toFixed(2),
      totalPlatformCommissionUSD: +(prev.totalPlatformCommissionUSD + (newBooking.platformCommissionFee / 1550)).toFixed(2),
      totalHostPayoutsUSD: +(prev.totalHostPayoutsUSD + (newBooking.hostNetPayout / 1550)).toFixed(2),
      totalBookingsCount: prev.totalBookingsCount + 1,
      transactionsLedger: [
        {
          bookingId,
          spaceName: newBooking.spaceName,
          hostName: newBooking.hostName,
          coworkerName: newBooking.coworkerName,
          grossUSD: +(newBooking.totalAmount / 1550).toFixed(2),
          platformFeeUSD: +(newBooking.platformCommissionFee / 1550).toFixed(2),
          hostPayoutUSD: +(newBooking.hostNetPayout / 1550).toFixed(2),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        },
        ...prev.transactionsLedger,
      ],
    }));

    setBookings(prev => [newBooking, ...prev]);
    setActivePassBooking(newBooking);

    showToast(`Booking Confirmed! Pass Reference: ${bookingReference}`, 'success');
    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );

    // Free up desk
    updateDeskStatus(booking.spaceId, booking.deskId, 'available', undefined);
    showToast(`Booking ${booking.bookingReference || bookingId} cancelled. Refund initiated to original payment method.`, 'info');
  };

  const checkInBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'checked_in' } : b))
    );

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

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status } : b)));
    showToast(`Booking status updated to ${status}.`, 'info');
  };

  // Review management
  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'helpfulUserIds'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      helpfulUserIds: [],
    };

    setReviews(prev => [newReview, ...prev]);

    // Recalculate average rating of target space
    setSpaces(prev =>
      (prev || []).map(sp => {
        if (sp.id !== reviewData.spaceId) return sp;
        const allSpaceReviews = [newReview, ...reviews.filter(r => r.spaceId === sp.id)];
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

  const toggleHelpfulReview = (reviewId: string) => {
    const currentUserId = currentUser?.id || 'guest';
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

  const addHostReply = (reviewId: string, replyMessage: string) => {
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
        selectedSpace,
        setSelectedSpace,
        selectedDesk,
        setSelectedDesk,
        updateDeskStatus,
        createSpace,
        addSpace,
        updateSpace,
        deleteSpace,
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
