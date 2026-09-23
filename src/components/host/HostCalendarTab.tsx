import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Info,
  ShieldAlert,
  Sparkles,
  Users
} from 'lucide-react';
import { Space, Booking } from '../../types';
import { useApp } from '../../context/AppContext';

interface HostCalendarTabProps {
  hostSpaces: Space[];
  selectedSpace?: Space | null;
}

export const HostCalendarTab: React.FC<HostCalendarTabProps> = ({
  hostSpaces,
  selectedSpace: initialSelectedSpace,
}) => {
  const { bookings, toggleBlockSpaceDate } = useApp();

  const [activeSpaceId, setActiveSpaceId] = useState<string>(
    initialSelectedSpace?.id || hostSpaces[0]?.id || 'space-vi-hive'
  );
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2025, 2, 1)); // March 2025

  const currentSpace = hostSpaces.find(s => s.id === activeSpaceId) || hostSpaces[0];

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const blockedDates = currentSpace?.blockedDates || [];

  // Bookings for this space
  const spaceBookings = bookings.filter(b => b.spaceId === currentSpace?.id && b.status !== 'cancelled');

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const handleToggleBlock = (day: number) => {
    if (!currentSpace) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    toggleBlockSpaceDate(currentSpace.id, dateStr);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Space Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">Hub Availability & Maintenance Calendar</h2>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            Click any calendar day to block or unblock for private corporate buyouts or maintenance
          </p>
        </div>

        {/* Space Selector Dropdown */}
        {hostSpaces.length > 1 && (
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            <select
              value={activeSpaceId}
              onChange={(e) => setActiveSpaceId(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] text-xs font-bold text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:border-[#0F766E] cursor-pointer"
            >
              {hostSpaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Calendar Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] space-y-6 shadow-xs">
        
        {/* Month Navigation & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#374151] pb-4">
          <div className="flex items-center space-x-3">
            <div className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">
              {monthNames[month]} {year}
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#374151] hover:bg-[#E5E7EB] dark:hover:bg-[#4B5563] text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#374151] hover:bg-[#E5E7EB] dark:hover:bg-[#4B5563] text-[#111827] dark:text-[#F9FAFB] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Legend */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-md bg-[#0F766E]" />
              <span className="text-[#6B7280] dark:text-[#9CA3AF]">Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-md bg-amber-500" />
              <span className="text-[#6B7280] dark:text-[#9CA3AF]">Booked Desks</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-md bg-red-500" />
              <span className="text-[#6B7280] dark:text-[#9CA3AF]">Blocked (Private)</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div key={i} className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] pb-2">
              {d}
            </div>
          ))}

          {/* Blank padding days */}
          {blankDays.map((_, i) => (
            <div key={`blank-${i}`} className="h-20 rounded-2xl bg-[#F8FAFC]/50 dark:bg-[#111827]/40 border border-transparent" />
          ))}

          {/* Month Days */}
          {daysArray.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isBlocked = blockedDates.includes(dateStr);
            const isToday = day === 1 && month === 2 && year === 2025; // 2025-03-01
            
            // Check bookings for this day
            const dayBookings = spaceBookings.filter(b => {
              if (isToday && ((b.date || '').toLowerCase() === 'today' || b.date === '2025-03-01')) return true;
              return b.date === dateStr;
            });

            return (
              <div
                key={day}
                onClick={() => handleToggleBlock(day)}
                className={`h-20 rounded-2xl border p-2 flex flex-col justify-between text-left transition-all cursor-pointer group relative overflow-hidden ${
                  isBlocked
                    ? 'bg-red-500/10 border-red-500/40 hover:border-red-500'
                    : dayBookings.length > 0
                    ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500'
                    : 'bg-[#F8FAFC] dark:bg-[#111827] border-[#E5E7EB] dark:border-[#374151] hover:border-[#0F766E]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    isToday 
                      ? 'w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center' 
                      : 'text-[#111827] dark:text-[#F9FAFB]'
                  }`}>
                    {day}
                  </span>

                  {isBlocked ? (
                    <Lock className="w-3.5 h-3.5 text-red-500" />
                  ) : dayBookings.length > 0 ? (
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                <div className="text-[10px] truncate">
                  {isBlocked ? (
                    <span className="text-red-600 dark:text-red-400 font-semibold">Blocked</span>
                  ) : dayBookings.length > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">{dayBookings.length} Booked</span>
                  ) : (
                    <span className="text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#0F766E] dark:group-hover:text-[#14B8A6] transition-colors">Open</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] flex items-start space-x-3 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <Info className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[#111827] dark:text-[#F9FAFB]">Host Pro-Tip:</strong> Blocked dates immediately hide this workspace from customer search and quick-booking flows, preventing scheduling conflicts during private events.
          </p>
        </div>

      </div>

    </div>
  );
};
