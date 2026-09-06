import { AppNotification } from '../types';
import { notificationsService } from './notificationsService';

export interface AvailabilityAlert {
  id: string;
  spaceId: string;
  spaceTitle: string;
  spaceImage: string;
  spaceCity?: string;
  spaceNeighborhood?: string;
  userId: string;
  userName: string;
  preferredStartDate: string;
  preferredEndDate?: string;
  timeSlot?: string; // e.g. '09:00', '14:00', 'full_day'
  channels: {
    sms: boolean;
    email: boolean;
    inApp: boolean;
  };
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'triggered' | 'booked' | 'cancelled';
  createdAt: string;
  lastTriggeredAt?: string;
  notes?: string;
}

const STORAGE_KEY = 'ofis_availability_alerts';

const INITIAL_ALERTS: AvailabilityAlert[] = [
  {
    id: 'alert_001',
    spaceId: 'sp_lagos_01',
    spaceTitle: 'Hub One by FCMB — Dedicated Focus Pods',
    spaceImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    spaceCity: 'Lagos',
    spaceNeighborhood: 'Yaba',
    userId: 'user_001',
    userName: 'Chinedu Eze',
    preferredStartDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferredEndDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    timeSlot: '09:00 - 17:00',
    channels: {
      sms: true,
      email: true,
      inApp: true,
    },
    contactEmail: 'chinedu.eze@techpulse.ng',
    contactPhone: '+234 803 456 7890',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Looking for 3-day quiet desk slot for sprint',
  },
];

export const availabilityAlertsService = {
  getAllAlerts(): AvailabilityAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ALERTS));
        return INITIAL_ALERTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ALERTS;
    }
  },

  saveAlerts(alerts: AvailabilityAlert[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch {}
  },

  getUserAlerts(userId: string): AvailabilityAlert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter((a) => a.userId === userId || userId === 'user_001');
  },

  getAlertsForSpace(spaceId: string): AvailabilityAlert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter((a) => a.spaceId === spaceId && a.status === 'active');
  },

  createAlert(alert: Omit<AvailabilityAlert, 'id' | 'createdAt' | 'status'>): AvailabilityAlert {
    const alerts = this.getAllAlerts();
    const newAlert: AvailabilityAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    alerts.unshift(newAlert);
    this.saveAlerts(alerts);

    // Also push a confirmation notification
    const channelsList: string[] = [];
    if (newAlert.channels.sms) channelsList.push('SMS');
    if (newAlert.channels.email) channelsList.push('Email');
    if (newAlert.channels.inApp) channelsList.push('In-App Notification');

    notificationsService.addNotification({
      title: '🔔 Availability Alert Activated',
      message: `You'll be alerted via ${channelsList.join(' & ')} as soon as ${newAlert.spaceTitle} opens for ${newAlert.preferredStartDate}${newAlert.preferredEndDate ? ` to ${newAlert.preferredEndDate}` : ''}.`,
      type: 'availability',
      spaceId: newAlert.spaceId,
      bookingId: undefined,
      preferredDates: `${newAlert.preferredStartDate}${newAlert.preferredEndDate ? ` → ${newAlert.preferredEndDate}` : ''}`,
    });

    return newAlert;
  },

  cancelAlert(alertId: string): boolean {
    const alerts = this.getAllAlerts();
    const index = alerts.findIndex((a) => a.id === alertId);
    if (index !== -1) {
      alerts[index].status = 'cancelled';
      this.saveAlerts(alerts);
      return true;
    }
    return false;
  },

  /**
   * Simulates dispatching availability alerts for a given alert item.
   * Dispatches In-App notification, simulated SMS and Email.
   */
  triggerAlert(alertId: string): { success: boolean; notification?: AppNotification; smsMessage?: string; emailSubject?: string } {
    const alerts = this.getAllAlerts();
    const target = alerts.find((a) => a.id === alertId);
    if (!target) return { success: false };

    target.status = 'triggered';
    target.lastTriggeredAt = new Date().toISOString();
    this.saveAlerts(alerts);

    const dateRangeStr = `${target.preferredStartDate}${target.preferredEndDate ? ` – ${target.preferredEndDate}` : ''}`;
    const smsMessage = `[OFIS ALERT] Great news! "${target.spaceTitle}" is now available for your dates (${dateRangeStr}). Tap to book your pass instantly: https://ofis.ng/s/${target.spaceId}?dates=${target.preferredStartDate}`;
    const emailSubject = `🟢 Dates Available: ${target.spaceTitle} is open for ${dateRangeStr}`;

    const notifications = notificationsService.addNotification({
      title: `🟢 Space Available: ${target.spaceTitle}`,
      message: `Preferred dates ${dateRangeStr} just opened up! Book your instant pass now before desks fill up. Alerts dispatched via ${target.channels.sms ? 'SMS (' + target.contactPhone + ')' : ''} ${target.channels.email ? '& Email (' + target.contactEmail + ')' : ''}.`,
      type: 'availability',
      spaceId: target.spaceId,
      preferredDates: dateRangeStr,
    });

    return {
      success: true,
      notification: notifications[0],
      smsMessage,
      emailSubject,
    };
  },
};
