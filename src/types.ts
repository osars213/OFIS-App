export type SpaceCategory = 
  | 'coworking'
  | 'meeting'
  | 'podcast'
  | 'photography'
  | 'private_office'
  | 'event';

export type SpaceTier = 'hourly' | 'daily' | 'monthly' | 'custom';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: 'power' | 'connectivity' | 'media' | 'comfort' | 'accessibility';
}

export interface SpaceSeat {
  id: string;
  label: string;
  type: 'hot_desk' | 'dedicated_desk' | 'booth' | 'chair' | 'executive';
  status: 'available' | 'reserved' | 'occupied';
  pricePerHour: number;
  x: number;
  y: number;
}

export interface Review {
  id: string;
  spaceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  tags?: string[];
  verifiedStay?: boolean;
}

export interface Space {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: SpaceCategory;
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Ibadan' | 'Nairobi' | 'Johannesburg' | 'Cape Town' | 'Accra' | 'Kigali' | 'Cairo' | 'Casablanca' | 'Abidjan' | 'Dakar' | string;
  country?: string;
  region?: 'West Africa' | 'East Africa' | 'Southern Africa' | 'North Africa' | string;
  neighborhood: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  pricePerHour: number;
  pricePerDay: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  capacity: number;
  images: string[];
  featuredImage: string;
  amenities: string[];
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  hostResponseRate?: string;
  isSuperhost?: boolean;
  instantBooking: boolean;
  hasBackupPower: boolean; // Solar / Gen 24/7 (crucial for Nigeria)
  backupPowerType: '24/7 Solar & Inverter' | 'Dual Silent Generators' | 'Triple Grid+Gen+Solar' | string;
  internetSpeedMbps: number;
  noiseLevel: 'Silent / Library' | 'Moderate / Focus' | 'Collaborative / Vibrant' | 'Soundproofed Studio';
  floorPlanSeats?: SpaceSeat[];
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  rules: string[];
  tags: string[];
  isVerified: boolean;
}

export interface Booking {
  id: string;
  spaceId: string;
  spaceTitle: string;
  spaceImage: string;
  spaceAddress: string;
  spaceCity: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  bookingType: 'hourly' | 'daily';
  startDate: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  durationDays?: number;
  selectedSeats?: string[];
  guestsCount: number;
  subtotal?: number;
  serviceFee?: number;
  totalPrice: number;
  currency: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentReference?: string;
  paymentMethod?: 'wallet' | 'card' | 'transfer' | 'ussd';
  bookingStatus: 'confirmed' | 'active' | 'completed' | 'cancelled';
  passCode: string;
  qrCodeValue: string;
  wifiSsid?: string;
  wifiPassword?: string;
  accessInstructions?: string;
  createdAt: string;
}

export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payment_confirmed'
  | 'booking_reminder'
  | 'listing_published'
  | 'host_verification_update';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  bookingId?: string;
  spaceId?: string;
  reference?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'member' | 'host' | 'admin';
  avatarUrl?: string;
  bio?: string;
  company?: string;
  walletBalance: number;
  savedSpaces: string[];
  notificationsEnabled: boolean;
}

export interface SearchFilterState {
  searchQuery: string;
  city: string;
  neighborhood: string;
  category: SpaceCategory | 'all';
  minPrice: number;
  maxPrice: number;
  date: string;
  timeSlot: string;
  duration: number; // hours
  guests: number;
  needsBackupPower: boolean;
  needsHighSpeedInternet: boolean;
  needsSoundproofing: boolean;
  amenities: string[];
  instantBookingOnly: boolean;
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
}
