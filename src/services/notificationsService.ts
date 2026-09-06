import { AppNotification } from '../types';
import { storage } from './storageService';

const NOTIFICATIONS_KEY = 'app_notifications';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Booking Confirmed!',
    message: 'Your pass for The Hive Coworking (Desk 01) is ready. Use access code #8921*.',
    type: 'booking',
    timestamp: '10 mins ago',
    read: false,
    bookingId: 'OFIS-BK-8921',
  },
  {
    id: 'notif-2',
    title: 'Power Guarantee Verified',
    message: 'All 7 hubs in Victoria Island & Ikoyi operating at 100% hybrid generator uptime.',
    type: 'system',
    timestamp: '1 hour ago',
    read: true,
  }
];

export const notificationsService = {
  getNotifications: (): AppNotification[] => {
    return storage.get<AppNotification[]>(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
  },

  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { timestamp?: string; read?: boolean }): AppNotification[] => {
    const list = notificationsService.getNotifications();
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: notif.timestamp || 'Just now',
      read: notif.read ?? false,
      ...notif,
    };
    const updated = [newNotif, ...list];
    storage.set(NOTIFICATIONS_KEY, updated);
    return updated;
  },

  removeNotification: (id: string): AppNotification[] => {
    const list = notificationsService.getNotifications();
    const updated = list.filter(n => n.id !== id);
    storage.set(NOTIFICATIONS_KEY, updated);
    return updated;
  },

  removeNotificationByBookingIdAndType: (bookingId: string, type: 'reminder' | 'booking' | 'system' | 'payment' | 'availability'): AppNotification[] => {
    const list = notificationsService.getNotifications();
    const updated = list.filter(n => !(n.bookingId === bookingId && n.type === type));
    storage.set(NOTIFICATIONS_KEY, updated);
    return updated;
  },

  markAsRead: (id: string): AppNotification[] => {
    const list = notificationsService.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) item.read = true;
    storage.set(NOTIFICATIONS_KEY, list);
    return list;
  },

  markAllAsRead: (): AppNotification[] => {
    const list = notificationsService.getNotifications().map(n => ({ ...n, read: true }));
    storage.set(NOTIFICATIONS_KEY, list);
    return list;
  },

  clearAll: (): AppNotification[] => {
    storage.set(NOTIFICATIONS_KEY, []);
    return [];
  }
};
