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
      className="absolute right-0 top-full mt-3 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#07383D] rounded-3xl border border-[#E2ECEB] dark:border-[#166D74] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-[#E2ECEB] dark:border-[#166D74] bg-[#FFF9F4] dark:bg-[#07383D] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFA987]/15 dark:bg-[#FFA987]/20 border border-[#FFA987]/30 flex items-center justify-center text-[#006B70] dark:text-[#FFA987]">
            <Bell className="w-4 h-4 text-[#FFA987]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#12383B] dark:text-white">Notifications</h4>
            <span className="text-[10px] font-mono text-[#5D7A7D] dark:text-[#B8D1D0]">
              {unreadNotificationsCount} unread • SMS &amp; Email Synced
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              id="notif-mark-all-read-btn"
              onClick={markAllNotificationsRead}
              className="p-1.5 rounded-lg text-[#006B70] dark:text-[#28D2CB] hover:bg-[#14BEB8]/15 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
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
              className="p-1.5 rounded-lg text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-[11px] transition-colors cursor-pointer"
              title="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center px-3 pt-2 pb-1 border-b border-[#E2ECEB] dark:border-[#166D74] gap-1 overflow-x-auto no-scrollbar bg-[#FFF9F4] dark:bg-[#07383D]">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#14BEB8] text-white font-bold shadow-xs'
              : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50]'
          }`}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('availability')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            activeTab === 'availability'
              ? 'bg-[#14BEB8] text-white font-bold shadow-xs'
              : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50]'
          }`}
        >
          <span>Availability Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-[#14BEB8] text-white font-bold shadow-xs'
              : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50]'
          }`}
        >
          Passes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'reminders'
              ? 'bg-[#14BEB8] text-white font-bold shadow-xs'
              : 'text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white hover:bg-[#F3F6F5] dark:hover:bg-[#0B4A50]'
          }`}
        >
          Reminders
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E2ECEB] dark:divide-[#166D74] p-2 space-y-1">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5 text-[#FFA987]" />
            </div>
            <p className="text-xs font-semibold text-[#12383B] dark:text-white">No notifications in this tab</p>
            <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0]">
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
                className={`p-3 rounded-2xl transition-all relative cursor-pointer ${
                  !n.read
                    ? 'bg-[#FFF9F4] dark:bg-[#0B4A50] border border-[#14BEB8]/40 shadow-xs'
                    : 'bg-white dark:bg-[#07383D] hover:bg-[#FFF9F4] dark:hover:bg-[#0B4A50]/50 border border-transparent'
                }`}
              >
                {!n.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FFA987]" />
                )}

                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isAvailability
                        ? 'bg-[#FFA987]/20 text-[#006B70] dark:text-[#FFA987]'
                        : isBooking
                        ? 'bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB]'
                        : isReminder
                        ? 'bg-[#FFA987]/20 text-[#C05621] dark:text-[#FFA987]'
                        : 'bg-[#F3F6F5] dark:bg-[#105A60] text-[#5D7A7D] dark:text-[#B8D1D0]'
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
                      <span className="text-xs font-bold text-[#12383B] dark:text-white leading-tight">
                        {n.title}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] leading-relaxed whitespace-pre-line">
                      {n.message}
                    </p>

                    {/* Meta info & direct CTAs */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[10px]">
                      <span className="font-mono text-[#5D7A7D] dark:text-[#B8D1D0]">{n.timestamp}</span>

                      {/* Availability Alert Direct Book Action */}
                      {isAvailability && n.spaceId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookFromAlert(n);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-extrabold text-[10px] flex items-center space-x-1 shadow-xs cursor-pointer active:scale-95"
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
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#14BEB8]/30 text-[#006B70] dark:text-[#28D2CB] font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
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
      <div className="p-3 border-t border-[#E2ECEB] dark:border-[#166D74] bg-[#FFF9F4] dark:bg-[#07383D] flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleTriggerSimTest}
          className="text-[11px] font-semibold text-[#006B70] dark:text-[#28D2CB] hover:underline flex items-center space-x-1 cursor-pointer"
          title="Simulate a real-time availability alert"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFA987]" />
          <span>Test Availability Alert</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            setIsSettingsOpen(true);
          }}
          className="text-[11px] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white flex items-center space-x-1 cursor-pointer"
        >
          <Settings className="w-3 h-3" />
          <span>Alert Preferences</span>
        </button>
      </div>

    </div>
  );
};
