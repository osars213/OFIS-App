import React, { useState } from 'react';
import { 
  Ticket, 
  MapPin, 
  QrCode, 
  Clock, 
  Calendar, 
  Navigation, 
  PhoneCall, 
  MessageSquarePlus, 
  AlertTriangle,
  Compass,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';
import { reviewsService } from '../services/reviewsService';

export const UserBookingsView: React.FC = () => {
  const { 
    userBookings, 
    setActivePassBooking, 
    setSelectedBookingDetails,
    cancelBooking, 
    setCurrentView,
    setContactHostData,
    setDirectionsData,
    setWriteReviewModalData,
    currentUser,
    formatPrice,
  } = useApp();

  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'active' | 'completed' | 'cancelled' | 'all'>('all');

  const upcomingBookings = userBookings.filter(b => b.bookingStatus === 'confirmed');
  const activeBookings = userBookings.filter(b => b.bookingStatus === 'active');
  const completedBookings = userBookings.filter(b => b.bookingStatus === 'completed');
  const cancelledBookings = userBookings.filter(b => b.bookingStatus === 'cancelled');

  const getFilteredBookings = () => {
    switch (selectedTab) {
      case 'upcoming':
        return upcomingBookings;
      case 'active':
        return activeBookings;
      case 'completed':
        return completedBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return userBookings;
    }
  };

  const filteredList = getFilteredBookings();

  const getStatusBadge = (status: Booking['bookingStatus']) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#00C878]/15 text-[#00C878] border border-[#00C878]/30">Upcoming</span>;
      case 'active':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#00C878] text-[#0D0D0D] animate-pulse">Active Now</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#232D28] text-[#9EABA3]">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Cancelled</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00C878]/15 text-[#00C878] font-bold uppercase">
                Client Workspace Hub
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#F2F2F2] mt-1">My Space Passes & Bookings</h1>
            <p className="text-xs text-[#9EABA3]">
              Access your instant turnstile QR passes, reservations, and verified receipts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('explore')}
            className="px-4 py-2 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Book New Space</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none border-b border-[#1E2522]">
          {[
            { id: 'all', label: 'All Bookings', count: userBookings.length },
            { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
            { id: 'active', label: 'Active', count: activeBookings.length },
            { id: 'completed', label: 'Completed', count: completedBookings.length },
            { id: 'cancelled', label: 'Cancelled', count: cancelledBookings.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                selectedTab === tab.id
                  ? 'bg-[#17201B] text-[#00C878] border border-[#00C878]/40 shadow-sm'
                  : 'text-[#9EABA3] hover:text-[#F2F2F2] hover:bg-[#141816]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedTab === tab.id ? 'bg-[#00C878] text-[#0D0D0D]' : 'bg-[#232D28] text-[#718079]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredList.length > 0 ? (
          <div className="space-y-4">
            {filteredList.map((booking) => {
              const isConfirmed = booking.bookingStatus === 'confirmed';
              const isActive = booking.bookingStatus === 'active';
              const isCompleted = booking.bookingStatus === 'completed';
              const isCancelled = booking.bookingStatus === 'cancelled';
              const canReview = isCompleted && reviewsService.canUserReviewSpace(currentUser.id, booking.spaceId, userBookings).canReview;

              return (
                <div
                  key={booking.id}
                  className="bg-[#141816] rounded-2xl border border-[#1E2522] hover:border-[#2A3630] transition-colors p-4 sm:p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <img
                      src={booking.spaceImage}
                      alt={booking.spaceTitle}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                    />

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(booking.bookingStatus)}
                        <span className="text-xs font-mono text-[#718079]">{booking.id}</span>
                        <span className="text-[11px] text-[#00C878] font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Solar Verified</span>
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-[#F2F2F2] truncate">
                        {booking.spaceTitle}
                      </h3>

                      <p className="text-xs text-[#9EABA3] flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                        <span className="truncate">{booking.spaceAddress}</span>
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[#718079] pt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#00C878]" />
                          <span className="text-[#F2F2F2] font-medium">{booking.startDate}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#00C878]" />
                          <span>{booking.startTime || 'Standard Access'} • {booking.durationHours} hrs</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Contextual Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-[#1E2522] gap-3 shrink-0">
                    
                    {/* Price and Payment Status */}
                    <div className="text-left lg:text-right">
                      <div className="text-base font-extrabold text-[#00C878] font-mono">
                        {formatPrice(booking.totalPrice)}
                      </div>
                      <div className="text-[10px] text-[#718079] capitalize">
                        {booking.paymentStatus === 'paid' ? 'Paid via OFIS Gateway' : `${booking.paymentStatus} status`}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                      
                      {/* View Booking Details (Universal) */}
                      <button
                        type="button"
                        onClick={() => setSelectedBookingDetails(booking)}
                        className="px-3 py-1.5 rounded-lg bg-[#161D19] hover:bg-[#1C2420] border border-[#232D28] text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      {/* Digital Pass (for Upcoming & Active) */}
                      {(isConfirmed || isActive) && (
                        <button
                          type="button"
                          onClick={() => setActivePassBooking(booking)}
                          className="px-3 py-1.5 rounded-lg bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Digital Pass</span>
                        </button>
                      )}

                      {/* Directions */}
                      <button
                        type="button"
                        onClick={() => setDirectionsData({
                          address: booking.spaceAddress,
                          city: booking.spaceCity,
                          title: booking.spaceTitle
                        })}
                        className="p-1.5 rounded-lg bg-[#161D19] border border-[#232D28] text-[#9EABA3] hover:text-[#00C878] transition-colors"
                        title="Get directions"
                        aria-label="Get directions"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>

                      {/* Contact Host */}
                      <button
                        type="button"
                        onClick={() => setContactHostData({
                          hostName: 'Space Concierge',
                          spaceTitle: booking.spaceTitle,
                          phone: '+234 803 456 7890',
                          email: 'concierge@ofis.ng'
                        })}
                        className="p-1.5 rounded-lg bg-[#161D19] border border-[#232D28] text-[#9EABA3] hover:text-[#00C878] transition-colors"
                        title="Contact Host"
                        aria-label="Contact Host"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>

                      {/* Leave Review (Completed) */}
                      {isCompleted && canReview && (
                        <button
                          type="button"
                          onClick={() => setWriteReviewModalData({
                            spaceId: booking.spaceId,
                            spaceTitle: booking.spaceTitle
                          })}
                          className="px-3 py-1.5 rounded-lg bg-[#00C878]/15 border border-[#00C878]/40 hover:bg-[#00C878] hover:text-[#0D0D0D] text-[#00C878] text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" />
                          <span>Leave Review</span>
                        </button>
                      )}

                      {/* Cancel (Upcoming only) */}
                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Cancel this booking and refund ₦' + booking.totalPrice.toLocaleString() + ' to your OFIS wallet?')) {
                              cancelBooking(booking.id);
                            }
                          }}
                          className="px-2 py-1.5 rounded-lg bg-[#1A1616] border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Polished Empty States with Required Copy */
          <div className="text-center py-16 bg-[#141816] rounded-2xl border border-[#1E2522] p-8 space-y-4">
            <Ticket className="w-12 h-12 text-[#718079] mx-auto opacity-40" />
            
            {selectedTab === 'upcoming' && (
              <>
                <h3 className="text-base font-bold text-[#F2F2F2]">Your next workspace is waiting.</h3>
                <p className="text-xs text-[#9EABA3] max-w-sm mx-auto">
                  Book quiet executive desks, podcast studios, or team meeting rooms with verified solar backup.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('explore')}
                  className="px-4 py-2.5 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-bold shadow-md hover:bg-[#00E58B] transition-all"
                >
                  Explore spaces
                </button>
              </>
            )}

            {selectedTab === 'completed' && (
              <>
                <h3 className="text-base font-bold text-[#F2F2F2]">Your completed bookings will appear here.</h3>
                <p className="text-xs text-[#9EABA3] max-w-sm mx-auto">
                  Once your work sessions finish, you can leave verified reviews and download receipts here.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('explore')}
                  className="px-4 py-2.5 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-bold shadow-md hover:bg-[#00E58B] transition-all"
                >
                  Browse spaces
                </button>
              </>
            )}

            {selectedTab === 'active' && (
              <>
                <h3 className="text-base font-bold text-[#F2F2F2]">No active access sessions right now.</h3>
                <p className="text-xs text-[#9EABA3] max-w-sm mx-auto">
                  When you check in at a partner turnstile, your live timer and access controls appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('explore')}
                  className="px-4 py-2.5 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-bold shadow-md hover:bg-[#00E58B] transition-all"
                >
                  Explore spaces
                </button>
              </>
            )}

            {selectedTab === 'cancelled' && (
              <>
                <h3 className="text-base font-bold text-[#F2F2F2]">No cancelled bookings.</h3>
                <p className="text-xs text-[#9EABA3] max-w-sm mx-auto">
                  All your reservations are in good standing.
                </p>
              </>
            )}

            {selectedTab === 'all' && (
              <>
                <h3 className="text-base font-bold text-[#F2F2F2]">No bookings recorded</h3>
                <p className="text-xs text-[#9EABA3] max-w-sm mx-auto">
                  Book your first workspace to receive an instant digital QR pass.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('explore')}
                  className="px-4 py-2.5 rounded-xl bg-[#00C878] text-[#0D0D0D] text-xs font-bold shadow-md hover:bg-[#00E58B] transition-all"
                >
                  Explore spaces
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
