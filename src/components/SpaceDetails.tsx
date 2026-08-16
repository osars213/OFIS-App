import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Wifi,
  Sparkles,
  CheckCircle2,
  Share2,
  Heart,
  ChevronRight,
  Info,
  Calendar,
  CreditCard,
  Building,
  Check,
  Lock,
  Zap,
  Mic,
  Camera,
  Tv,
  Headphones,
  Sliders,
  Sun,
  Flame,
  Layers,
  Award,
  Video,
  Radio,
  PhoneCall,
  MessageCircle,
  Users,
  AlertCircle
} from 'lucide-react';
import { Space, Desk, BookingDurationType } from '../types';
import { useApp } from '../context/AppContext';
import { FloorPlan } from './FloorPlan';
import { ReviewsSection } from './ReviewsSection';

interface SpaceDetailsProps {
  space: Space;
  onBack: () => void;
}

const AVAILABLE_TIME_SLOTS = [
  { id: '08:00 AM', label: '08:00 AM', status: 'available', tag: 'Early Bird' },
  { id: '09:00 AM', label: '09:00 AM', status: 'available', tag: 'Popular' },
  { id: '10:00 AM', label: '10:00 AM', status: 'available', tag: 'Prime' },
  { id: '11:00 AM', label: '11:00 AM', status: 'available', tag: 'Prime' },
  { id: '12:00 PM', label: '12:00 PM', status: 'available', tag: 'Afternoon' },
  { id: '01:00 PM', label: '01:00 PM', status: 'available', tag: 'Afternoon' },
  { id: '02:00 PM', label: '02:00 PM', status: 'available', tag: 'Popular' },
  { id: '03:00 PM', label: '03:00 PM', status: 'available', tag: 'Prime' },
  { id: '04:00 PM', label: '04:00 PM', status: 'available', tag: 'Golden Hour' },
  { id: '05:00 PM', label: '05:00 PM', status: 'available', tag: 'Evening' },
  { id: '06:00 PM', label: '06:00 PM', status: 'available', tag: 'Night Session' },
  { id: '07:00 PM', label: '07:00 PM', status: 'available', tag: 'Night Owl' },
];

const DURATION_OPTIONS = [
  { hours: 1, label: '1 Hour', subtitle: 'Quick Session' },
  { hours: 2, label: '2 Hours', subtitle: 'Standard Block', badge: 'Popular' },
  { hours: 3, label: '3 Hours', subtitle: 'Focus Pod', badge: 'Recommended' },
  { hours: 4, label: '4 Hours', subtitle: 'Half Day Sprint', badge: 'Best Value' },
  { hours: 6, label: '6 Hours', subtitle: 'Extended Block' },
  { hours: 8, label: '8 Hours', subtitle: 'Full Day Pass', badge: 'Full Day' },
];

export const SpaceDetails: React.FC<SpaceDetailsProps> = ({ space, onBack }) => {
  const {
    currentCurrency,
    formatPrice,
    convertPrice,
    formatPriceNaira,
    selectedDesk,
    setSelectedDesk,
    setIsCheckoutModalOpen,
    openAiModal,
    showToast,
    toggleFavorite,
    isFavorite,
    bookingDraft,
    setBookingDraft,
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(bookingDraft.startDate || new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(bookingDraft.startTime || '09:00 AM');
  const [selectedHours, setSelectedHours] = useState(bookingDraft.durationUnits || 3);

  const isSaved = isFavorite(space.id);

  // Hourly and daily rate in Naira
  const hourlyRateNaira = space.hourlyRateNGN || Math.round(space.hourlyRate * 1550);
  const dailyRateNaira = space.dailyRateNGN || Math.round(space.dailyRate * 1550);

  // Dynamic equipment fallback based on space category
  const equipmentList = useMemo(() => {
    if (space.equipment && space.equipment.length > 0) {
      return space.equipment;
    }
    if (space.primaryCategory === 'CREATE') {
      return [
        '4x Shure SM7B Broadcast Microphones with Cloudlifters',
        'Rodecaster Pro II Audio Production & Mixing Console',
        '2x Sony FX3 Cinema Cameras with 24-70mm G-Master',
        'Aputure 300d II Key Light + Nanlite Pavotube RGB Lighting Grid',
        'Seamless White Cyclorama + Acoustic Soundproofing',
        'Apple Silicon M3 Max Video Editing Suite',
        'Sony WH-1000XM5 Studio Monitor Headphones',
      ];
    } else if (space.primaryCategory === 'MEET') {
      return [
        '75" 4K Sony Bravia HDR AirPlay & HDMI Display',
        'Polycom Studio 4K Auto-Framing Video Conference Bar',
        'Jabra Speak 750 Wireless Omnidirectional Microphones',
        'Solid Mahogany Conference Table with Integrated Power',
        'Executive Ergonomic Leather Chairs',
      ];
    } else if (space.primaryCategory === 'HOST') {
      return [
        '150" 4K High-Lumen Laser Projection Screen',
        'JBL EON Powered Sound PA System with Digital Mixer',
        '4x Sennheiser Wireless Handheld & Lapel Mics',
        'Modular Theatre, Classroom & Banquet Seating Configs',
        'RGB DMX Ambient Stage Wash Lights',
      ];
    } else {
      return [
        'Dual 27" 4K Dell UltraSharp USB-C Power Delivery Monitors',
        'Herman Miller Aeron Ergonomic Mesh Work Chairs',
        'Motorized Heavy-Duty Dual-Motor Sit-Stand Workstations',
        'Private Soundproof Acoustic Zoom & Phone Call Booths',
        'Dedicated Hardwired 1Gbps LAN Ports at Every Desk',
      ];
    }
  }, [space]);

  // Compute session end time
  const calculatedEndTime = useMemo(() => {
    try {
      const [time, modifier] = selectedTimeSlot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const startDateObj = new Date();
      startDateObj.setHours(hours, minutes, 0, 0);
      startDateObj.setHours(startDateObj.getHours() + selectedHours);

      return startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '05:00 PM';
    }
  }, [selectedTimeSlot, selectedHours]);

  // Calculations in Naira (and USD base)
  const subtotalNaira = hourlyRateNaira * selectedHours;
  const serviceFeeNaira = Math.round(subtotalNaira * 0.05); // 5% transparent OFIS service fee
  const totalNaira = subtotalNaira + serviceFeeNaira;

  const handleStartBooking = () => {
    // Pick first available desk in space if not set
    let targetDesk = selectedDesk;
    if (!targetDesk || targetDesk.spaceId !== space.id || targetDesk.status !== 'available') {
      const spaceDesks = Array.isArray(space.desks) ? space.desks : [];
      const firstAvail = spaceDesks.find(d => d.status === 'available') || spaceDesks[0];
      targetDesk = firstAvail;
      setSelectedDesk(firstAvail);
    }

    // Save draft state
    setBookingDraft({
      startDate: selectedDate,
      startTime: selectedTimeSlot,
      durationUnits: selectedHours,
      durationType: 'hourly',
    });

    setIsCheckoutModalOpen(true);
  };

  const handleShare = () => {
    if (navigator?.share) {
      navigator.share({
        title: space.name,
        text: `Book ${space.name} in ${space.city} on OFIS!`,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      showToast('Space link copied to clipboard!', 'info');
    } else {
      showToast('Space link ready to share', 'info');
    }
  };

  const quickDates = [
    { label: 'Today', date: new Date().toISOString().split('T')[0] },
    {
      label: 'Tomorrow',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    },
    {
      label: 'In 2 Days',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F2F2F2] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex items-center justify-between">
          <button
            id="back-to-spaces-btn"
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-[#F2F2F2] hover:text-[#00C878] bg-[#171717] hover:bg-[#222222] px-4 py-2 rounded-xl border border-[#282828] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#00C878]" />
            <span>Back to All Spaces</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="share-space-btn"
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-[#171717] border border-[#282828] text-[#9A9A9A] hover:text-white hover:bg-[#222222] text-xs flex items-center gap-1.5 transition-colors font-semibold cursor-pointer"
              title="Share space"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              id="space-details-fav-btn"
              onClick={() => toggleFavorite(space.id)}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors font-bold cursor-pointer ${
                isSaved
                  ? 'bg-[#063B2A] border-[#00C878] text-[#00C878]'
                  : 'bg-[#171717] border-[#282828] text-[#9A9A9A] hover:text-white hover:bg-[#222222]'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save to favorites'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#00C878] text-[#00C878]' : 'text-[#9A9A9A]'}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save Space'}</span>
            </button>

            <button
              id="ai-advisor-space-btn"
              onClick={() => openAiModal('match')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#171717] hover:bg-[#222222] text-[#D6A83A] border border-[#D6A83A]/40 text-xs font-bold cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D6A83A]" />
              <span>AI Match</span>
            </button>
          </div>
        </div>

        {/* Main Title, Nigerian Location & Badges */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#063B2A] text-[#00C878] border border-[#00C878]/40 uppercase tracking-wider">
              {space.primaryCategory}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#171717] text-[#F2F2F2] border border-[#282828]">
              🇳🇬 {space.neighborhood}, {space.city}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A1A1A] text-[#00C878] border border-[#00C878]/30 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#00C878]" /> 24/7 Power (Gen + Solar)
            </span>
            {space.isSuperhost && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D6A83A]/20 text-[#D6A83A] border border-[#D6A83A]/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6A83A]" /> Verified Host
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {space.name}
          </h1>

          <p className="text-[#9A9A9A] text-xs sm:text-sm mt-1.5 font-normal max-w-3xl leading-relaxed">
            {space.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#9A9A9A] mt-3">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Star className="w-4 h-4 fill-[#D6A83A] text-[#D6A83A]" />
              <span>{(space.rating || 4.9).toFixed(2)}</span>
              <span className="text-[#9A9A9A] font-normal">({space.reviewCount || 10} verified Nigerian reviews)</span>
            </div>

            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-[#00C878]" />
              <span>{space.address || `${space.city}, Nigeria`}</span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-[#9A9A9A]" />
              <span>Capacity: {space.capacity || 10} {(space.capacity || 10) === 1 ? 'person' : 'people'}</span>
            </div>
          </div>
        </div>

        {/* Large Photo Gallery */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 h-[360px] sm:h-[480px] rounded-2xl overflow-hidden border border-[#262626]">
            {/* Main big image */}
            <div className="lg:col-span-8 relative h-full bg-[#141414]">
              <img
                src={(space.images || [])[activePhotoIndex] || (space.images || [])[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'}
                alt={space.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-[#0D0D0D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-[#282828]">
                📸 Photo {activePhotoIndex + 1} of {(space.images || []).length || 1}
              </div>
            </div>

            {/* Side Thumbnail Stack */}
            <div className="hidden lg:grid lg:col-span-4 grid-rows-3 gap-2 h-full">
              {(space.images || []).slice(1, 4).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx + 1)}
                  className={`relative w-full h-full overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                    activePhotoIndex === idx + 1 ? 'border-[#00C878] ring-2 ring-[#00C878]/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${space.name} view ${idx + 2}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile thumbnail strip */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
            {(space.images || []).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 ${
                  activePhotoIndex === idx ? 'border-[#00C878]' : 'border-[#262626] opacity-60'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Two-Column Layout: Space Details & Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Column: Description, Host, Facilities, Equipment, Rules */}
          <div className="lg:col-span-7 space-y-8">
            {/* Verified Superhost Box with WhatsApp Chat */}
            <div className="p-5 rounded-2xl bg-[#171717] border border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={space.hostAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                  alt={space.hostName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#00C878]/50"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">{space.hostName}</span>
                    {space.isSuperhost && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D6A83A]/20 text-[#D6A83A] border border-[#D6A83A]/40">
                        ★ VERIFIED HOST
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9A9A9A] mt-0.5">
                    Host response time: <span className="font-bold text-[#00C878]">{space.hostResponseTime || 'Within 5 minutes'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`https://wa.me/${(space.hostWhatsApp || '').replace('+', '')}?text=Hello%20${encodeURIComponent(space.hostName || '')},%20I%20am%20interested%20in%20booking%20${encodeURIComponent(space.name || '')}%20on%20OFIS.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] rounded-xl text-xs font-black transition-colors shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#0D0D0D]" />
                  <span>WhatsApp Host</span>
                </a>

                <a
                  href={`tel:${space.hostPhone || ''}`}
                  className="p-2 bg-[#222222] hover:bg-[#2A2A2A] text-white rounded-xl transition-colors border border-[#2D2D2D]"
                  title="Call Host"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white">
                About this Space
              </h2>
              <p className="text-[#9A9A9A] text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {space.description}
              </p>
            </div>

            {/* Facilities / Amenities */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white">
                Key Facilities & Nigerian Infrastructure
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(space.amenities || []).map((facility, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-[#171717] border border-[#262626] text-xs font-semibold text-[#F2F2F2]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00C878] shrink-0" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Equipment & Gear */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Included Gear & Production Equipment
                </h2>
                <span className="text-[11px] font-bold text-[#00C878] bg-[#063B2A] px-2.5 py-0.5 rounded-full border border-[#00C878]/30">
                  Included
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(equipmentList || []).map((eq, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-[#171717] border border-[#262626] text-xs font-semibold text-[#F2F2F2]"
                  >
                    <Zap className="w-4 h-4 text-[#D6A83A] shrink-0" />
                    <span>{eq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Seat / Station Selection */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white">
                Available Workstations & Pods
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(space.desks || []).map(desk => {
                  const isSelected = selectedDesk?.id === desk.id;
                  const isAvail = desk.status === 'available';

                  return (
                    <div
                      key={desk.id}
                      onClick={() => isAvail && setSelectedDesk(desk)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#063B2A] border-[#00C878] ring-2 ring-[#00C878]/40 shadow-sm'
                          : isAvail
                          ? 'bg-[#171717] border-[#262626] hover:border-[#383838]'
                          : 'bg-[#121212] border-[#202020] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#222222] text-white">
                          {desk.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAvail ? 'bg-[#063B2A] text-[#00C878]' : 'bg-rose-950 text-rose-300'
                          }`}
                        >
                          {isAvail ? '🟢 Available' : '🔴 Occupied'}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-white">{desk.name}</h4>
                      <p className="text-[11px] text-[#9A9A9A] mt-0.5">{desk.monitorSetup}</p>

                      <div className="mt-2 text-[10px] text-stone-300 flex items-center gap-2">
                        <span>💺 {desk.chairType}</span>
                        {desk.standingMotorized && <span>• ⚡ Motorized Desk</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cancellation Policy & House Rules */}
            <div className="p-5 rounded-2xl bg-[#171717] border border-[#282828] space-y-3 text-xs text-[#F2F2F2]">
              <div className="flex items-center gap-2 font-bold text-[#D6A83A]">
                <ShieldCheck className="w-4 h-4 text-[#D6A83A]" />
                <span>Cancellation & Host Policies</span>
              </div>
              <p className="text-[#9A9A9A] font-normal">
                {space.cancellationPolicy}
              </p>
              <div className="border-t border-[#262626] pt-2 space-y-1">
                <span className="font-bold text-white">House Rules:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[#9A9A9A]">
                  {(space.rules || []).map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewsSection space={space} />
          </div>

          {/* Right Column: Prominent Booking Card & Instant Pricing Calculation */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-[#171717] rounded-3xl border border-[#282828] shadow-2xl p-6 sm:p-7 space-y-6">
              {/* Header with Pricing */}
              <div className="flex items-baseline justify-between border-b border-[#262626] pb-4">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {formatPriceNaira(hourlyRateNaira)}
                  </span>
                  <span className="text-xs font-normal text-[#9A9A9A] ml-1">/ hour</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#9A9A9A] block">or Full Day Pass</span>
                  <span className="text-xs font-black text-[#00C878] font-mono">
                    {formatPriceNaira(dailyRateNaira)} / day
                  </span>
                </div>
              </div>

              {/* Step 1: Select Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>1. Select Date</span>
                  <span className="text-[11px] font-normal text-[#9A9A9A]">Pick a day</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {quickDates.map(qd => (
                    <button
                      key={qd.label}
                      onClick={() => setSelectedDate(qd.date)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedDate === qd.date
                          ? 'bg-[#063B2A] text-[#00C878] border-[#00C878]'
                          : 'bg-[#202020] border-[#2D2D2D] text-[#9A9A9A] hover:text-white'
                      }`}
                    >
                      {qd.label}
                    </button>
                  ))}
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-[#2D2D2D] bg-[#202020] text-white focus:outline-none focus:border-[#00C878]"
                />
              </div>

              {/* Step 2: Select Start Time Slot */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>2. Start Time Slot</span>
                  <span className="text-[11px] font-bold text-[#00C878]">🟢 Available</span>
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {AVAILABLE_TIME_SLOTS.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTimeSlot(slot.id)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        selectedTimeSlot === slot.id
                          ? 'bg-[#00C878] text-[#0D0D0D] border-[#00C878] font-black'
                          : 'bg-[#202020] border-[#2D2D2D] text-[#F2F2F2] hover:bg-[#2A2A2A] font-medium'
                      }`}
                    >
                      <div className="text-xs">{slot.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Duration Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>3. Duration</span>
                  <span className="text-[11px] font-bold text-[#00C878]">
                    {selectedTimeSlot} – {calculatedEndTime}
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map(opt => (
                    <button
                      key={opt.hours}
                      onClick={() => setSelectedHours(opt.hours)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedHours === opt.hours
                          ? 'bg-[#063B2A] text-[#00C878] border-[#00C878]'
                          : 'bg-[#202020] border-[#2D2D2D] text-[#F2F2F2] hover:bg-[#2A2A2A]'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className={`text-[10px] ${selectedHours === opt.hours ? 'text-[#00C878]' : 'text-[#9A9A9A]'}`}>
                        {opt.badge || opt.subtitle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Instant Calculation Summary in Naira */}
              <div className="bg-[#202020] rounded-2xl p-4 border border-[#2D2D2D] space-y-2.5 text-xs">
                <div className="font-mono font-black text-white border-b border-[#2A2A2A] pb-1.5 flex items-center justify-between">
                  <span>Booking Breakdown</span>
                  <span className="text-[10px] font-bold text-[#00C878]">🇳🇬 ₦ NGN</span>
                </div>

                <div className="flex items-center justify-between text-[#9A9A9A]">
                  <span>{formatPriceNaira(hourlyRateNaira)} × {selectedHours} {selectedHours === 1 ? 'hour' : 'hours'}</span>
                  <span className="font-mono font-bold text-white">{formatPriceNaira(subtotalNaira)}</span>
                </div>

                <div className="flex items-center justify-between text-[#9A9A9A]">
                  <span className="flex items-center gap-1">
                    <span>OFIS Service fee (5%)</span>
                    <Info className="w-3 h-3 text-[#9A9A9A]" />
                  </span>
                  <span className="font-mono font-bold text-white">{formatPriceNaira(serviceFeeNaira)}</span>
                </div>

                <div className="border-t border-[#2A2A2A] pt-2 flex items-center justify-between text-white font-black text-sm">
                  <span>Total Amount</span>
                  <span className="font-mono text-base text-[#00C878]">{formatPriceNaira(totalNaira)}</span>
                </div>
              </div>

              {/* Step 5 / Primary CTA: "Book this space" */}
              <button
                id="book-this-space-cta-btn"
                onClick={handleStartBooking}
                className="w-full py-4 px-6 rounded-2xl bg-[#00C878] hover:bg-[#00b06a] text-[#0D0D0D] font-black text-sm transition-all shadow-xl shadow-[#00C878]/10 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <CreditCard className="w-4 h-4 text-[#0D0D0D]" />
                <span>Book this space • {formatPriceNaira(totalNaira)}</span>
              </button>

              {/* Trust Markers */}
              <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-[#9A9A9A] pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#00C878]" /> Paystack Secured
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#D6A83A]" /> Instant Pass
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#00C878]" /> Power Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
