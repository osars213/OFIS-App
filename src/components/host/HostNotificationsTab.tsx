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
          <h2 className="text-xl font-bold text-[#F2F2F2]">Host Activity Notifications & Alerts</h2>
          <p className="text-xs text-[#718079]">
            Stay updated on new guest bookings, check-in scans, reviews, and payout disbursements
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="px-4 py-2 rounded-2xl bg-[#18201B] hover:bg-[#232D28] text-xs font-bold text-[#00C878] border border-[#232D28] flex items-center space-x-1.5 cursor-pointer transition-colors"
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
                ? 'bg-[#00C878] text-[#0D0D0D]'
                : 'bg-[#141816] text-[#718079] hover:text-[#F2F2F2] border border-[#1E2522]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#141816] border border-[#1E2522] space-y-3">
          <Bell className="w-10 h-10 text-[#232D28] mx-auto" />
          <h3 className="text-base font-bold text-[#F2F2F2]">No Notifications</h3>
          <p className="text-xs text-[#718079]">
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
                    ? 'bg-[#141816] border-[#1E2522] text-[#718079]'
                    : 'bg-[#18201B] border-[#00C878]/30 text-[#F2F2F2] shadow-sm'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'booking'
                    ? 'bg-[#00C878]/15 text-[#00C878]'
                    : item.type === 'payment'
                    ? 'bg-[#E0A82E]/15 text-[#E0A82E]'
                    : 'bg-[#1E2522] text-[#9EABA3]'
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
                    <h4 className="text-xs font-bold text-[#F2F2F2]">{item.title}</h4>
                    <span className="text-[10px] text-[#718079]">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#9EABA3] leading-relaxed">{item.message}</p>
                </div>

                {!item.read && (
                  <div className="w-2 h-2 rounded-full bg-[#00C878] shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
