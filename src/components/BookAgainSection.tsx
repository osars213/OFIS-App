import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { recommendationsService } from '../services/recommendationsService';
import { RotateCw, Calendar, Clock, ChevronRight, Zap, MapPin } from 'lucide-react';

export const BookAgainSection: React.FC = () => {
  const {
    allSpaces,
    bookings,
    setSelectedSpaceId,
    setCurrentView,
    setCheckoutSpace,
    setIsCheckoutOpen,
    formatPrice,
    formatTime,
  } = useApp();

  const bookedItems = useMemo(() => {
    return recommendationsService.getRecentlyBookedSpaces(allSpaces, bookings);
  }, [allSpaces, bookings]);

  // Hide if no previous bookings exist
  if (!bookedItems || bookedItems.length === 0) {
    return null;
  }

  const handleBookAgain = (space: any, lastBooking: any) => {
    // 1-tap fast rebooking
    setCheckoutSpace(space);
    setIsCheckoutOpen(true);
  };

  return (
    <section id="book-again-section" className="space-y-3.5 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[#F2F2F2] font-mono text-[11px] font-bold tracking-wider uppercase">
            <RotateCw className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Book Again</span>
          </div>
          <p className="text-xs text-[#718079] mt-0.5">
            Quickly re-reserve your favorite workspaces with 1-tap
          </p>
        </div>
      </div>

      {/* Grid of Previously Booked Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookedItems.slice(0, 3).map(({ space, booking }) => {
          const formattedStartTime = formatTime(booking.startTime);

          return (
            <div
              key={`book-again-${space.id}-${booking.id}`}
              className="bg-[#141816] rounded-2xl border border-[#1E2522] hover:border-[#00C878]/50 p-4 transition-all duration-200 flex flex-col justify-between space-y-3 shadow-md group"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="w-16 h-16 rounded-xl overflow-hidden bg-[#1C231F] shrink-0 cursor-pointer relative"
                  onClick={() => {
                    setSelectedSpaceId(space.id);
                    setCurrentView('details');
                  }}
                >
                  <img
                    src={space.featuredImage}
                    alt={space.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  {space.hasBackupPower && (
                    <div className="absolute top-1 left-1 p-0.5 rounded bg-[#0D0D0D]/90 text-[#00C878]">
                      <Zap className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    onClick={() => {
                      setSelectedSpaceId(space.id);
                      setCurrentView('details');
                    }}
                    className="text-sm font-bold text-[#F2F2F2] group-hover:text-[#00C878] truncate cursor-pointer transition-colors"
                  >
                    {space.title}
                  </h4>

                  <div className="flex items-center space-x-1 text-xs text-[#718079] mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-[#00C878] shrink-0" />
                    <span>{space.neighborhood}, {space.city}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-[#9EABA3] font-mono mt-1.5 bg-[#0D0D0D]/60 px-2 py-0.5 rounded-lg border border-[#232D28] w-fit">
                    <span className="text-[#00C878] font-bold">{booking.date}</span>
                    <span>•</span>
                    <span>{formattedStartTime} ({booking.durationHours}h)</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="pt-2.5 border-t border-[#1E2522] flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-[#00C878]">
                  {formatPrice(space.pricePerHour)}<span className="text-[10px] text-[#718079] font-normal">/hr</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpaceId(space.id);
                      setCurrentView('details');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] border border-[#232D28] transition-colors"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBookAgain(space, booking)}
                    className="px-3 py-1.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-xs font-bold text-[#0D0D0D] transition-all flex items-center space-x-1 active:scale-95 shadow-sm"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Book Again</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
