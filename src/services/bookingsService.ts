import { Booking } from '../types';
import { storageService } from './storageService';
import { notificationsService } from './notificationsService';

const BOOKINGS_KEY = 'user_bookings';

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'OFIS-BK-78921',
    spaceId: 'space_1',
    spaceTitle: 'The Foundry Executive Desk & Lounge',
    spaceImage: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&auto=format&fit=crop&q=80',
    spaceAddress: '14 Karimu Kotun St, Victoria Island, Lagos',
    spaceCity: 'Lagos',
    userId: 'user_tunde',
    userName: 'Tunde Adebayo',
    userEmail: 'tunde@ofis.ng',
    userPhone: '+234 803 456 7890',
    bookingType: 'hourly',
    startDate: 'Tomorrow',
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    durationHours: 4,
    selectedSeats: ['Desk 01 (Window View)'],
    guestsCount: 1,
    subtotal: 14000,
    serviceFee: 0,
    totalPrice: 14000,
    currency: 'NGN',
    paymentStatus: 'paid',
    paymentReference: 'PSTK_OFIS_78921',
    paymentMethod: 'wallet',
    bookingStatus: 'confirmed',
    passCode: 'OFIS-8492',
    qrCodeValue: 'OFIS:VI:PASS:78921:TUNDE:2026',
    wifiSsid: 'Foundry-Executive-5G',
    wifiPassword: 'solar-power-never-sleeps',
    accessInstructions: 'Scan QR at turnstile barrier. Take elevator to 3rd floor reception.',
    createdAt: 'Today, 2:15 PM'
  },
  {
    id: 'OFIS-BK-91204',
    spaceId: 'space_3',
    spaceTitle: 'Acoustic Sound & Podcast Suite',
    spaceImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
    spaceAddress: '5 Admiralty Way, Lekki Phase 1, Lagos',
    spaceCity: 'Lagos',
    userId: 'user_tunde',
    userName: 'Tunde Adebayo',
    userEmail: 'tunde@ofis.ng',
    userPhone: '+234 803 456 7890',
    bookingType: 'hourly',
    startDate: 'Today',
    startTime: '1:00 PM',
    endTime: '4:00 PM',
    durationHours: 3,
    selectedSeats: ['Studio Console Desk A'],
    guestsCount: 2,
    subtotal: 18000,
    serviceFee: 0,
    totalPrice: 18000,
    currency: 'NGN',
    paymentStatus: 'paid',
    paymentReference: 'PSTK_OFIS_91204',
    paymentMethod: 'card',
    bookingStatus: 'active',
    passCode: 'OFIS-3319',
    qrCodeValue: 'OFIS:PODCAST:PASS:91204:TUNDE',
    wifiSsid: 'Lekki-Studio-Sound-Pro',
    wifiPassword: 'zero-noise-guaranteed',
    accessInstructions: 'Direct studio access at Ground Floor Door B. Studio tech is on standby.',
    createdAt: 'Today, 11:30 AM'
  },
  {
    id: 'OFIS-BK-45182',
    spaceId: 'space_2',
    spaceTitle: 'The Hive Innovation Hub & Boardroom',
    spaceImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    spaceAddress: '22 Glover Road, Ikoyi, Lagos',
    spaceCity: 'Lagos',
    userId: 'user_tunde',
    userName: 'Tunde Adebayo',
    userEmail: 'tunde@ofis.ng',
    userPhone: '+234 803 456 7890',
    bookingType: 'hourly',
    startDate: 'Yesterday',
    startTime: '2:00 PM',
    endTime: '5:00 PM',
    durationHours: 3,
    selectedSeats: ['Boardroom Suite B'],
    guestsCount: 6,
    subtotal: 21000,
    serviceFee: 0,
    totalPrice: 21000,
    currency: 'NGN',
    paymentStatus: 'paid',
    paymentReference: 'PSTK_OFIS_45182',
    paymentMethod: 'wallet',
    bookingStatus: 'completed',
    passCode: 'OFIS-1904',
    qrCodeValue: 'OFIS:HIVE:PASS:45182:COMPLETED',
    wifiSsid: 'Hive-Ikoyi-Fiber-HighSpeed',
    wifiPassword: 'grow-with-solar',
    accessInstructions: 'Completed stay. Security access expired.',
    createdAt: 'Yesterday, 1:45 PM'
  },
  {
    id: 'OFIS-BK-33910',
    spaceId: 'space_4',
    spaceTitle: 'Ventures Park Maitama Cowork',
    spaceImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    spaceAddress: '12 Nile Street, Maitama, Abuja',
    spaceCity: 'Abuja',
    userId: 'user_tunde',
    userName: 'Tunde Adebayo',
    userEmail: 'tunde@ofis.ng',
    userPhone: '+234 803 456 7890',
    bookingType: 'hourly',
    startDate: 'Last Week',
    startTime: '9:00 AM',
    endTime: '1:00 PM',
    durationHours: 4,
    selectedSeats: ['Hot Desk 12'],
    guestsCount: 1,
    subtotal: 12000,
    serviceFee: 0,
    totalPrice: 12000,
    currency: 'NGN',
    paymentStatus: 'refunded',
    paymentReference: 'PSTK_OFIS_33910_REF',
    paymentMethod: 'wallet',
    bookingStatus: 'cancelled',
    passCode: 'OFIS-0000',
    qrCodeValue: 'OFIS:CANCELLED:33910',
    accessInstructions: 'Booking was cancelled and refunded to wallet.',
    createdAt: 'Last week, 8:00 AM'
  }
];

export const bookingsService = {
  getAllBookings(): Booking[] {
    return storageService.getItem<Booking[]>(BOOKINGS_KEY, INITIAL_BOOKINGS);
  },

  getUserBookings(userId: string): Booking[] {
    const all = this.getAllBookings();
    return all.filter(b => b.userId === userId || !userId);
  },

  getHostBookings(hostSpaceIds: string[]): Booking[] {
    const all = this.getAllBookings();
    return all.filter(b => hostSpaceIds.includes(b.spaceId));
  },

  getBookingById(bookingId: string): Booking | undefined {
    const all = this.getAllBookings();
    return all.find(b => b.id === bookingId);
  },

  /**
   * Conflict Detection:
   * Checks whether the selected space is already booked during the requested date and time slot.
   */
  checkBookingAvailability(
    spaceId: string, 
    startDate: string, 
    startTime?: string,
    durationHours?: number
  ): { available: boolean; conflictMessage?: string } {
    const all = this.getAllBookings();
    
    // Check if there's any conflicting confirmed/active booking on the exact space, date, and time
    const conflict = all.find(b => 
      b.spaceId === spaceId &&
      (b.bookingStatus === 'confirmed' || b.bookingStatus === 'active') &&
      b.startDate.toLowerCase() === startDate.toLowerCase() &&
      startTime && b.startTime &&
      b.startTime.toLowerCase() === startTime.toLowerCase()
    );

    if (conflict) {
      return {
        available: false,
        conflictMessage: 'This space is no longer available for your selected time. Please choose another time.'
      };
    }

    return { available: true };
  },

  createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'passCode' | 'qrCodeValue'>): Booking {
    const id = `OFIS-BK-${Math.floor(10000 + Math.random() * 90000)}`;
    const passCode = `OFIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCodeValue = `OFIS:PASS:${id}:${passCode}`;
    
    const newBooking: Booking = {
      ...booking,
      id,
      passCode,
      qrCodeValue,
      subtotal: booking.subtotal || booking.totalPrice,
      serviceFee: booking.serviceFee || 0,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
      wifiSsid: 'OFIS-HighSpeed-Mesh',
      wifiPassword: 'connect-to-grow',
      accessInstructions: 'Show your QR digital pass at entrance turnstiles or security barrier.'
    };

    const existing = this.getAllBookings();
    storageService.setItem(BOOKINGS_KEY, [newBooking, ...existing]);

    // Dispatch notification
    notificationsService.addNotification({
      userId: newBooking.userId,
      type: 'booking_confirmed',
      title: 'Booking Confirmed • Access Pass Ready',
      message: `Your booking for ${newBooking.spaceTitle} is confirmed. Pass code: ${newBooking.passCode}`,
      bookingId: newBooking.id,
      spaceId: newBooking.spaceId,
      reference: newBooking.id
    });

    notificationsService.addNotification({
      userId: newBooking.userId,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `₦${newBooking.totalPrice.toLocaleString()} paid via ${newBooking.paymentMethod || 'wallet'} for ${newBooking.spaceTitle}.`,
      bookingId: newBooking.id,
      reference: newBooking.paymentReference || newBooking.id
    });

    return newBooking;
  },

  cancelBooking(bookingId: string): void {
    const existing = this.getAllBookings();
    let cancelledBooking: Booking | null = null;

    const updated = existing.map(b => {
      if (b.id === bookingId) {
        cancelledBooking = b;
        return { 
          ...b, 
          bookingStatus: 'cancelled' as const,
          paymentStatus: 'refunded' as const
        };
      }
      return b;
    });

    storageService.setItem(BOOKINGS_KEY, updated);

    if (cancelledBooking) {
      notificationsService.addNotification({
        userId: (cancelledBooking as Booking).userId,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking for ${(cancelledBooking as Booking).spaceTitle} has been cancelled. Funds returned to your wallet.`,
        bookingId,
        spaceId: (cancelledBooking as Booking).spaceId,
      });
    }
  },

  completeBooking(bookingId: string): void {
    const existing = this.getAllBookings();
    const updated = existing.map(b => {
      if (b.id === bookingId) {
        return { 
          ...b, 
          bookingStatus: 'completed' as const
        };
      }
      return b;
    });
    storageService.setItem(BOOKINGS_KEY, updated);
  }
};
