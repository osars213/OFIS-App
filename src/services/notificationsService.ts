import { AppNotification } from '../types';
import { storageService } from './storageService';

const NOTIFICATIONS_KEY = 'ofis_notifications';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'user_tunde',
    type: 'booking_confirmed',
    title: 'Booking Confirmed • Access Pass Ready',
    message: 'Your desk at The Foundry Executive Desk & Lounge is confirmed. Tap to view your turnstile QR code.',
    timestamp: '10 mins ago',
    read: false,
    bookingId: 'OFIS-BK-78921',
    spaceId: 'space_1',
    reference: 'OFIS-BK-78921',
  },
  {
    id: 'notif_2',
    userId: 'user_tunde',
    type: 'payment_confirmed',
    title: 'Payment Confirmed',
    message: '₦14,000 paid via OFIS Wallet for 4 hours at The Foundry.',
    timestamp: '12 mins ago',
    read: false,
    bookingId: 'OFIS-BK-78921',
    reference: 'PSTK_OFIS_78921',
  },
  {
    id: 'notif_3',
    userId: 'user_tunde',
    type: 'host_verification_update',
    title: 'Solar Power Audit Verified',
    message: 'All workspaces in Victoria Island & Ikoyi have 24/7 continuous solar+inverter monitoring.',
    timestamp: '2 hours ago',
    read: true,
    spaceId: 'space_1',
  },
  {
    id: 'notif_4',
    userId: 'user_chioma',
    type: 'booking_confirmed',
    title: 'New Guest Reservation',
    message: 'Tunde Adebayo booked 4 hours at The Foundry Executive Desk & Lounge.',
    timestamp: '10 mins ago',
    read: false,
    bookingId: 'OFIS-BK-78921',
    spaceId: 'space_1',
  },
  {
    id: 'notif_5',
    userId: 'user_chioma',
    type: 'listing_published',
    title: 'Space Listing Live',
    message: 'The Foundry Executive Desk & Lounge is verified and now receiving instant bookings.',
    timestamp: '1 day ago',
    read: true,
    spaceId: 'space_1',
  }
];

export const notificationsService = {
  getNotifications(userId: string): AppNotification[] {
    const stored = storageService.getItem<AppNotification[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    return stored.filter(n => n.userId === userId || !userId);
  },

  getUnreadCount(userId: string): number {
    const notifs = this.getNotifications(userId);
    return notifs.filter(n => !n.read).length;
  },

  markAsRead(notificationId: string): void {
    const stored = storageService.getItem<AppNotification[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    const updated = stored.map(n => n.id === notificationId ? { ...n, read: true } : n);
    storageService.setItem(NOTIFICATIONS_KEY, updated);
  },

  markAllAsRead(userId: string): void {
    const stored = storageService.getItem<AppNotification[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    const updated = stored.map(n => n.userId === userId ? { ...n, read: true } : n);
    storageService.setItem(NOTIFICATIONS_KEY, updated);
  },

  addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: 'Just now',
      read: false,
    };
    const stored = storageService.getItem<AppNotification[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    storageService.setItem(NOTIFICATIONS_KEY, [newNotif, ...stored]);
    return newNotif;
  }
};
