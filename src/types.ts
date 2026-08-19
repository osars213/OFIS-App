export type UserRole = 'coworker' | 'host' | 'admin';

export type ThemeMode = 'dark' | 'light' | 'system';

export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'SGD' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = X Currency (e.g. 1550 for NGN)
  flag: string;
}

export type DeskStatus = 'available' | 'reserved' | 'occupied' | 'maintenance';

export type DeskZone = 'quiet' | 'window' | 'collaborative' | 'standing' | 'executive' | 'creator' | 'studio' | 'podcast' | 'boardroom' | 'event';

// 4 Primary Categories required by OFIS
export type PrimaryCategory = 'WORK' | 'CREATE' | 'MEET' | 'HOST';

export type WorkSubcategory = 'coworking_desks' | 'hot_desks' | 'private_offices' | 'day_offices';
export type CreateSubcategory =
  | 'content_studios'
  | 'podcast_studios'
  | 'photography_studios'
  | 'video_studios'
  | 'music_studios'
  | 'green_screen_studios'
  | 'production_spaces'
  | 'shoot_locations';
export type MeetSubcategory = 'meeting_rooms' | 'boardrooms' | 'conference_rooms' | 'training_rooms';
export type HostSubcategory = 'event_spaces' | 'small_venues' | 'workshop_spaces' | 'seminar_spaces';
export type SpaceSubcategory = WorkSubcategory | CreateSubcategory | MeetSubcategory | HostSubcategory | string;

export type SpaceCategory = 'all' | 'saved' | PrimaryCategory | 'coworking' | 'creator_space' | 'studio_space' | 'podcast_space' | 'tech_lab' | 'meeting_room';

export type ListingSource = 'ofis_hosted' | 'partner_api' | 'direct_host';

export interface Desk {
  id: string;
  spaceId: string;
  name: string;
  code: string; // e.g. "D-01", "W-12", "ST-01"
  row: number;
  col: number;
  zone: DeskZone;
  status: DeskStatus;
  features: string[];
  monitorSetup: string; // e.g. "Dual 27\" 4K LG USB-C", "Single 32\" Curved 4K", "None (Bring your own)"
  chairType: string; // e.g. "Herman Miller Aeron", "Steelcase Gesture", "Ergohuman Mesh"
  standingMotorized: boolean;
  hasPowerOutlet: boolean;
  hasLanCable: boolean;
  daylightRating: 1 | 2 | 3 | 4 | 5;
  noiseLevel: 'Pin-drop quiet' | 'Gentle ambient' | 'Vibrant buzz';
  currentOccupant?: {
    userId: string;
    userName: string;
    avatar?: string;
    checkInTime: string;
    untilTime: string;
    bookingId: string;
  };
}

export interface ReviewSubRatings {
  cleanliness: number; // 1-5
  wifiSpeed: number; // 1-5
  noiseComfort: number; // 1-5
  ergonomics: number; // 1-5
  amenities: number; // 1-5
}

export interface Review {
  id: string;
  spaceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  rating: number; // 1-5 overall
  subRatings: ReviewSubRatings;
  title: string;
  comment: string;
  deskCode?: string;
  deskName?: string;
  isVerifiedStay: boolean;
  bookingId?: string;
  createdAt: string;
  helpfulCount: number;
  helpfulUserIds?: string[];
  hostReply?: {
    hostName: string;
    hostAvatar: string;
    message: string;
    createdAt: string;
  };
}

export interface Space {
  // Core Inventory Architecture fields
  id: string;
  listing_id?: string;
  source: ListingSource;
  external_id?: string;
  booking_url?: string;

  name: string;
  tagline: string;
  description: string;

  // Primary Category & Subcategory
  primaryCategory: PrimaryCategory;
  subcategory: string; // e.g. "podcast_studios", "coworking_desks", "boardrooms", "event_spaces"
  category?: SpaceCategory; // backward compat

  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostEmail: string;
  hostPhone: string;
  hostWhatsApp: string;
  hostResponseTime?: string;
  isSuperhost?: boolean;

  city: string; // Lagos, Abuja, Port Harcourt, Ibadan, Enugu, etc.
  country: string;
  address: string;
  neighborhood: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  latitude?: number;
  longitude?: number;

  rating: number;
  reviewCount: number;
  ratingCategories?: ReviewSubRatings;
  starsDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  images: string[];
  capacity: number; // Max people
  amenities: string[]; // Facilities: 24/7 Power, Starlink, AC, etc.
  equipment: string[]; // Production & tech gear
  rules: string[];
  cancellationPolicy: string; // e.g. "Flexible: Free cancellation up to 2 hours before start"
  openingHours: string;
  availableTimeSlots?: string[]; // e.g. ['08:00 AM', '09:00 AM', ...]
  blockedDates?: string[]; // e.g. ['2026-08-25']

  wifiSSID: string;
  wifiPass: string;
  doorPIN: string;

  dailyRate: number; // in USD base
  hourlyRate: number; // in USD base
  weeklyRate: number;
  monthlyRate: number;

  hourlyRateNGN?: number; // Optional direct Naira override
  dailyRateNGN?: number;

  desks: Desk[];
  floorplanLayout: {
    gridRows: number;
    gridCols: number;
    roomZones: {
      id: string;
      name: string;
      zone: DeskZone;
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
    }[];
    facilityPoints: {
      type: 'coffee' | 'phone_booth' | 'restroom' | 'meeting_room' | 'entrance' | 'printer' | 'stage';
      name: string;
      x: number;
      y: number;
    }[];
  };

  instantBook: boolean;
  quietLevel: 'High' | 'Moderate' | 'Vibrant';
  createdAt: string;
  featured?: boolean;
}

export type BookingDurationType = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface BookingDraft {
  startDate: string;
  startTime: string;
  durationUnits: number;
  durationType: BookingDurationType;
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "OFS-LAG-849201"
  spaceId: string;
  spaceName: string;
  spaceCity: string;
  spaceAddress: string;
  spaceImage: string;
  primaryCategory?: PrimaryCategory;
  subcategory?: string;

  deskId: string;
  deskName: string;
  deskCode: string;
  deskZone: DeskZone;

  coworkerId: string;
  coworkerName: string;
  coworkerEmail: string;
  coworkerPhone?: string;
  coworkerAvatar?: string;

  hostId: string;
  hostName: string;
  hostPhone?: string;
  hostWhatsApp?: string;

  durationType: BookingDurationType;
  durationUnits: number; // e.g. 3 hours
  startDate: string; // ISO string
  endDate: string; // ISO string
  startTime: string; // e.g. "02:00 PM"
  endTime: string; // e.g. "05:00 PM"

  currency: CurrencyCode;
  currencySymbol: string;
  baseAmount: number; // subtotal in Naira or user currency
  platformCommissionFee: number; // service fee e.g. 5%
  commissionRate: number;
  taxes: number; // VAT
  totalAmount: number; // final total
  hostNetPayout: number;

  status: 'pending' | 'payment_pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'expired';
  paymentMethod: 'paystack' | 'bank_transfer' | 'ussd' | 'opay_kuda' | 'flutterwave' | 'card';
  cardLast4?: string;
  bankName?: string;
  transactionId: string;
  createdAt: string;

  wifiSSID?: string;
  wifiPass?: string;
  doorPIN?: string;
  qrCodeUrl: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  company?: string;
  stripeConnected?: boolean;
  stripeAccountId?: string;
  payoutBalanceUSD?: number;
  totalEarnedUSD?: number;
}

export type SortOption = 'recommended' | 'price_asc' | 'rating_desc' | 'nearest' | 'popular' | 'newest';

export interface FilterState {
  searchQuery: string;
  city: string; // 'all' | 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Ibadan' | 'Enugu' | etc.
  category: SpaceCategory; // 'all' | 'WORK' | 'CREATE' | 'MEET' | 'HOST' | 'saved'
  subcategory: string; // 'all' or specific subcategory
  spaceType: string; // 'all' | 'coworking' | 'private_office' | 'meeting_room' | 'podcast_studio' | 'content_studio' | 'photography_studio' | 'video_studio' | 'event_space'
  date: string;
  startTime: string;
  durationHours: number;
  durationType: BookingDurationType;
  zone: 'all' | DeskZone;
  minPrice: number;
  maxPrice: number; // in USD
  minPriceNGN: number;
  maxPriceNGN: number;
  priceRateType?: 'hourly' | 'daily';
  minDailyPriceNGN?: number;
  maxDailyPriceNGN?: number;
  minCapacity: number;
  sortBy: SortOption;

  // Specific Nigerian Quick Filters
  availableNow: boolean;
  availableToday: boolean;
  under5k: boolean; // Under ₦5,000/hr
  hour24Access: boolean;
  hasParking: boolean;
  hasWifi: boolean;
  hasAC: boolean;
  hasGeneratorPower: boolean;
  hasReception: boolean;
  isPrivate: boolean;
  isSoundproof: boolean;
  hasPhotoEquipment: boolean;
  hasPodcastEquipment: boolean;
  hasGreenScreen: boolean;

  standingDeskOnly: boolean;
  monitorsOnly: boolean;
  amenities: string[];
  instantBookOnly: boolean;
}

export interface PlatformCommissionStats {
  totalGrossVolumeUSD: number;
  totalPlatformCommissionUSD: number;
  totalHostPayoutsUSD: number;
  totalBookingsCount: number;
  activeDesksCount: number;
  platformFeePercentage: number; // 5-8%
  transactionsLedger: {
    bookingId: string;
    spaceName: string;
    hostName: string;
    coworkerName: string;
    grossUSD: number;
    platformFeeUSD: number;
    hostPayoutUSD: number;
    timestamp: string;
  }[];
}
