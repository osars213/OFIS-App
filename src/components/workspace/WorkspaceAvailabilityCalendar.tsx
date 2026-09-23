import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Space } from '../../types';
import { calculateBookingPrice } from '../../utils/pricing';

interface WorkspaceAvailabilityCalendarProps {
  space: Space;
  formatPrice: (amountNgn?: number | null) => string;
  formatTime: (timeStr?: string | null) => string;
  onSelectSlot: (slot: { date: string; startTime: string; durationHours: number }) => void;
}

export const WorkspaceAvailabilityCalendar: React.FC<WorkspaceAvailabilityCalendarProps> = ({
  space,
  formatPrice,
  formatTime,
  onSelectSlot,
}) => {
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [durationHours, setDurationHours] = useState<number>(2);

  // Generate calendar days for the current displayed month
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
      status: 'available' | 'limited' | 'blocked';
    }> = [];

    // Blank cells before month start
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dateStr: `prev-${i}`,
        dayNumber: 0,
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
        status: 'blocked',
      });
    }

    const todayStr = today.toISOString().split('T')[0];
    const blockedDates = space.blockedDates || [];

    for (let d = 1; d <= daysInMonth; d++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;

      let status: 'available' | 'limited' | 'blocked' = 'available';
      if (isPast || blockedDates.includes(dateStr)) {
        status = 'blocked';
      } else {
        // Deterministic variation for demo realism
        const hash = (d * 7 + month * 13) % 10;
        if (hash === 2 || hash === 6) {
          status = 'limited';
        }
      }

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isPast,
        isToday,
        status,
      });
    }

    return days;
  }, [currentMonthDate, space.blockedDates]);

  // Available hourly time slots for the workspace's operating hours
  const timeSlots = useMemo(() => {
    const openHour = parseInt(space.operatingHours.open.split(':')[0], 10) || 8;
    const closeHour = parseInt(space.operatingHours.close.split(':')[0], 10) || 20;
    
    const slots: string[] = [];
    for (let h = openHour; h < closeHour; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    return slots;
  }, [space.operatingHours]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const safeMonthDate = currentMonthDate instanceof Date && !isNaN(currentMonthDate.getTime()) ? currentMonthDate : new Date();
  const monthName = safeMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calculate pricing
  const isWeekend = useMemo(() => {
    if (!selectedDateStr) return false;
    const day = new Date(selectedDateStr).getDay();
    return day === 0 || day === 6;
  }, [selectedDateStr]);

  const bookingPricing = useMemo(() => {
    return calculateBookingPrice(space, {
      durationHours: durationHours,
      quantity: durationHours,
      guests: 1,
      isWeekend: isWeekend,
      selectedPeriod: durationHours === 8 && space.pricePerDay ? 'day' : undefined,
    });
  }, [space, durationHours, isWeekend]);

  const estimatedCost = bookingPricing.totalAmount;

  const handleConfirm = () => {
    onSelectSlot({
      date: selectedDateStr,
      startTime: selectedTime,
      durationHours,
    });
  };

  return (
    <div className="space-y-4 p-6 rounded-3xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] shadow-2xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">Real-Time Availability Calendar</h3>
          <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
            Select your preferred work date & hourly arrival slot
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
            <span>Open</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F4A261]" />
            <span>Limited</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-[#374151]" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Calendar Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB] font-mono">{monthName}</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-[#6B7280] dark:text-[#94A3B8] pb-1">
            <span>SU</span>
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span>SA</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((d, idx) => {
              if (!d.isCurrentMonth) {
                return <div key={`empty-${idx}`} className="h-10 rounded-xl bg-transparent" />;
              }

              const isSelected = selectedDateStr === d.dateStr;
              const isBlocked = d.status === 'blocked';

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  disabled={isBlocked}
                  onClick={() => setSelectedDateStr(d.dateStr)}
                  className={`h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-mono font-bold cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F766E] text-white shadow-lg ring-2 ring-[#14B8A6]/40 scale-105 z-10'
                      : isBlocked
                      ? 'bg-gray-100/60 dark:bg-[#111827]/60 text-gray-400 dark:text-[#475569] cursor-not-allowed'
                      : 'bg-[#F8FAFC] dark:bg-[#111827] text-[#111827] dark:text-[#F9FAFB] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] hover:border-[#0F766E]/50 border border-[#E5E7EB] dark:border-[#374151]'
                  }`}
                >
                  <span>{d.dayNumber}</span>
                  
                  {/* Status Indicator Dot */}
                  {!isSelected && !isBlocked && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        d.status === 'limited' ? 'bg-[#F4A261]' : 'bg-[#14B8A6]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot & Duration Configuration (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center space-x-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Choose Arrival Time</span>
              </label>
              
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedTime === time
                        ? 'bg-[#0F766E] text-white shadow-md'
                        : 'bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151]'
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] mb-2 block">
                Session Duration
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 8].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDurationHours(hrs)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      durationHours === hrs
                        ? 'bg-[#0F766E] text-white shadow-md'
                        : 'bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151]'
                    }`}
                  >
                    {hrs === 8 ? 'Full Day' : `${hrs} hrs`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Preview */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8]">Estimated Amount</div>
                <div className="text-sm font-bold text-[#14B8A6] font-mono">
                  {formatPrice(estimatedCost)}
                </div>
              </div>
              <div className="text-right text-[10px] text-[#6B7280] dark:text-[#94A3B8]">
                {selectedDateStr} • {formatTime(selectedTime)}
              </div>
            </div>
          </div>

          {/* Book Slot CTA */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#14B8A6] text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Book Selected Slot ({selectedDateStr})</span>
          </button>

        </div>

      </div>

    </div>
  );
};
