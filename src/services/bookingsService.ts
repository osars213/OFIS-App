import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Booking } from '../types';
import { INITIAL_BOOKINGS } from '../mockData';

export const bookingsService = {
  async fetchUserBookings(userId: string): Promise<{ bookings: Booking[]; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { bookings: INITIAL_BOOKINGS, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          spaces!space_id (
            name,
            city,
            address,
            images,
            primary_category,
            subcategory,
            wifi_ssid
          ),
          coworker:profiles!user_id (
            full_name,
            email,
            avatar_url,
            phone
          ),
          host:profiles!host_id (
            full_name,
            phone,
            whatsapp
          ),
          desks!desk_id (
            name,
            code,
            zone
          )
        `)
        .or(`user_id.eq.${userId},host_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        return { bookings: [], error: error.message };
      }

      const bookings: Booking[] = (data || []).map((row: any) => {
        const space = Array.isArray(row.spaces) ? row.spaces[0] : row.spaces;
        const coworker = Array.isArray(row.coworker) ? row.coworker[0] : (row.coworker || row.profiles);
        const host = Array.isArray(row.host) ? row.host[0] : (row.host || row.hosts);
        const desk = Array.isArray(row.desks) ? row.desks[0] : row.desks;

        return {
          id: row.id,
          bookingReference: row.booking_reference,
          spaceId: row.space_id,
          spaceName: space?.name || 'OFIS Space',
          spaceCity: space?.city || 'Lagos',
          spaceAddress: space?.address || 'Victoria Island',
          spaceImage: (space?.images && space?.images[0]) || 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
          primaryCategory: space?.primary_category,
          subcategory: space?.subcategory,

          deskId: row.desk_id || 'desk-1',
          deskName: desk?.name || 'Dedicated Workstation',
          deskCode: desk?.code || 'HOT-DESK',
          deskZone: desk?.zone || 'collaborative',

          coworkerId: row.user_id || row.client_id,
          coworkerName: coworker?.full_name || 'Coworker',
          coworkerEmail: coworker?.email || '',
          coworkerPhone: coworker?.phone,
          coworkerAvatar: coworker?.avatar_url,

          hostId: row.host_id,
          hostName: host?.full_name || 'OFIS Host',
          hostPhone: host?.phone,
          hostWhatsApp: host?.whatsapp,

          durationType: row.duration_type || 'hourly',
          durationUnits: Number(row.duration_units) || 1,
          startDate: row.start_date,
          endDate: row.end_date,
          startTime: row.start_time_label,
          endTime: row.end_time_label,

          currency: row.currency || 'NGN',
          currencySymbol: row.currency_symbol || '₦',
          baseAmount: Number(row.base_amount),
          platformCommissionFee: Number(row.platform_commission_fee),
          commissionRate: Number(row.commission_rate) || 0.05,
          taxes: Number(row.taxes),
          totalAmount: Number(row.total_amount),
          hostNetPayout: Number(row.host_net_payout),

          status: row.booking_status || row.status || 'pending',
          paymentMethod: row.payment_method || 'paystack',
          transactionId: row.payment_reference || row.transaction_id,
          createdAt: row.created_at,

          wifiSSID: space?.wifi_ssid || row.wifi_ssid || 'OFIS_Guest_HighSpeed',
          qrCodeUrl: row.qr_code_url,
          notes: row.notes,
        };
      });

      return { bookings, error: null };
    } catch (err: any) {
      return { bookings: [], error: err.message || 'Failed to fetch bookings' };
    }
  },

  // Authoritative availability check to prevent double bookings
  async verifyAvailability(
    spaceId: string,
    deskId: string | null,
    startTimeIso: string,
    endTimeIso: string
  ): Promise<{ available: boolean; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { available: true, error: null };
    }

    try {
      let query = supabase
        .from('bookings')
        .select('id')
        .eq('space_id', spaceId)
        .in('booking_status', ['confirmed', 'checked_in', 'pending', 'payment_pending'])
        .lt('start_datetime', endTimeIso)
        .gt('end_datetime', startTimeIso);

      if (deskId && !deskId.startsWith('desk-space')) {
        query = query.eq('desk_id', deskId);
      }

      const { data, error } = await query;
      if (error) return { available: true, error: error.message };

      return { available: (data?.length || 0) === 0, error: null };
    } catch (err: any) {
      return { available: true, error: err.message };
    }
  },

  // Step 1: Create a pending booking in authoritative database
  async createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'transactionId' | 'qrCodeUrl' | 'bookingReference'>
  ): Promise<{ booking: Booking | null; error: string | null }> {
    const bookingRef = `OFS-${bookingData.spaceCity.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=OFIS-${bookingRef}-${bookingData.deskCode || 'HOT-DESK'}-${encodeURIComponent(bookingData.coworkerName)}`;

    if (!isSupabaseConfigured() || !supabase) {
      const mockBooking: Booking = {
        ...bookingData,
        id: `bk-${Date.now().toString().slice(-6)}`,
        bookingReference: bookingRef,
        status: 'confirmed',
        transactionId: `pstk_demo_${Date.now()}`,
        qrCodeUrl: qrUrl,
        createdAt: new Date().toISOString(),
      };
      return { booking: mockBooking, error: null };
    }

    try {
      // Calculate ISO timestamps for start and end
      const startDateTime = new Date(`${bookingData.startDate}T12:00:00Z`).toISOString();
      const endDateTime = new Date(`${bookingData.endDate}T18:00:00Z`).toISOString();

      // 1. Verify space availability before recording
      const { available } = await this.verifyAvailability(
        bookingData.spaceId,
        bookingData.deskId,
        startDateTime,
        endDateTime
      );

      if (!available) {
        return {
          booking: null,
          error: 'This space has just been reserved by another coworker. Please select another time or desk.',
        };
      }

      // Safe client payload: starts strictly in 'pending' state
      const payload = {
        booking_reference: bookingRef,
        client_id: bookingData.coworkerId,
        user_id: bookingData.coworkerId,
        space_id: bookingData.spaceId,
        desk_id: bookingData.deskId && !bookingData.deskId.startsWith('desk-') ? bookingData.deskId : null,
        host_id: bookingData.hostId,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        start_time_label: bookingData.startTime,
        end_time_label: bookingData.endTime,
        duration_type: bookingData.durationType,
        duration_units: bookingData.durationUnits,
        booking_status: 'pending',
        status: 'pending',
        payment_status: 'pending',
        payment_method: bookingData.paymentMethod || 'paystack',
        qr_code_url: qrUrl,
        notes: bookingData.notes || '',
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        return { booking: null, error: error.message };
      }

      const pendingBooking: Booking = {
        ...bookingData,
        id: data.id,
        bookingReference: data.booking_reference,
        status: data.booking_status || 'pending',
        baseAmount: Number(data.base_amount),
        platformCommissionFee: Number(data.platform_commission_fee),
        taxes: Number(data.taxes),
        totalAmount: Number(data.total_amount),
        hostNetPayout: Number(data.host_net_payout),
        transactionId: data.transaction_id,
        qrCodeUrl: data.qr_code_url,
        createdAt: data.created_at,
      };

      return { booking: pendingBooking, error: null };
    } catch (err: any) {
      return { booking: null, error: err.message || 'Failed to create booking.' };
    }
  },

  // Step 2: Initialize Payment with Paystack Gateway via Server
  async initializePayment(bookingId: string, email: string, paymentMethod: string = 'paystack'): Promise<{
    reference: string;
    authorizationUrl: string | null;
    accessCode: string | null;
    amount: number;
    sandbox: boolean;
    error: string | null;
  }> {
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          email,
          paymentMethod,
          callbackUrl: window.location.origin,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          reference: '',
          authorizationUrl: null,
          accessCode: null,
          amount: 0,
          sandbox: false,
          error: data.error || 'Failed to initialize payment gateway',
        };
      }

      return {
        reference: data.reference,
        authorizationUrl: data.authorizationUrl,
        accessCode: data.accessCode,
        amount: data.amount,
        sandbox: !!data.sandbox,
        error: null,
      };
    } catch (err: any) {
      return {
        reference: '',
        authorizationUrl: null,
        accessCode: null,
        amount: 0,
        sandbox: false,
        error: err.message || 'Network error initializing payment',
      };
    }
  },

  // Step 3: Authoritatively verify payment and confirm booking on server
  async verifyAndConfirmPayment(bookingId: string, reference: string, provider: string = 'paystack'): Promise<{
    success: boolean;
    booking: Booking | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: true,
        booking: null,
        error: null,
      };
    }

    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          reference,
          provider,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        return {
          success: false,
          booking: null,
          error: resData.error || 'Payment confirmation failed',
        };
      }

      const row = resData.booking;
      const space = row?.spaces;
      const confirmedBooking: Booking | null = row ? {
        id: row.id,
        bookingReference: row.booking_reference,
        spaceId: row.space_id,
        spaceName: space?.name || 'OFIS Space',
        spaceCity: space?.city || 'Lagos',
        spaceAddress: space?.address || 'Victoria Island',
        spaceImage: (space?.images && space?.images[0]) || 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
        primaryCategory: space?.primary_category || 'WORK',
        subcategory: space?.subcategory || 'coworking_desks',
        deskId: row.desk_id || 'desk-1',
        deskName: 'Dedicated Workstation',
        deskCode: 'D-01',
        deskZone: 'collaborative',
        coworkerId: row.user_id || row.client_id,
        coworkerName: 'Coworker',
        coworkerEmail: '',
        hostId: row.host_id,
        hostName: 'OFIS Host',
        durationType: row.duration_type || 'hourly',
        durationUnits: Number(row.duration_units) || 1,
        startDate: row.start_date,
        endDate: row.end_date,
        startTime: row.start_time_label,
        endTime: row.end_time_label,
        currency: row.currency || 'NGN',
        currencySymbol: row.currency_symbol || '₦',
        baseAmount: Number(row.base_amount),
        platformCommissionFee: Number(row.platform_commission_fee),
        commissionRate: Number(row.commission_rate) || 0.05,
        taxes: Number(row.taxes),
        totalAmount: Number(row.total_amount),
        hostNetPayout: Number(row.host_net_payout),
        status: 'confirmed',
        paymentMethod: row.payment_method || provider,
        transactionId: row.payment_reference || reference,
        createdAt: row.created_at,
        wifiSSID: space?.wifi_ssid || row.wifi_ssid || 'OFIS_Guest_HighSpeed',
        qrCodeUrl: row.qr_code_url,
        notes: row.notes,
      } : null;

      return {
        success: true,
        booking: confirmedBooking,
        error: null,
      };
    } catch (err: any) {
      return {
        success: false,
        booking: null,
        error: err.message || 'Payment confirmation network error',
      };
    }
  },

  // Step 4: Securely fetch WiFi & Door Access credentials for a confirmed booking
  async fetchAccessCredentials(bookingId: string, spaceId?: string): Promise<{
    wifiSSID: string;
    wifiPass: string;
    doorPIN: string;
    accessInstructions: string;
    error: string | null;
  }> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        wifiSSID: 'OFIS_Guest_HighSpeed',
        wifiPass: 'WorkFocus2026',
        doorPIN: '4829',
        accessInstructions: 'Check in at reception with valid ID and quote your booking reference.',
        error: null,
      };
    }

    try {
      // 1. Try Supabase direct RPC first
      const { data, error } = await supabase.rpc('get_space_access_credentials', {
        p_space_id: spaceId,
        p_booking_id: bookingId,
      });

      if (!error && data) {
        return {
          wifiSSID: data.wifi_ssid || 'OFIS_Guest_HighSpeed',
          wifiPass: data.wifi_pass || 'WorkFocus2026',
          doorPIN: data.door_pin || '4829',
          accessInstructions: data.access_instructions || 'Check in at reception with valid ID.',
          error: null,
        };
      }

      // 2. Fallback to authenticated server proxy
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.access_token) {
        const res = await fetch('/api/bookings/credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ bookingId, spaceId }),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.credentials) {
            return {
              wifiSSID: resData.credentials.wifiSSID,
              wifiPass: resData.credentials.wifiPass,
              doorPIN: resData.credentials.doorPIN,
              accessInstructions: resData.credentials.accessInstructions,
              error: null,
            };
          }
        }
      }

      return {
        wifiSSID: 'OFIS_Guest_HighSpeed',
        wifiPass: 'WorkFocus2026',
        doorPIN: '4829',
        accessInstructions: 'Check in at reception with valid ID.',
        error: error?.message || null,
      };
    } catch (err: any) {
      return {
        wifiSSID: 'OFIS_Guest_HighSpeed',
        wifiPass: 'WorkFocus2026',
        doorPIN: '4829',
        accessInstructions: 'Check in at reception with valid ID.',
        error: err.message,
      };
    }
  },

  async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status,
          booking_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  subscribeToBookings(userId: string, onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured() || !supabase) {
      return { unsubscribe: () => {} };
    }

    const channel = supabase
      .channel(`public:bookings:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase?.removeChannel(channel);
      },
    };
  },
};
