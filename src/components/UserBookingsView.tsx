import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Wifi,
  KeyRound,
  Sparkles,
  ArrowRight,
  Receipt,
  Building2,
  ShieldCheck,
  Star,
  BellRing,
  Copy,
  Check,
  CreditCard,
  Landmark,
  ChevronRight,
  MessageCircle,
  PhoneCall,
  Zap,
  Ticket,
  Percent,
  Plus,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';

export const UserBookingsView: React.FC = () => {
  const {
    currentUser,
    bookings,
    spaces,
    cancelBooking,
    checkInBooking,
    setActivePassBooking,
    setIsPassModalOpen,
    openWriteReviewModal,
    formatPriceNaira,
    showToast,
    triggerSessionReminder,
  } = useApp();

  const [mainTab, setMainTab] = useState<'my_passes' | 'buy_passes'>('my_passes');
  const [filterTab, setFilterTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'all'>('upcoming');
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  // Available Prepaid Workspace Passes & Bundles
  const workspaceBundles = [
    {
      id: 'flex-10hr',
      title: '10-Hour Flex Hot Desk Pass',
      category: 'COWORKING DESKS',
      price: 28000,
      originalPrice: 35000,
      discount: '20% OFF',
      validity: 'Valid for 60 days',
      features: [
        'Use across any participating Lagos/Abuja coworking hub',
        '24/7 Power + Starlink 350Mbps guarantee',
        'Hour-by-hour flexible deduction',
        'Free artisan tea & roasted coffee',
      ],
      popular: true,
    },
    {
      id: 'weekly-pass',
      title: 'Weekly Dedicated Desk Pass',
      category: 'UNLIMITED 7-DAY ACCESS',
      price: 65000,
      originalPrice: 80000,
      discount: 'SAVE ₦15k',
      validity: 'Monday – Sunday (24/7 Access)',
      features: [
        'Dedicated ergonomic desk reserved for you',
        'Dual generators & solar backup guarantee',
        '2 hours free meeting room credits included',
        'Access keycard + secure personal locker',
      ],
      popular: false,
    },
    {
      id: 'creator-4pack',
      title: 'Creator Studio 4-Pack',
      category: 'PODCAST & VIDEO STUDIOS',
      price: 95000,
      originalPrice: 120000,
      discount: 'CREATOR DEAL',
      validity: 'Valid for 90 days',
      features: [
        '4 x 3-hour sessions in verified recording studios',
        'Sony FX3 / Shure SM7B studio equipment included',
        'Soundproof acoustic isolation booths',
        'On-site studio technician assistance',
      ],
      popular: true,
    },
    {
      id: 'boardroom-10hr',
      title: 'Boardroom 10-Hour Bundle',
      category: 'MEETING & CONFERENCE',
      price: 140000,
      originalPrice: 175000,
      discount: '20% BUNDLE',
      validity: 'Valid for 90 days',
      features: [
        '10 prepaid hours for up to 12-person boardrooms',
        '4K presentation screens & Zoom Rooms hardware',
        'Executive refreshments & reception greeting',
        'Split hours across multiple client meetings',
      ],
      popular: false,
    },
    {
      id: 'monthly-resident',
      title: 'Monthly Resident Pass',
      category: 'ALL-ACCESS RESIDENCY',
      price: 220000,
      originalPrice: 260000,
      discount: 'BEST VALUE',
      validity: '30-day recurring pass',
      features: [
        '24/7 biometric & digital PIN entry access',
        'Prestigious business address & mail handling',
        '8 hours monthly boardroom access credits',
        'Private locker + high-speed wired ethernet ports',
      ],
      popular: false,
    },
  ];

  // Filter bookings for current user
  const userBookings = (bookings || []).filter(b => b.coworkerId === currentUser?.id);
  const upcomingBookings = userBookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in');
  const completedBookings = userBookings.filter(b => b.status === 'completed');
  const cancelledBookings = userBookings.filter(b => b.status === 'cancelled');

  const getFilteredBookings = () => {
    switch (filterTab) {
      case 'upcoming':
        return upcomingBookings;
      case 'completed':
        return completedBookings;
      case 'cancelled':
        return cancelledBookings;
      case 'all':
      default:
        return userBookings;
    }
  };

  const displayedBookings = getFilteredBookings() || [];

  const handleOpenDigitalPass = (booking: Booking) => {
    setActivePassBooking(booking);
    setIsPassModalOpen(true);
  };

  const handleRateSpace = (booking: Booking) => {
    const space = spaces.find(s => s.id === booking.spaceId);
    if (space) {
      openWriteReviewModal(space, booking);
    } else {
      showToast('Space details not found.', 'warning');
    }
  };

  const handleCopyReference = (ref: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(ref).catch(() => {});
    }
    setCopiedRefId(ref);
    showToast(`Booking Reference ${ref} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  const handleBuyPass = (bundle: typeof workspaceBundles[0]) => {
    showToast(`Pass purchase initiated for ${bundle.title} (${formatPriceNaira(bundle.price)}). Redirecting to Paystack...`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header & Section Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Passes & Digital Access
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#063B2A] text-[#00C878] border border-[#00C878]/30">
                {upcomingBookings.length} Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#9A9A9A] mt-1 font-normal">
              Manage your Nigerian physical space passes, instant turnstile PINs, QR keycards, and recurring passes.
            </p>
          </div>

          {/* Primary Passes Switcher: My Passes vs Buy Passes */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#171717] rounded-2xl border border-[#282828] text-xs font-bold self-start md:self-auto">
            <button
              id="tab-my-passes-btn"
              onClick={() => setMainTab('my_passes')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mainTab === 'my_passes'
                  ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-sm font-black'
                  : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>My Active Passes ({upcomingBookings.length})</span>
            </button>

            <button
              id="tab-buy-passes-btn"
              onClick={() => setMainTab('buy_passes')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mainTab === 'buy_passes'
                  ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 shadow-sm font-black'
                  : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#D6A83A]" />
              <span>Buy Passes & Bundles</span>
            </button>
          </div>
        </div>

        {/* =========================================
            VIEW 1: MY ACTIVE & PAST PASSES
        ========================================= */}
        {mainTab === 'my_passes' && (
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#171717] rounded-2xl border border-[#282828] text-xs font-bold self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setFilterTab('upcoming')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  filterTab === 'upcoming'
                    ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 font-black'
                    : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
                }`}
              >
                Upcoming ({upcomingBookings.length})
              </button>

              <button
                onClick={() => setFilterTab('completed')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  filterTab === 'completed'
                    ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 font-black'
                    : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
                }`}
              >
                Completed ({completedBookings.length})
              </button>

              <button
                onClick={() => setFilterTab('cancelled')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  filterTab === 'cancelled'
                    ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 font-black'
                    : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
                }`}
              >
                Cancelled ({cancelledBookings.length})
              </button>

              <button
                onClick={() => setFilterTab('all')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  filterTab === 'all'
                    ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 font-black'
                    : 'text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
                }`}
              >
                All Records ({userBookings.length})
              </button>
            </div>

            {/* List of Pass Cards */}
            {displayedBookings.length === 0 ? (
              <div className="text-center py-16 bg-[#171717] rounded-3xl border border-[#282828] space-y-4">
                <Ticket className="w-12 h-12 text-[#9A9A9A] mx-auto" />
                <h3 className="text-base font-bold text-white">No passes in this category</h3>
                <p className="text-xs text-[#9A9A9A] max-w-sm mx-auto">
                  You don't have any {filterTab} passes right now. You can discover spaces on the explore page or buy prepaid bundles.
                </p>
                <button
                  onClick={() => setMainTab('buy_passes')}
                  className="px-4 py-2 bg-[#00C878] text-[#0D0D0D] font-black text-xs rounded-xl cursor-pointer"
                >
                  Browse Workspace Bundles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayedBookings.map(booking => {
                  const isUpcoming = booking.status === 'confirmed' || booking.status === 'checked_in';
                  const isCheckedIn = booking.status === 'checked_in';

                  return (
                    <div
                      key={booking.id}
                      id={`booking-card-${booking.id}`}
                      className="bg-[#171717] rounded-3xl border border-[#282828] hover:border-[#00C878]/40 p-5 space-y-4 transition-all shadow-lg flex flex-col justify-between"
                    >
                      <div>
                        {/* Status & Reference Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                isCheckedIn
                                  ? 'bg-[#00C878] text-[#0D0D0D]'
                                  : isUpcoming
                                  ? 'bg-[#063B2A] text-[#00C878] border border-[#00C878]/40'
                                  : booking.status === 'completed'
                                  ? 'bg-[#262626] text-stone-300'
                                  : 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                              }`}
                            >
                              {isCheckedIn ? '🟢 CHECKED IN (ACTIVE)' : isUpcoming ? 'CONFIRMED' : booking.status.toUpperCase()}
                            </span>
                            <span className="text-xs font-mono text-[#9A9A9A]">
                              {booking.bookingReference || `OFIS-${booking.id}`}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopyReference(booking.bookingReference || booking.id)}
                            className="p-1 text-[#9A9A9A] hover:text-white rounded-lg hover:bg-[#222222]"
                            title="Copy Reference"
                          >
                            {copiedRefId === (booking.bookingReference || booking.id) ? (
                              <Check className="w-3.5 h-3.5 text-[#00C878]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Space & Booking Information */}
                        <div className="flex items-start gap-3.5 mt-3.5">
                          {booking.spaceImage && (
                            <img
                              src={booking.spaceImage}
                              alt={booking.spaceName}
                              className="w-16 h-16 rounded-2xl object-cover ring-1 ring-white/10 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-white truncate">
                              {booking.spaceName}
                            </h3>
                            <div className="text-xs text-[#9A9A9A] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#00C878] shrink-0" />
                              <span className="truncate">{booking.spaceAddress || `${booking.spaceCity}, Nigeria`}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-[#00C878] font-bold">
                              <span>Desk/Studio: {booking.deskCode}</span>
                              <span className="text-[#9A9A9A]">•</span>
                              <span className="text-[#D6A83A] font-mono font-black">{formatPriceNaira(booking.totalAmount)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Date & Time Badge */}
                        <div className="mt-3.5 p-3 rounded-2xl bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#00C878]" />
                            <span className="font-semibold text-stone-200">
                              {new Date(booking.startDate).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-300 font-mono">
                            <Clock className="w-3.5 h-3.5 text-[#00C878]" />
                            <span>{booking.startTime} – {booking.endTime}</span>
                          </div>
                        </div>

                        {/* Door PIN & Quick Access (for confirmed/active bookings) */}
                        {isUpcoming && (
                          <div className="mt-3 p-3 rounded-2xl bg-[#063B2A]/40 border border-[#00C878]/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <KeyRound className="w-4 h-4 text-[#00C878]" />
                              <div>
                                <div className="text-[10px] text-[#9A9A9A] uppercase tracking-wider font-bold">Door PIN</div>
                                <div className="text-sm font-black font-mono text-[#00C878] tracking-widest">
                                  {booking.doorPIN || '—'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Wifi className="w-4 h-4 text-[#00C878]" />
                              <div>
                                <div className="text-[10px] text-[#9A9A9A] uppercase tracking-wider font-bold">Starlink SSID</div>
                                <div className="text-xs font-bold text-white">
                                  {booking.wifiSSID || 'OFIS-HighSpeed'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-[#262626] flex flex-wrap items-center justify-between gap-2">
                        {isUpcoming ? (
                          <>
                            <button
                              onClick={() => handleOpenDigitalPass(booking)}
                              className="flex-1 py-2 px-3 rounded-xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>View Digital Pass</span>
                            </button>

                            <button
                              onClick={() => triggerSessionReminder(booking)}
                              className="p-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-[#9A9A9A] hover:text-white transition-colors"
                              title="Test 1-Hour Reminder"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : booking.status === 'completed' ? (
                          <button
                            onClick={() => handleRateSpace(booking)}
                            className="w-full py-2 px-3 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-[#00C878] border border-[#00C878]/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 text-[#D6A83A] fill-[#D6A83A]" />
                            <span>Rate & Review Space</span>
                          </button>
                        ) : (
                          <span className="text-xs text-rose-400 font-semibold">Cancelled & Refunded</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            VIEW 2: BUY WORKSPACE PASSES & BUNDLES
        ========================================= */}
        {mainTab === 'buy_passes' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#063B2A]/60 via-[#171717] to-[#171717] p-6 rounded-3xl border border-[#00C878]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#D6A83A] uppercase bg-[#D6A83A]/20 px-2.5 py-0.5 rounded-full border border-[#D6A83A]/40">
                  PREPAID ACCESS PACKS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Flexible Workspace Passes for Teams & Creators
                </h2>
                <p className="text-xs text-[#9A9A9A] mt-1 max-w-xl">
                  Save up to 25% by bundling hours across Nigeria's top-rated physical spaces. Valid for 60–90 days with instant QR check-in.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#00C878] bg-[#0D0D0D] px-4 py-2 rounded-2xl border border-[#282828]">
                <ShieldCheck className="w-4 h-4 text-[#00C878]" />
                <span>100% Power & Starlink Guarantee</span>
              </div>
            </div>

            {/* Passes Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(workspaceBundles || []).map(bundle => (
                <div
                  key={bundle.id}
                  id={`bundle-card-${bundle.id}`}
                  className={`bg-[#171717] rounded-3xl border p-6 flex flex-col justify-between transition-all hover:shadow-2xl relative ${
                    bundle.popular
                      ? 'border-[#00C878] shadow-lg shadow-[#00C878]/10'
                      : 'border-[#262626] hover:border-[#383838]'
                  }`}
                >
                  {bundle.popular && (
                    <div className="absolute -top-3 right-6 bg-[#00C878] text-[#0D0D0D] font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                      MOST POPULAR
                    </div>
                  )}

                  <div>
                    {/* Category & Discount */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-wider">
                        {bundle.category}
                      </span>
                      <span className="text-[10px] font-black text-[#00C878] bg-[#063B2A] px-2 py-0.5 rounded-full border border-[#00C878]/30">
                        {bundle.discount}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-white mt-2 leading-snug">
                      {bundle.title}
                    </h3>
                    <p className="text-xs text-[#9A9A9A] mt-0.5 font-medium">
                      {bundle.validity}
                    </p>

                    {/* Price in Naira */}
                    <div className="mt-4 pb-4 border-b border-[#262626] flex items-baseline gap-2 font-mono">
                      <span className="text-2xl font-black text-white">
                        ₦{bundle.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#9A9A9A] line-through">
                        ₦{bundle.originalPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Features checklist */}
                    <ul className="mt-4 space-y-2.5 text-xs text-stone-300">
                      {(bundle.features || []).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#00C878] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Purchase CTA */}
                  <div className="mt-6 pt-4 border-t border-[#262626]">
                    <button
                      onClick={() => handleBuyPass(bundle)}
                      className="w-full py-3 rounded-2xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#0D0D0D]" />
                      <span>Buy Pass with Paystack</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
