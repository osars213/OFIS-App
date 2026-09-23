import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  CalendarCheck, 
  MessageSquare, 
  AlertCircle, 
  ShieldCheck, 
  Wallet, 
  Clock,
  Sparkles
} from 'lucide-react';
import { AppNotification } from '../../types';
import { useApp } from '../../context/AppContext';

export const HostNotificationsTab: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'booking' | 'system' | 'payment'>('all');

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">Host Activity Notifications &amp; Alerts</h2>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            Stay updated on new guest bookings, check-in scans, reviews, and payout disbursements
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="px-4 py-2 rounded-2xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-xs font-bold text-[#0F766E] dark:text-[#14B8A6] border border-[#E5E7EB] dark:border-[#374151] flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-2">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'booking', label: 'Bookings & Check-ins' },
          { id: 'payment', label: 'Financials & Payouts' },
          { id: 'system', label: 'System & Security' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === f.id
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-3 shadow-xs">
          <Bell className="w-10 h-10 text-[#9CA3AF] dark:text-[#4B5563] mx-auto" />
          <h3 className="text-base font-bold text-[#111827] dark:text-[#F9FAFB]">No Notifications</h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            You're all caught up! New alerts and guest requests will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 cursor-pointer ${
                  item.read
                    ? 'bg-[#F9FAFB] dark:bg-[#1F2937]/50 border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF]'
                    : 'bg-white dark:bg-[#1F2937] border-[#0F766E]/40 text-[#111827] dark:text-[#F9FAFB] shadow-xs'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'booking'
                    ? 'bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6]'
                    : item.type === 'payment'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-[#F1F5F9] dark:bg-[#374151] text-[#6B7280] dark:text-[#9CA3AF]'
                }`}>
                  {item.type === 'booking' ? (
                    <CalendarCheck className="w-4 h-4" />
                  ) : item.type === 'payment' ? (
                    <Wallet className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB]">{item.title}</h4>
                    <span className="text-[10px] text-[#9CA3AF] dark:text-[#6B7280]">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">{item.message}</p>
                </div>

                {!item.read && (
                  <div className="w-2 h-2 rounded-full bg-[#0F766E] shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
