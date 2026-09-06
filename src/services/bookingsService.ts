import { Booking, BookingLifecycleStatus, BookingExtensionRecord, HostMessage } from '../types';
import { storage } from './storageService';
import { getSupabaseClient, isSupabaseConfigured, mapDbBookingToBooking, mapBookingToDbBooking } from './supabaseClient';

const BOOKINGS_KEY = 'user_bookings';
const OFFLINE_PASSES_KEY = 'ofis_offline_passes_cache';
const HOST_MESSAGES_KEY = 'ofis_host_messages';

export function calculateEndTime(startTime: string, durationHours: number): string {
  if (!startTime) return '17:00';
  const parts = startTime.split(':');
  const h = parseInt(parts[0], 10) || 9;
  const m = parseInt(parts[1], 10) || 0;
  const totalMinutes = h * 60 + m + Math.round(durationHours * 60);
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'OFIS-BK-8921',
    spaceId: 'space-vi-hive',
    spaceTitle: 'The Hive Coworking & Tech Hub',
    spaceImage: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80',
    spaceAddress: '14B Karimu Kotun Street, Victoria Island, Lagos',
    spaceCity: 'Lagos',
    userId: 'user-001',
    userName: 'Babatunde Adeyemi',
    userEmail: 'tunde.adeyemi@paystack.com',
    userPhone: '+234 802 345 6789',
    date: 'Today',
    startTime: '09:00',
    endTime: '13:00',
    durationHours: 4,
    selectedSeatId: 'desk-01',
    selectedSeatLabel: 'Desk 01 (Window View)',
    guestCount: 1,
    totalAmount: 14000,
    currency: 'NGN',
    status: 'checked_in',
    checkedIn: true,
    checkedInAt: '2025-03-01T09:05:00Z',
    qrCodeValue: 'OFIS-PASS-8921-TUNDE-HIVE',
    digitalPassCode: 'OFIS-8921-OK',
    paymentMethod: 'paystack',
    paymentReference: 'pstk_ref_992817462',
    createdAt: '2025-02-28T10:00:00Z',
    wifiSsid: 'Hive-VI-Guest-WiFi',
    wifiPassword: 'hiveworkpass2025',
    accessDoorCode: '#8921*',
    offlineCached: true,
    hostApprovalStatus: 'approved',
  },
  {
    id: 'OFIS-BK-9104',
    spaceId: 'space-vi-hive',
    spaceTitle: 'The Hive Coworking & Tech Hub',
    spaceImage: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&auto=format&fit=crop&q=80',
    spaceAddress: '14B Karimu Kotun Street, Victoria Island, Lagos',
    spaceCity: 'Lagos',
    userId: 'user-002',
    userName: 'Amina Bello',
    userEmail: 'amina.bello@flutterwave.com',
    userPhone: '+234 803 112 3344',
    date: 'Today',
    startTime: '14:00',
    endTime: '18:00',
    durationHours: 4,
    selectedSeatId: 'desk-04',
    selectedSeatLabel: 'Desk 04 (Quiet Zone)',
    guestCount: 1,
    totalAmount: 14000,
    currency: 'NGN',
    status: 'ready_for_checkin',
    qrCodeValue: 'OFIS-PASS-9104-AMINA',
    digitalPassCode: 'OFIS-9104-AM',
    paymentMethod: 'flutterwave',
    paymentReference: 'flw_ref_88291039',
    createdAt: '2025-03-01T07:30:00Z',
    wifiSsid: 'Hive-VI-Guest-WiFi',
    wifiPassword: 'hiveworkpass2025',
    accessDoorCode: '#9104*',
    offlineCached: true,
    hostApprovalStatus: 'approved',
  },
  {
    id: 'OFIS-BK-9240',
    spaceId: 'space-ikoyi-brass',
    spaceTitle: 'Brass & Granite Executive Suites',
    spaceImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    spaceAddress: '5 Glover Road, Ikoyi, Lagos',
    spaceCity: 'Lagos',
    userId: 'user-003',
    userName: 'Chinedu Okonkwo',
    userEmail: 'chinedu.o@moniepoint.com',
    userPhone: '+234 809 778 8990',
    date: 'Tomorrow',
    startTime: '10:00',
    endTime: '16:00',
    durationHours: 6,
    selectedSeatId: 'room-exec-02',
    selectedSeatLabel: 'Executive Boardroom (6-Pax)',
    guestCount: 4,
    totalAmount: 48000,
    currency: 'NGN',
    status: 'confirmed',
    qrCodeValue: 'OFIS-PASS-9240-CHINEDU',
    digitalPassCode: 'OFIS-9240-CO',
    paymentMethod: 'wallet',
    paymentReference: 'wlt_ref_1092837',
    createdAt: '2025-03-01T08:15:00Z',
    wifiSsid: 'Brass-Ikoyi-VIP-Fiber',
    wifiPassword: 'brassvipfibre2025',
    accessDoorCode: '#9240*',
    offlineCached: true,
    hostApprovalStatus: 'approved',
  },
];

export const bookingsService = {
  getBookings: (): Booking[] => {
    // If Supabase is configured, do not show fictional mock bookings
    const defaultBookings = isSupabaseConfigured() ? [] : INITIAL_BOOKINGS;
    return storage.get<Booking[]>(BOOKINGS_KEY, defaultBookings);
  },

  fetchBookingsAsync: async (userId?: string): Promise<{ bookings: Booking[]; source: 'supabase' | 'cache' }> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from('bookings').select('*').order('created_at', { ascending: false });
        if (userId && !userId.startsWith('guest')) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (!error && data) {
          if (data.length > 0) {
            const mapped: Booking[] = data.map(mapDbBookingToBooking);
            storage.set(BOOKINGS_KEY, mapped);
            return { bookings: mapped, source: 'supabase' };
          } else {
            // Live Supabase query returned 0 bookings for this user.
            // Do NOT inject mock bookings into production view.
            storage.set(BOOKINGS_KEY, []);
            return { bookings: [], source: 'supabase' };
          }
        }
      } catch (err) {
        console.warn('[bookingsService] Error fetching bookings from Supabase:', err);
      }
    }

    const fallbackBookings = isSupabaseConfigured() ? [] : INITIAL_BOOKINGS;
    const cached = storage.get<Booking[]>(BOOKINGS_KEY, fallbackBookings);
    return { bookings: cached, source: 'cache' };
  },

  getBookingById: (id: string): Booking | undefined => {
    const bookings = bookingsService.getBookings();
    return bookings.find(b => b.id === id);
  },

  createBooking: (data: Omit<Booking, 'id' | 'qrCodeValue' | 'digitalPassCode' | 'createdAt'>): Booking => {
    const bookings = bookingsService.getBookings();
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `OFIS-BK-${uniqueSuffix}`;

    const safeName = String(data.userName || 'Guest').trim();
    const cleanName = safeName.replace(/\s+/g, '').toUpperCase() || 'GUEST';
    const initials = safeName.slice(0, 2).toUpperCase() || 'GU';

    const newBooking: Booking = {
      ...data,
      id: bookingId,
      endTime: data.endTime || calculateEndTime(data.startTime, data.durationHours),
      status: 'confirmed',
      qrCodeValue: `OFIS-PASS-${uniqueSuffix}-${cleanName}`,
      digitalPassCode: `OFIS-${uniqueSuffix}-${initials}`,
      createdAt: new Date().toISOString(),
      offlineCached: true,
      wifiSsid: data.wifiSsid || 'OFIS_Guest_HighSpeed',
      wifiPassword: data.wifiPassword || 'ofisconnect2025',
      accessDoorCode: data.accessDoorCode || `#${uniqueSuffix}*`,
    };

    bookings.unshift(newBooking);
    storage.set(BOOKINGS_KEY, bookings);

    // Sync to Supabase in background
    const client = getSupabaseClient();
    if (client) {
      const dbPayload = mapBookingToDbBooking(newBooking);
      client.from('bookings').insert(dbPayload).then(({ error }) => {
        if (error) console.warn('[bookingsService] Note inserting booking into Supabase:', error.message);
      });
    }

    return newBooking;
  },

  cancelBooking: (bookingId: string): void => {
    const bookings = bookingsService.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      bookings[index].status = 'cancelled';
      storage.set(BOOKINGS_KEY, bookings);

      const client = getSupabaseClient();
      if (client) {
        client.from('bookings').update({ status: 'cancelled', booking_status: 'cancelled' }).eq('id', bookingId).then(({ error }) => {
          if (error) console.warn('[bookingsService] Note updating booking cancellation in Supabase:', error.message);
        });
      }
    }
  },

  approveBooking: (bookingId: string): { success: boolean; message: string; booking?: Booking } => {
    const bookings = bookingsService.getBookings();
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return { success: false, message: 'Booking not found' };

    target.status = 'confirmed';
    target.hostApprovalStatus = 'approved';
    storage.set(BOOKINGS_KEY, bookings);

    const client = getSupabaseClient();
    if (client) {
      client.from('bookings').update({ status: 'confirmed', booking_status: 'confirmed' }).eq('id', bookingId);
    }

    return { success: true, message: 'Booking approved', booking: target };
  },

  cancelBookingWithReason: (bookingId: string, reason: string): { success: boolean; message: string; booking?: Booking } => {
    const bookings = bookingsService.getBookings();
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return { success: false, message: 'Booking not found' };

    target.status = 'cancelled';
    target.cancellationReason = reason;
    storage.set(BOOKINGS_KEY, bookings);

    const client = getSupabaseClient();
    if (client) {
      client.from('bookings').update({ status: 'cancelled', booking_status: 'cancelled', cancellation_reason: reason }).eq('id', bookingId);
    }

    return { success: true, message: 'Booking cancelled', booking: target };
  },

  checkInBooking: (bookingIdOrCode: string): { success: boolean; message: string; booking?: Booking } => {
    const bookings = bookingsService.getBookings();
    const cleanSearch = bookingIdOrCode.trim().toUpperCase();

    const target = bookings.find(
      b =>
        b.id.toUpperCase() === cleanSearch ||
        b.digitalPassCode.toUpperCase() === cleanSearch ||
        b.qrCodeValue.toUpperCase() === cleanSearch ||
        cleanSearch.includes(b.id.toUpperCase()) ||
        cleanSearch.includes(b.digitalPassCode.toUpperCase())
    );

    if (!target) {
      return { success: false, message: `Pass or Booking code "${bookingIdOrCode}" not found.` };
    }

    target.checkedIn = true;
    target.checkedInAt = new Date().toISOString();
    target.status = 'checked_in';
    storage.set(BOOKINGS_KEY, bookings);

    const client = getSupabaseClient();
    if (client) {
      client.from('bookings').update({ checked_in: true, checked_in_at: target.checkedInAt, status: 'checked_in' }).eq('id', target.id);
    }

    return { success: true, message: `Checked in successfully for ${target.spaceTitle}`, booking: target };
  },

  requestEarlyAccess: (bookingId: string): { success: boolean; message: string; booking?: Booking } => {
    const bookings = bookingsService.getBookings();
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return { success: false, message: 'Booking not found' };

    target.earlyAccessRequested = true;
    target.earlyAccessGranted = true;
    storage.set(BOOKINGS_KEY, bookings);

    return { success: true, message: 'Early access granted', booking: target };
  },

  extendBooking: (
    bookingId: string,
    options: { additionalHours?: number; additionalDays?: number } | number,
    unitRate: number,
    paymentMethod: 'paystack' | 'flutterwave' | 'wallet' | 'card' = 'wallet'
  ): { success: boolean; message: string; booking?: Booking } => {
    const bookings = bookingsService.getBookings();
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return { success: false, message: 'Booking not found' };

    let addHours = 0;
    let addDays = 0;

    if (typeof options === 'number') {
      addHours = options;
    } else {
      addHours = options.additionalHours || 0;
      addDays = options.additionalDays || 0;
    }

    let extensionCost = 0;
    let message = '';

    if (addDays > 0) {
      extensionCost = Math.round(unitRate * addDays);
      target.extendedDays = (target.extendedDays || 0) + addDays;
      target.extendedDaysCount = (target.extendedDaysCount || 1) + addDays;
      target.totalAmount += extensionCost;

      // Compute new end date
      const baseDate = target.endDate ? new Date(target.endDate) : new Date(target.date);
      baseDate.setDate(baseDate.getDate() + addDays);
      target.endDate = baseDate.toISOString().split('T')[0];
      target.isMultiDayPass = true;

      message = `Pass extended by +${addDays} day(s) until ${target.endDate}`;
    } else {
      extensionCost = Math.round(unitRate * addHours);
      target.durationHours += addHours;
      target.extendedHours = (target.extendedHours || 0) + addHours;
      target.totalAmount += extensionCost;
      target.endTime = calculateEndTime(target.startTime, target.durationHours);

      message = `Session extended by +${addHours} hour(s) until ${target.endTime}`;
    }

    const extensionRecord: BookingExtensionRecord = {
      id: `ext-${Date.now()}`,
      durationHours: addHours,
      extendedDays: addDays > 0 ? addDays : undefined,
      costNgn: extensionCost,
      timestamp: new Date().toISOString(),
      paymentMethod,
    };
    target.extensionHistory = [...(target.extensionHistory || []), extensionRecord];

    storage.set(BOOKINGS_KEY, bookings);

    const client = getSupabaseClient();
    if (client) {
      client.from('bookings').update({
        duration_hours: target.durationHours,
        total_amount: target.totalAmount,
        end_time: target.endTime,
      }).eq('id', target.id);
    }

    return { success: true, message, booking: target };
  },

  checkOutBooking: (bookingId: string): { success: boolean; message: string; booking?: Booking } => {
    const bookings = bookingsService.getBookings();
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return { success: false, message: 'Booking not found' };

    target.checkedOut = true;
    target.checkedOutAt = new Date().toISOString();
    target.status = 'completed';
    storage.set(BOOKINGS_KEY, bookings);

    const client = getSupabaseClient();
    if (client) {
      client.from('bookings').update({
        checked_out: true,
        checked_out_at: target.checkedOutAt,
        status: 'completed',
      }).eq('id', target.id);
    }

    return { success: true, message: `Checked out from ${target.spaceTitle}`, booking: target };
  },

  markReviewed: (bookingId: string): void => {
    const bookings = bookingsService.getBookings();
    const target = bookings.find(b => b.id === bookingId);
    if (target) {
      target.isReviewed = true;
      target.status = 'reviewed';
      storage.set(BOOKINGS_KEY, bookings);

      const client = getSupabaseClient();
      if (client) {
        client.from('bookings').update({ is_reviewed: true, status: 'reviewed' }).eq('id', bookingId);
      }
    }
  },

  updateBookingReminder: (bookingId: string, hasReminder: boolean): void => {
    const bookings = bookingsService.getBookings();
    const target = bookings.find(b => b.id === bookingId);
    if (target) {
      target.hasReminder = hasReminder;
      storage.set(BOOKINGS_KEY, bookings);

      const client = getSupabaseClient();
      if (client) {
        client.from('bookings').update({ has_reminder: hasReminder }).eq('id', bookingId);
      }
    }
  },

  getHostMessages: (): HostMessage[] => {
    return storage.get<HostMessage[]>(HOST_MESSAGES_KEY, [
      {
        id: 'msg-1',
        senderId: 'host-1',
        senderName: 'Funke Akindele (The Hive Host)',
        senderRole: 'host',
        content: 'Welcome! High-speed WiFi credentials and turnstile passcode are available on your Digital Pass.',
        timestamp: '10 mins ago',
      },
    ]);
  },

  sendHostMessage: (msg: Omit<HostMessage, 'id' | 'timestamp'>): HostMessage => {
    const current = bookingsService.getHostMessages();
    const created: HostMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: 'Just now',
      isRead: true,
    };
    const updated = [created, ...current];
    storage.set(HOST_MESSAGES_KEY, updated);
    return created;
  },
};
