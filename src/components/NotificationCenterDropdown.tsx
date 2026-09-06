import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Calendar, 
  QrCode, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Zap, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';

interface NotificationCenterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterDropdown: React.FC<NotificationCenterDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    allSpaces,
    setSelectedSpaceId,
    setCheckoutSpace,
    setCheckoutPrefillSlot,
    setIsCheckoutOpen,
    setActiveDigitalPassBooking,
    setIsDigitalPassOpen,
    bookings,
    currentUser,
    openAvailabilityAlertModal,
    triggerAvailabilityAlertSim,
    availabilityAlerts,
    setIsSettingsOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'availability' | 'bookings' | 'reminders' | 'system'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'availability') return n.type === 'availability';
    if (activeTab === 'bookings') return n.type === 'booking';
    if (activeTab === 'reminders') return n.type === 'reminder';
    if (activeTab === 'system') return n.type === 'system' || n.type === 'payment';
    return true;
  });

  const handleBookFromAlert = (n: AppNotification) => {
    if (!n.spaceId) return;
    const matchedSpace = allSpaces.find((s) => s.id === n.spaceId);
    if (!matchedSpace) return;

    markNotificationRead(n.id);
    onClose();

    // Extract preferred date if available
    let slotDate: string | undefined;
    if (n.preferredDates) {
      const parts = n.preferredDates.split(/→|–|-/);
      if (parts[0]) slotDate = parts[0].trim();
    }

    setCheckoutSpace(matchedSpace);
    if (slotDate) {
      setCheckoutPrefillSlot({ date: slotDate, startTime: '09:00' });
    }
    setIsCheckoutOpen(true);
  };

  const handleViewBookingPass = (bookingId?: string) => {
    if (!bookingId) return;
    const matched = bookings.find((b) => b.id === bookingId);
    if (matched) {
      onClose();
      setActiveDigitalPassBooking(matched);
      setIsDigitalPassOpen(true);
    }
  };

  const handleTriggerSimTest = () => {
    const activeAlert = availabilityAlerts.find((a) => a.status === 'active') || availabilityAlerts[0];
    if (activeAlert) {
      triggerAvailabilityAlertSim(activeAlert.id);
    } else if (allSpaces.length > 0) {
      openAvailabilityAlertModal(allSpaces[0]);
    }
  };

  return (
    <div
      ref={dropdownRef}
      id="header-notification-dropdown"
      className="absolute right-0 top-full mt-3 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-[#141816] rounded-3xl border border-[#232D28] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-[#1E2522] bg-[#18201B]/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#00C878]/15 border border-[#00C878]/30 flex items-center justify-center text-[#00C878]">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F2F2F2]">Notifications</h4>
            <span className="text-[10px] font-mono text-[#718079]">
              {unreadNotificationsCount} unread • SMS & Email Synced
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              id="notif-mark-all-read-btn"
              onClick={markAllNotificationsRead}
              className="p-1.5 rounded-lg text-[#00C878] hover:bg-[#00C878]/10 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              id="notif-clear-all-btn"
              onClick={clearAllNotifications}
              className="p-1.5 rounded-lg text-[#718079] hover:text-red-400 hover:bg-red-500/10 text-[11px] transition-colors cursor-pointer"
              title="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center px-3 pt-2 pb-1 border-b border-[#1E2522] gap-1 overflow-x-auto no-scrollbar bg-[#141816]">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
              : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B]'
          }`}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('availability')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            activeTab === 'availability'
              ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
              : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B]'
          }`}
        >
          <span>🟢 Availability Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
              : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B]'
          }`}
        >
          Passes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'reminders'
              ? 'bg-[#00C878] text-[#0D0D0D] font-bold shadow-sm'
              : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#18201B]'
          }`}
        >
          Reminders
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1E2522] p-2 space-y-1">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#18201B] border border-[#232D28] text-[#718079] flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#9EABA3]">No notifications in this tab</p>
            <p className="text-[11px] text-[#718079]">
              You'll be alerted when workspaces open for your dates or when session passes activate.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isAvailability = n.type === 'availability';
            const isBooking = n.type === 'booking';
            const isReminder = n.type === 'reminder';

            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-2xl transition-all relative ${
                  !n.read
                    ? 'bg-[#18201B] border border-[#00C878]/25 shadow-sm'
                    : 'bg-[#141816] hover:bg-[#18201B]/60 border border-transparent'
                }`}
              >
                {!n.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#00C878]" />
                )}

                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isAvailability
                        ? 'bg-[#00C878]/20 text-[#00C878]'
                        : isBooking
                        ? 'bg-blue-500/20 text-blue-400'
                        : isReminder
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-[#232D28] text-[#9EABA3]'
                    }`}
                  >
                    {isAvailability ? (
                      <Calendar className="w-3.5 h-3.5" />
                    ) : isBooking ? (
                      <QrCode className="w-3.5 h-3.5" />
                    ) : isReminder ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between pr-3">
                      <span className="text-xs font-bold text-[#F2F2F2] leading-tight">
                        {n.title}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#9EABA3] leading-relaxed whitespace-pre-line">
                      {n.message}
                    </p>

                    {/* Meta info & direct CTAs */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[10px]">
                      <span className="font-mono text-[#718079]">{n.timestamp}</span>

                      {/* Availability Alert Direct Book Action */}
                      {isAvailability && n.spaceId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookFromAlert(n);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-extrabold text-[10px] flex items-center space-x-1 shadow cursor-pointer active:scale-95"
                        >
                          <span>Book Dates Now</span>
                          <ChevronRight className="w-3 h-3 stroke-[3]" />
                        </button>
                      )}

                      {/* Booking Pass Action */}
                      {isBooking && n.bookingId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBookingPass(n.bookingId);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#18201B] hover:bg-[#232D28] border border-[#00C878]/30 text-[#00C878] font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>View Pass</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Quick Actions Bar */}
      <div className="p-3 border-t border-[#1E2522] bg-[#18201B]/90 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleTriggerSimTest}
          className="text-[11px] font-semibold text-[#00C878] hover:underline flex items-center space-x-1 cursor-pointer"
          title="Simulate a real-time availability alert"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Test Availability Alert</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            setIsSettingsOpen(true);
          }}
          className="text-[11px] text-[#718079] hover:text-[#F2F2F2] flex items-center space-x-1 cursor-pointer"
        >
          <Settings className="w-3 h-3" />
          <span>Alert Preferences</span>
        </button>
      </div>

    </div>
  );
};
