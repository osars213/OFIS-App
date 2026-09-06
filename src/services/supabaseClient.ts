import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Space, Booking, Review, UserProfile, HostPayout, AppNotification } from '../types';

// Safely extract client-side Supabase environment variables
const rawSupabaseUrl = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
  ''
).trim();

let cleanedSupabaseUrl = rawSupabaseUrl;
try {
  if (rawSupabaseUrl && rawSupabaseUrl.startsWith('http')) {
    cleanedSupabaseUrl = new URL(rawSupabaseUrl).origin;
  } else if (rawSupabaseUrl) {
    cleanedSupabaseUrl = String(rawSupabaseUrl).replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }
} catch {
  cleanedSupabaseUrl = String(rawSupabaseUrl || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

const supabaseAnonKey = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY)) ||
  ''
).trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(cleanedSupabaseUrl && supabaseAnonKey && cleanedSupabaseUrl.startsWith('http'));
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  if (isSupabaseConfigured()) {
    try {
      supabaseInstance = createClient(cleanedSupabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('[Supabase] Initialization error:', err);
      return null;
    }
  }

  return null;
};

export const supabase = getSupabaseClient();

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  status: 'ready' | 'tables_missing' | 'unconfigured' | 'error';
  url: string | null;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      status: 'unconfigured',
      url: null,
      message: 'Supabase URL and Anon Key are not yet configured in environment variables.',
    };
  }

  try {
    const { data, error } = await client.from('spaces').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          connected: true,
          status: 'tables_missing',
          url: cleanedSupabaseUrl,
          message: 'Supabase connected! However, database tables have not been created yet. Run /supabase/schema.sql in Supabase SQL editor.',
        };
      }
      return {
        connected: false,
        status: 'error',
        url: cleanedSupabaseUrl,
        message: error.message,
      };
    }

    return {
      connected: true,
      status: 'ready',
      url: cleanedSupabaseUrl,
      message: 'Supabase connected and verified!',
    };
  } catch (err: any) {
    return {
      connected: false,
      status: 'error',
      url: cleanedSupabaseUrl,
      message: err.message || 'Failed to connect to Supabase.',
    };
  }
}

// ============================================================================
// DATA MAPPING UTILITIES (Supabase snake_case <-> App camelCase)
// ============================================================================

export function mapDbSpaceToSpace(row: any): Space {
  return {
    id: row.id,
    title: row.title || row.name || 'Workspace',
    tagline: row.tagline || '',
    description: row.description || '',
    category: row.category || 'coworking',
    city: row.city || 'Lagos',
    state: row.state || 'Lagos State',
    neighborhood: row.neighborhood || '',
    address: row.address || '',
    latitude: typeof row.latitude === 'number' ? row.latitude : (row.latitude ? Number(row.latitude) : undefined),
    longitude: typeof row.longitude === 'number' ? row.longitude : (row.longitude ? Number(row.longitude) : undefined),
    pricePerHour: Number(row.price_per_hour || row.pricePerHour || 3500),
    pricePerDay: row.price_per_day ? Number(row.price_per_day) : (row.pricePerDay ? Number(row.pricePerDay) : undefined),
    pricePerMonth: row.price_per_month ? Number(row.price_per_month) : (row.pricePerMonth ? Number(row.pricePerMonth) : undefined),
    pricePerSession: row.price_per_session ? Number(row.price_per_session) : (row.pricePerSession ? Number(row.pricePerSession) : undefined),
    pricingModel: row.pricing_model || row.pricingModel || undefined,
    capacity: Number(row.capacity) || 1,
    hasBackupPower: row.has_backup_power ?? row.hasBackupPower ?? true,
    powerType: row.power_type || row.powerType || 'Solar + Inverter',
    powerUptimeGuaranteePercent: Number(row.power_uptime_guarantee_percent || row.powerUptimeGuaranteePercent || 99),
    internetSpeedMbps: Number(row.internet_speed_mbps || row.internetSpeedMbps || 200),
    internetIsp: row.internet_isp || row.internetIsp || 'Starlink + Fiber',
    noiseLevel: row.noise_level || row.noiseLevel || 'Moderate / Focus Buzz',
    images: Array.isArray(row.images) ? row.images : [],
    featuredImage: row.featured_image || row.featuredImage || (Array.isArray(row.images) && row.images[0]) || '',
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    rating: Number(row.rating) || 4.8,
    reviewsCount: Number(row.reviews_count || row.reviewsCount || 0),
    host: {
      id: row.host_id || 'host-1',
      name: row.host_name || 'Verified Host',
      companyName: row.host_company || 'OFIS Host',
      avatar: row.host_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      isVerified: row.host_is_verified ?? true,
      phone: row.host_phone || '+234 800 000 0000',
      email: row.host_email || 'host@ofis.ng',
      responseRatePercent: 98,
      responseTimeMinutes: 5,
      totalSpaces: 1,
      rating: Number(row.host_rating) || 4.9,
    },
    operatingHours: {
      open: row.open_time || '07:00',
      close: row.close_time || '21:00',
      days: row.days || 'Mon - Sat',
    },
    rules: Array.isArray(row.rules) ? row.rules : ['Keep workspace clean and professional'],
    tags: Array.isArray(row.tags) ? row.tags : ['Verified Power', 'High Speed'],
    instantBooking: row.instant_booking ?? true,
    isVerified: row.is_verified ?? true,
    isSuperhost: row.is_superhost ?? false,
    isActive: row.is_active ?? true,
  };
}

export function mapSpaceToDbSpace(space: Space): Record<string, any> {
  return {
    id: space.id,
    title: space.title,
    tagline: space.tagline,
    description: space.description,
    category: space.category,
    city: space.city,
    state: space.state,
    neighborhood: space.neighborhood,
    address: space.address,
    latitude: space.latitude,
    longitude: space.longitude,
    price_per_hour: space.pricePerHour,
    price_per_day: space.pricePerDay,
    capacity: space.capacity,
    has_backup_power: space.hasBackupPower,
    power_type: space.powerType,
    power_uptime_guarantee_percent: space.powerUptimeGuaranteePercent,
    internet_speed_mbps: space.internetSpeedMbps,
    internet_isp: space.internetIsp,
    noise_level: space.noiseLevel,
    images: space.images,
    featured_image: space.featuredImage,
    amenities: space.amenities,
    rating: space.rating,
    reviews_count: space.reviewsCount,
    host_id: space.host.id,
    host_name: space.host.name,
    host_company: space.host.companyName,
    host_avatar: space.host.avatar,
    host_is_verified: space.host.isVerified,
    host_phone: space.host.phone,
    host_email: space.host.email,
    host_rating: space.host.rating,
    open_time: space.operatingHours?.open || '07:00',
    close_time: space.operatingHours?.close || '21:00',
    days: space.operatingHours?.days || 'Mon - Sat',
    rules: space.rules,
    tags: space.tags,
    instant_booking: space.instantBooking ?? true,
    is_verified: space.isVerified ?? true,
    is_superhost: space.isSuperhost ?? false,
    is_active: space.isActive ?? true,
  };
}

export function mapDbBookingToBooking(row: any): Booking {
  return {
    id: row.id,
    spaceId: row.space_id,
    spaceTitle: row.space_title,
    spaceImage: row.space_image || '',
    spaceAddress: row.space_address || '',
    spaceCity: row.space_city || 'Lagos',
    userId: row.user_id || 'user-1',
    userName: row.user_name || 'Guest User',
    userEmail: row.user_email || 'user@ofis.ng',
    userPhone: row.user_phone || '+234 800 000 0000',
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    durationHours: Number(row.duration_hours) || 2,
    selectedSeatId: row.selected_seat_id,
    selectedSeatLabel: row.selected_seat_label,
    guestCount: Number(row.guest_count) || 1,
    totalAmount: Number(row.total_amount) || 0,
    currency: 'NGN',
    status: row.status || 'confirmed',
    checkedIn: row.checked_in ?? false,
    checkedInAt: row.checked_in_at,
    checkedOut: row.checked_out ?? false,
    checkedOutAt: row.checked_out_at,
    qrCodeValue: row.qr_code_value || `OFIS-PASS-${row.id}`,
    digitalPassCode: row.digital_pass_code || `OFIS-${row.id.slice(-4)}`,
    paymentMethod: row.payment_method || 'paystack',
    paymentReference: row.payment_reference || '',
    createdAt: row.created_at || new Date().toISOString(),
    hasReminder: row.has_reminder ?? true,
    wifiSsid: row.wifi_ssid,
    wifiPassword: row.wifi_password,
    accessDoorCode: row.access_door_code,
    isReviewed: row.is_reviewed ?? false,
    cancellationReason: row.cancellation_reason,
  };
}

export function mapBookingToDbBooking(booking: Booking): Record<string, any> {
  return {
    id: booking.id,
    space_id: booking.spaceId,
    space_title: booking.spaceTitle,
    space_image: booking.spaceImage,
    space_address: booking.spaceAddress,
    space_city: booking.spaceCity,
    user_id: booking.userId,
    user_name: booking.userName,
    user_email: booking.userEmail,
    user_phone: booking.userPhone,
    date: booking.date,
    start_time: booking.startTime,
    end_time: booking.endTime,
    duration_hours: booking.durationHours,
    selected_seat_id: booking.selectedSeatId,
    selected_seat_label: booking.selectedSeatLabel,
    guest_count: booking.guestCount,
    total_amount: booking.totalAmount,
    currency: booking.currency,
    status: booking.status,
    booking_status: booking.status,
    checked_in: booking.checkedIn ?? false,
    checked_in_at: booking.checkedInAt,
    checked_out: booking.checkedOut ?? false,
    checked_out_at: booking.checkedOutAt,
    qr_code_value: booking.qrCodeValue,
    digital_pass_code: booking.digitalPassCode,
    payment_method: booking.paymentMethod,
    payment_reference: booking.paymentReference,
    payment_status: 'paid',
    has_reminder: booking.hasReminder ?? true,
    wifi_ssid: booking.wifiSsid,
    wifi_password: booking.wifiPassword,
    access_door_code: booking.accessDoorCode,
    is_reviewed: booking.isReviewed ?? false,
    cancellation_reason: booking.cancellationReason,
  };
}

export function mapDbReviewToReview(row: any): Review {
  return {
    id: row.id,
    spaceId: row.space_id,
    bookingId: row.booking_id,
    userId: row.user_id || 'user-1',
    userName: row.user_name || 'Coworker',
    userAvatar: row.user_avatar,
    userRole: row.user_role || 'Verified Member',
    rating: Number(row.rating) || 5.0,
    hostRating: row.host_rating ? Number(row.host_rating) : undefined,
    powerRating: Number(row.power_rating) || 5.0,
    internetRating: Number(row.internet_rating) || 5.0,
    noiseRating: Number(row.noise_rating) || 5.0,
    cleanlinessRating: row.cleanliness_rating ? Number(row.cleanliness_rating) : undefined,
    valueRating: row.value_rating ? Number(row.value_rating) : undefined,
    comment: row.comment || '',
    visitDate: row.visit_date,
    helpfulCount: Number(row.helpful_count) || 0,
    verifiedAmenities: Array.isArray(row.verified_amenities) ? row.verified_amenities : [],
    photos: Array.isArray(row.photos) ? row.photos : [],
    createdAt: row.created_at || new Date().toISOString(),
    verifiedBooking: row.verified_booking ?? true,
  };
}

export function mapReviewToDbReview(review: Review): Record<string, any> {
  return {
    id: review.id,
    space_id: review.spaceId,
    booking_id: review.bookingId,
    user_id: review.userId,
    user_name: review.userName,
    user_avatar: review.userAvatar,
    user_role: review.userRole,
    rating: review.rating,
    host_rating: review.hostRating,
    power_rating: review.powerRating,
    internet_rating: review.internetRating,
    noise_rating: review.noiseRating,
    cleanliness_rating: review.cleanlinessRating,
    value_rating: review.valueRating,
    comment: review.comment,
    visit_date: review.visitDate,
    helpful_count: review.helpfulCount || 0,
    verified_amenities: review.verifiedAmenities || [],
    photos: review.photos || [],
    verified_booking: review.verifiedBooking ?? true,
  };
}

export function mapDbProfileToUser(row: any): UserProfile {
  return {
    id: row.id,
    name: row.name || 'OFIS Member',
    email: row.email,
    phone: row.phone || '+234 800 000 0000',
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    role: row.role || 'user',
    isEmailVerified: row.is_email_verified ?? (row.email_confirmed_at ? true : false),
    emailVerifiedAt: row.email_verified_at || row.email_confirmed_at,
    company: row.company || 'Independent Professional',
    bio: row.bio || '',
    walletBalanceNgn: Number(row.wallet_balance_ngn ?? 25000),
    savedSpaceIds: Array.isArray(row.saved_space_ids) ? row.saved_space_ids : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}
