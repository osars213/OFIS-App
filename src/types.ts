export type SpaceCategory = 
  | 'coworking'
  | 'meeting-room'
  | 'private-office'
  | 'training-room'
  | 'event-space'
  | 'studio'
  | 'other'
  // Backward compatibility aliases
  | 'private_office'
  | 'meeting'
  | 'podcast'
  | 'photography'
  | 'event';

export type CityLocation = 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Ibadan' | 'All Cities';

export type PricingTier = 'hourly' | 'daily' | 'monthly';

export type PricingBasis = 'person' | 'space' | 'session';
export type PricingPeriod = 'hour' | 'day' | 'month' | 'session';

export interface PricingModel {
  basis: PricingBasis;
  period: PricingPeriod;
  rate: number;
  currency?: 'NGN';
  minimumQuantity?: number;
  sessionDurationHours?: number;
  description?: string;
}

export interface BookingPriceBreakdown {
  baseRate: number;
  basis: PricingBasis;
  period: PricingPeriod;
  quantity: number;
  guests: number;
  guestMultiplierApplied: boolean;
  subtotal: number;
  discountAmount: number;
  discount?: number;
  totalAmount: number;
  rateDescription: string;
  summaryLabel: string;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'power' | 'connectivity' | 'audio_visual' | 'comfort' | 'hospitality' | 'security';
  iconName: string;
}

export interface Review {
  id: string;
  spaceId: string;
  bookingId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  rating: number;
  hostRating?: number;
  powerRating: number;
  internetRating: number;
  noiseRating: number;
  cleanlinessRating?: number;
  valueRating?: number;
  comment: string;
  visitDate?: string;
  helpfulCount?: number;
  isHelpfulByUser?: boolean;
  verifiedAmenities?: string[];
  photos?: string[];
  createdAt: string;
  verifiedBooking: boolean;
}

export interface FloorPlanSeat {
  id: string;
  label: string;
  type: 'hot_desk' | 'dedicated_desk' | 'private_office' | 'meeting_room' | 'booth';
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
  pricePerHour: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface HostProfile {
  id: string;
  name: string;
  companyName: string;
  avatar: string;
  isVerified: boolean;
  phone: string;
  email: string;
  responseRatePercent: number;
  responseTimeMinutes: number;
  totalSpaces: number;
  rating: number;
  yearsHosting?: number;
  bio?: string;
  superhost?: boolean;
  identityVerified?: boolean;
  languages?: string[];
}

export type LiveAvailabilityStatus = 
  | 'available_now' 
  | 'available_today' 
  | 'fully_booked_today' 
  | 'opens_tomorrow';

export type OccupancyLevel = 'low' | 'busy' | 'almost_full';

export interface NextAvailableSlot {
  label: string; // e.g. "Today • 14:00", "Tomorrow • 09:00", "Tuesday • 08:30"
  date: string; // "Today" | "Tomorrow" | "2025-03-03"
  time: string; // "14:00" | "09:00" | "08:30"
}

export interface PricingRules {
  baseHourly?: number;
  baseDaily?: number;
  weekendMultiplier?: number; // e.g. 1.15
  weekendMarkupPercent?: number; // e.g. 15%
  holidayMultiplier?: number; // e.g. 1.25
  holidayMarkupPercent?: number; // e.g. 25%
  dailyDiscountPercent?: number; // e.g. 10%
  promoDiscountPercent?: number; // e.g. 10%
  promotionalDiscountPercent?: number; // e.g. 10%
  promoCode?: string;
  customWeekendHourly?: number;
  customWeekendDaily?: number;
}

export interface HostMessage {
  id: string;
  bookingId?: string;
  spaceId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'host' | 'guest';
  content: string;
  timestamp: string;
  isRead?: boolean;
}

export type SpaceVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface SpaceVerificationAudit {
  photosChecked: boolean;
  powerChecked: boolean;
  internetChecked: boolean;
  locationChecked: boolean;
  pricingChecked: boolean;
  notes?: string;
  reviewedBy?: string;
  auditScore?: number;
  verifiedAt?: string;
}

export interface Space {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: SpaceCategory;
  city: string;
  state: string;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth?: number;
  pricePerSession?: number;
  pricingBasis?: PricingBasis;
  pricingPeriod?: PricingPeriod;
  pricingModel?: PricingModel;
  capacity: number;
  hasBackupPower: boolean;
  powerType: 'Solar + Inverter' | 'Heavy Duty Gen + Solar Hybrid' | 'Dual Diesel Generators' | 'Grid + Inverter Auto-Switch';
  powerUptimeGuaranteePercent: number;
  internetSpeedMbps: number;
  internetIsp: string;
  noiseLevel: 'Silent / Library' | 'Moderate / Focus Buzz' | 'Soundproofed Studio' | 'Collaborative';
  images: string[];
  featuredImage: string;
  amenities: string[];
  rating: number;
  reviewsCount: number;
  host: HostProfile;
  operatingHours: {
    open: string;
    close: string;
    days: string;
  };
  rules: string[];
  tags: string[];
  instantBooking?: boolean;
  isVerified?: boolean;
  verificationStatus?: SpaceVerificationStatus;
  verificationAudit?: SpaceVerificationAudit;
  submittedAt?: string;
  reviewedAt?: string;
  adminReviewNotes?: string;
  isSuperhost?: boolean;
  isActive?: boolean;
  floorPlanSeats?: FloorPlanSeat[];
  availabilityStatus?: LiveAvailabilityStatus;
  nextAvailableSlot?: NextAvailableSlot;
  occupancyLevel?: OccupancyLevel;
  freeCancellation?: boolean;
  cancellationPolicy?: string;
  blockedDates?: string[];
  pricingRules?: PricingRules;
}

export type BookingLifecycleStatus = 
  | 'reserved'
  | 'confirmed'
  | 'ready_for_checkin'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'reviewed'
  | 'cancelled'
  | 'active'; // backward compatible alias for checked_in

export interface BookingExtensionRecord {
  id: string;
  durationHours: number;
  extendedDays?: number;
  costNgn: number;
  timestamp: string;
  paymentMethod: string;
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
  userPhone: string;
  date: string;
  endDate?: string;
  isMultiDayPass?: boolean;
  extendedDaysCount?: number;
  startTime: string;
  endTime?: string;
  durationHours: number;
  selectedSeatId?: string;
  selectedSeatLabel?: string;
  guestCount: number;
  totalAmount: number;
  currency: 'NGN' | 'USD' | string;
  status: BookingLifecycleStatus;
  pricingModel?: PricingModel | any;
  pricingBasis?: PricingBasis;
  pricingPeriod?: PricingPeriod;
  priceBreakdown?: BookingPriceBreakdown;
  bookedQuantity?: number;
  unitRate?: number;
  checkedIn?: boolean;
  checkedInAt?: string;
  checkedOut?: boolean;
  checkedOutAt?: string;
  earlyAccessRequested?: boolean;
  earlyAccessGranted?: boolean;
  extendedHours?: number;
  extendedDays?: number;
  extensionHistory?: BookingExtensionRecord[];
  isReviewed?: boolean;
  qrCodeValue: string;
  digitalPassCode: string;
  paymentMethod: 'sznd' | 'paystack' | 'flutterwave' | 'wallet' | 'card';
  paymentReference: string;
  createdAt: string;
  hasReminder?: boolean;
  wifiSsid?: string;
  wifiPassword?: string;
  accessDoorCode?: string;
  offlineCached?: boolean;
  hostApprovalStatus?: 'approved' | 'pending' | 'rejected';
  requiresHostApproval?: boolean;
  cancellationReason?: string;
  hostNotes?: string;
}

export interface HostPayout {
  id: string;
  hostId: string;
  amountNgn: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'completed' | 'processing' | 'pending';
  reference: string;
  createdAt: string;
}

export interface DiagnosticItem {
  id: string;
  component: string;
  category: 'currency' | 'navigation' | 'host_ops' | 'telemetry' | 'storage' | 'bookings';
  status: 'healthy' | 'warning' | 'error';
  title: string;
  detail: string;
  latencyMs?: number;
}

export interface UserNotificationPreferences {
  smsAlerts: boolean;
  emailAlerts: boolean;
  availabilityAlerts: boolean;
  bookingReminders: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'user' | 'host' | 'admin';
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
  company?: string;
  bio?: string;
  walletBalanceNgn: number;
  savedSpaceIds: string[];
  notificationPreferences?: UserNotificationPreferences;
  preferredCurrency?: string;
  createdAt: string;
}

export interface SearchFilters {
  searchQuery: string;
  city: string;
  neighborhood: string;
  category: SpaceCategory | 'all';
  minPrice: number;
  maxPrice: number;
  minCapacity: number; // 0 (any) or 1..250+
  date: string;
  timeSlot: string;
  startHour: string; // 'any', '08:00', '09:00', '10:00', '14:00', etc.
  duration: number; // hours (1..12) or days/months depending on mode
  guests: number;
  pricingPeriod?: PricingPeriod | 'all';
  pricingBasis?: PricingBasis | 'all';
  needsBackupPower: boolean;
  needsHighSpeedInternet: boolean;
  needsFixedInternet: boolean;
  needsWiredInternet: boolean;
  needsSoundproofing: boolean;
  needsWhiteboard?: boolean;
  needsProjector?: boolean;
  needsCameraEquipment?: boolean;
  amenities: string[];
  categoryAmenities?: string[];
  instantBookingOnly: boolean;
  availableNowOnly?: boolean;
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'distance';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'reminder' | 'payment' | 'availability';
  timestamp: string;
  read: boolean;
  bookingId?: string;
  spaceId?: string;
  preferredDates?: string;
  channelsSent?: ('sms' | 'email' | 'in_app')[];
}

export interface SavedComparison {
  id: string;
  title: string;
  spaceIds: string[];
  createdAt: string;
  spacesCount: number;
  highlightSummary?: string;
}

export interface WorkspaceComparisonDifference {
  spaceId: string;
  spaceTitle: string;
  category: 'pricing' | 'internet' | 'power' | 'amenities' | 'availability' | 'capacity' | 'location';
  highlightText: string;
  isAdvantage: boolean;
}

export type AppTheme = 'light' | 'dark' | 'system';

