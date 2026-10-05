import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { bookingsService } from '../../services/bookingsService';
import { getSupabaseClient } from '../../services/supabaseClient';

interface WorkspaceAvailabilityCalendarProps {
  space: Space;
  formatPrice: (amountNgn?: number | null) => string;
  formatTime: (timeStr?: string | null) => string;
  onSelectSlot: (slot: { date: string; startTime: string; durationHours: number }) => void;
}

interface ActiveBookingInterval {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  selectedSeatId: string | null;
  guestCount: number;
  status: string;
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

  // Authoritative real booking intervals for this space
  const [activeBookings, setActiveBookings] = useState<ActiveBookingInterval[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);

  // Month query string: YYYY-MM
  const currentMonthStr = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentMonthDate]);

  // Refetch availability from authoritative API / service
  const fetchAvailability = useCallback(async () => {
    setIsLoadingAvailability(true);
    try {
      const data = await bookingsService.getSpaceAvailability(space.id, { month: currentMonthStr });
      setActiveBookings(data);
    } catch (e) {
      console.warn('[WorkspaceAvailabilityCalendar] Availability fetch error:', e);
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [space.id, currentMonthStr]);

  // Initial and on month change fetch
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Realtime subscription scoped to space bookings via Supabase
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const channel = client
        .channel(`public:bookings:${space.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `space_id=eq.${space.id}` },
          () => {
            fetchAvailability();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[WorkspaceAvailabilityCalendar] Supabase realtime notice:', err);
    }
  }, [space.id, fetchAvailability]);

  // Exclusivity evaluation
  const isExclusive = useMemo(() => {
    return (
      space.category === 'private_office' ||
      space.category === 'meeting' ||
      space.category === 'podcast' ||
      space.category === 'photography' ||
      space.category === 'event' ||
      (space.capacity || 1) === 1
    );
  }, [space.category, space.capacity]);

  // Operating hours parsing
  const operatingSlots = useMemo(() => {
    const openHour = parseInt((space.operatingHours?.open || '08:00').split(':')[0], 10) || 8;
    const closeHour = parseInt((space.operatingHours?.close || '20:00').split(':')[0], 10) || 20;
    
    const slots: string[] = [];
    for (let h = openHour; h < closeHour; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    return slots;
  }, [space.operatingHours]);

  // Helper to parse time string HH:MM to minutes
  const parseMin = (t: string) => {
    const parts = (t || '00:00').split(':');
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  };

  // Real availability calculation for each day in the month
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
    const maxCapacity = space.capacity || 20;

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
        // Query genuine bookings on this date
        const dayBookings = activeBookings.filter(b => b.date === dateStr);

        if (dayBookings.length > 0) {
          // Check capacity / booked hour coverage
          let occupiedSlotCount = 0;

          operatingSlots.forEach(slotTime => {
            const slotStartMin = parseMin(slotTime);
            const slotEndMin = slotStartMin + 60; // 1-hour grain

            let slotOccupancy = 0;
            let slotFull = false;

            for (const b of dayBookings) {
              const bStartMin = parseMin(b.startTime);
              const bEndMin = bStartMin + (b.durationHours || 2) * 60;

              // Overlap: slotStart < bEnd AND bStart < slotEnd
              if (slotStartMin < bEndMin && bStartMin < slotEndMin) {
                if (isExclusive) {
                  slotFull = true;
                  break;
                } else {
                  slotOccupancy += b.guestCount || 1;
                }
              }
            }

            if (slotFull || (!isExclusive && slotOccupancy >= maxCapacity)) {
              occupiedSlotCount++;
            }
          });

          if (occupiedSlotCount >= operatingSlots.length && operatingSlots.length > 0) {
            status = 'blocked';
          } else if (occupiedSlotCount > 0) {
            status = 'limited';
          }
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
  }, [currentMonthDate, space.blockedDates, space.capacity, activeBookings, isExclusive, operatingSlots, today]);

  // Hourly slot status check for selectedDateStr and durationHours
  const evaluatedTimeSlots = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0];
    const nowMin = today.getHours() * 60 + today.getMinutes();
    const isSelectedToday = selectedDateStr === todayStr;
    const maxCapacity = space.capacity || 20;

    const dayBookings = activeBookings.filter(b => b.date === selectedDateStr);

    return operatingSlots.map(time => {
      const slotStartMin = parseMin(time);
      const slotEndMin = slotStartMin + (durationHours * 60);

      // Block past slots if viewing today
      const isPastSlot = isSelectedToday && slotStartMin < nowMin;

      // Check real booking conflicts
      let isBookedConflict = false;
      let overlappingGuests = 0;

      for (const b of dayBookings) {
        const bStartMin = parseMin(b.startTime);
        const bEndMin = bStartMin + (b.durationHours || 2) * 60;

        // Overlap: start_A < end_B AND start_B < end_A
        if (slotStartMin < bEndMin && bStartMin < slotEndMin) {
          if (isExclusive) {
            isBookedConflict = true;
            break;
          } else {
            overlappingGuests += b.guestCount || 1;
          }
        }
      }

      if (!isExclusive && overlappingGuests >= maxCapacity) {
        isBookedConflict = true;
      }

      return {
        time,
        isAvailable: !isPastSlot && !isBookedConflict,
        isPast: isPastSlot,
        isBooked: isBookedConflict,
      };
    });
  }, [operatingSlots, selectedDateStr, durationHours, activeBookings, isExclusive, space.capacity, today]);

  // Month navigation
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

  // Selected slot availability validation
  const isSelectedSlotAvailable = useMemo(() => {
    const slot = evaluatedTimeSlots.find(s => s.time === selectedTime);
    return slot ? slot.isAvailable : false;
  }, [evaluatedTimeSlots, selectedTime]);

  const handleConfirm = () => {
    if (!isSelectedSlotAvailable) return;
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
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">Real-Time Availability Calendar</h3>
            {isLoadingAvailability && (
              <span className="inline-block w-2 h-2 rounded-full bg-[#14B8A6] animate-ping" title="Syncing real-time availability" />
            )}
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
            Authoritative schedule driven by verified database bookings
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
              <label className="text-xs font-bold text-[#111827] dark:text-[#F9FAFB] flex items-center justify-between mb-2">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#14B8A6]" />
                  <span>Choose Arrival Time</span>
                </span>
                {!isSelectedSlotAvailable && (
                  <span className="text-[10px] text-red-500 font-semibold">Unavailable</span>
                )}
              </label>
              
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {evaluatedTimeSlots.map(({ time, isAvailable, isPast, isBooked }) => (
                  <button
                    key={time}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedTime === time
                        ? isAvailable
                          ? 'bg-[#0F766E] text-white shadow-md'
                          : 'bg-red-600 text-white shadow-md'
                        : isAvailable
                        ? 'bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F9FAFB] border border-[#E5E7EB] dark:border-[#374151]'
                        : 'bg-gray-100/60 dark:bg-[#111827]/60 text-gray-400 dark:text-[#475569] border border-transparent cursor-not-allowed line-through'
                    }`}
                    title={isBooked ? 'Slot already booked' : isPast ? 'Past slot' : undefined}
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
            disabled={!isSelectedSlotAvailable}
            onClick={handleConfirm}
            className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2 ${
              isSelectedSlotAvailable
                ? 'bg-[#0F766E] hover:bg-[#14B8A6] text-white cursor-pointer'
                : 'bg-gray-300 dark:bg-[#374151] text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>
              {isSelectedSlotAvailable
                ? `Book Selected Slot (${selectedDateStr})`
                : 'Selected Time Unavailable'}
            </span>
          </button>

        </div>

      </div>

    </div>
  );
};
