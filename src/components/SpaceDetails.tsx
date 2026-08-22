import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Zap, 
  Wifi, 
  VolumeX, 
  Star, 
  Heart, 
  ShieldCheck, 
  Clock, 
  Users, 
  Share2, 
  Calendar, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { spacesService } from '../services/spacesService';
import { FloorPlan } from './FloorPlan';
import { ReviewsSection } from './ReviewsSection';

export const SpaceDetails: React.FC = () => {
  const {
    selectedSpaceId,
    setCurrentView,
    savedSpaceIds,
    toggleSaveSpace,
    setCheckoutSpace,
    setIsCheckoutOpen,
    showToast,
    currency,
    formatPrice,
  } = useApp();

  const space = selectedSpaceId ? spacesService.getSpaceById(selectedSpaceId) : null;
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [bookingMode, setBookingMode] = useState<'hourly' | 'daily'>('hourly');
  const [duration, setDuration] = useState(3); // 3 hours default
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(['desk-01']);

  if (!space) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-sm text-[#9EABA3]">Space not found or no longer available.</p>
        <button
          onClick={() => setCurrentView('explore')}
          className="px-4 py-2 rounded-xl bg-[#00C878] text-[#0D0D0D] font-bold text-xs"
        >
          Back to Spaces
        </button>
      </div>
    );
  }

  const isSaved = savedSpaceIds.includes(space.id);
  const calculatedTotal = bookingMode === 'hourly' 
    ? space.pricePerHour * duration * Math.max(1, selectedSeatIds.length)
    : space.pricePerDay * Math.max(1, Math.ceil(duration / 8)) * Math.max(1, selectedSeatIds.length);

  const toggleSeat = (seatId: string) => {
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seatId));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seatId]);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Space link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-28 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between py-3 mb-4">
          <button
            type="button"
            onClick={() => setCurrentView('explore')}
            className="flex items-center space-x-2 text-xs font-semibold text-[#9EABA3] hover:text-[#F2F2F2] px-3 py-1.5 rounded-xl bg-[#161D19] border border-[#232D28] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to explore</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-[#161D19] border border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2]"
              title="Share Space"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleSaveSpace(space.id)}
              className="p-2 rounded-xl bg-[#161D19] border border-[#232D28] text-[#9EABA3] hover:text-[#00C878]"
              title="Save Space"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#00C878] text-[#00C878]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          <div className="lg:col-span-8 aspect-[16/10] bg-[#141816] rounded-2xl overflow-hidden border border-[#1E2522] relative">
            <img
              src={space.images[activeImageIdx] || space.featuredImage}
              alt={space.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#0D0D0D]/85 backdrop-blur-md border border-[#232D28] text-xs font-bold text-[#00C878] flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-[#00C878]" />
                <span>{space.backupPowerType}</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
            {space.images.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`aspect-[16/10] lg:aspect-auto lg:h-[135px] rounded-xl overflow-hidden border cursor-pointer transition-all ${
                  activeImageIdx === idx
                    ? 'border-[#00C878] ring-2 ring-[#00C878]/30'
                    : 'border-[#1E2522] opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="preview" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content & Booking Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Details Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs text-[#00C878]">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">{space.address}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F2F2F2]">{space.title}</h1>
              <p className="text-sm text-[#9EABA3] leading-relaxed">{space.description}</p>
            </div>

            {/* Core Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#141816] border border-[#1E2522] space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-[#00C878] font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Power Backup</span>
                </div>
                <p className="text-xs font-semibold text-[#F2F2F2]">{space.backupPowerType.split(' ')[0]}</p>
                <p className="text-[10px] text-[#718079]">Zero outage history</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141816] border border-[#1E2522] space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-[#00C878] font-bold">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Speed Test</span>
                </div>
                <p className="text-xs font-semibold text-[#F2F2F2]">{space.internetSpeedMbps} Mbps</p>
                <p className="text-[10px] text-[#718079]">High-speed fiber internet</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141816] border border-[#1E2522] space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-[#00C878] font-bold">
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Noise Rating</span>
                </div>
                <p className="text-xs font-semibold text-[#F2F2F2] truncate">{space.noiseLevel.split('/')[0]}</p>
                <p className="text-[10px] text-[#718079]">Acoustic insulation</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141816] border border-[#1E2522] space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-[#00C878] font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Max Capacity</span>
                </div>
                <p className="text-xs font-semibold text-[#F2F2F2]">{space.capacity} Guests</p>
                <p className="text-[10px] text-[#718079]">Ergonomic seating</p>
              </div>
            </div>

            {/* Floor Plan Seat Selector (if provided) */}
            {space.floorPlanSeats && space.floorPlanSeats.length > 0 && (
              <FloorPlan
                seats={space.floorPlanSeats}
                selectedSeatIds={selectedSeatIds}
                onToggleSeat={toggleSeat}
              />
            )}

            {/* Amenities Grid */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#F2F2F2]">What this space includes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {space.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#141816] border border-[#1E2522]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00C878] flex-shrink-0" />
                    <span className="text-xs text-[#F2F2F2] font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Section */}
            <div className="p-5 rounded-2xl bg-[#141816] border border-[#1E2522] flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                {space.hostAvatar && (
                  <img
                    src={space.hostAvatar}
                    alt={space.hostName}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#00C878]/30"
                  />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-[#F2F2F2]">{space.hostName}</h4>
                    {space.isSuperhost && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00C878] text-[#0D0D0D] font-bold uppercase">
                        Superhost
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9EABA3]">Host response: {space.hostResponseRate || '99% • Under 10 mins'}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#00C878] font-bold">Verified Partner</span>
                <p className="text-[10px] text-[#718079]">Identity & space audited</p>
              </div>
            </div>

            {/* Space Rules */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#F2F2F2]">House & Security Rules</h3>
              <ul className="space-y-1.5">
                {space.rules.map((r, i) => (
                  <li key={i} className="text-xs text-[#9EABA3] flex items-start space-x-2">
                    <span className="text-[#00C878] font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <ReviewsSection
              spaceId={space.id}
              rating={space.rating}
              reviewsCount={space.reviewsCount}
              spaceTitle={space.title}
            />

          </div>

          {/* Right Sticky Booking Box */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-[#141816] rounded-2xl border border-[#232D28] p-6 shadow-2xl space-y-5">
              
              {/* Pricing Header */}
              <div className="flex items-baseline justify-between border-b border-[#1E2522] pb-4">
                <div>
                  <span className="text-2xl font-black text-[#00C878] font-mono">
                    {formatPrice(bookingMode === 'hourly' ? space.pricePerHour : space.pricePerDay)}
                  </span>
                  <span className="text-xs text-[#9EABA3]"> / {bookingMode === 'hourly' ? 'hour' : 'day'}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-[#F2F2F2]">
                  <Star className="w-3.5 h-3.5 fill-[#00C878] text-[#00C878]" />
                  <span className="font-bold">{space.rating}</span>
                  <span className="text-[#718079]">({space.reviewsCount})</span>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#1A201D] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBookingMode('hourly')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    bookingMode === 'hourly'
                      ? 'bg-[#00C878] text-[#0D0D0D] shadow-sm'
                      : 'text-[#9EABA3] hover:text-[#F2F2F2]'
                  }`}
                >
                  Hourly Pass
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('daily')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    bookingMode === 'daily'
                      ? 'bg-[#00C878] text-[#0D0D0D] shadow-sm'
                      : 'text-[#9EABA3] hover:text-[#F2F2F2]'
                  }`}
                >
                  Full Day Pass
                </button>
              </div>

              {/* Booking Selectors */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#9EABA3] mb-1 block">
                    Duration ({bookingMode === 'hourly' ? 'Hours' : 'Days'})
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none"
                  >
                    {bookingMode === 'hourly' ? (
                      <>
                        <option value={1}>1 Hour</option>
                        <option value={2}>2 Hours</option>
                        <option value={3}>3 Hours (Recommended)</option>
                        <option value={4}>4 Hours (Half Day)</option>
                        <option value={6}>6 Hours</option>
                        <option value={8}>8 Hours (Full Day)</option>
                      </>
                    ) : (
                      <>
                        <option value={1}>1 Day (9:00 AM - 6:00 PM)</option>
                        <option value={2}>2 Days</option>
                        <option value={5}>5 Days (Weekly Pass)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#9EABA3] mb-1 block">
                    Start Time
                  </label>
                  <select className="w-full p-2.5 bg-[#1A201D] rounded-xl text-xs text-[#F2F2F2] border border-[#232D28] focus:border-[#00C878] focus:outline-none">
                    <option>Now (Instant Check-In)</option>
                    <option>10:00 AM Today</option>
                    <option>12:00 PM Today</option>
                    <option>02:00 PM Today</option>
                    <option>Tomorrow Morning (09:00 AM)</option>
                  </select>
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="p-3.5 rounded-xl bg-[#1A201D] space-y-2 text-xs">
                <div className="flex justify-between text-[#9EABA3]">
                  <span>Space ({duration} {bookingMode === 'hourly' ? (duration === 1 ? 'hr' : 'hrs') : (duration === 1 ? 'day' : 'days')})</span>
                  <span>{formatPrice(calculatedTotal)}</span>
                </div>
                {selectedSeatIds.length > 1 && (
                  <div className="flex justify-between text-[#9EABA3]">
                    <span>Seats selected</span>
                    <span>{selectedSeatIds.length} desks</span>
                  </div>
                )}
                <div className="flex justify-between text-[#9EABA3]">
                  <span>Service Fee</span>
                  <span className="text-[#00C878] font-semibold">{formatPrice(0)} (Free)</span>
                </div>
                <div className="pt-2 border-t border-[#232D28] flex justify-between font-bold text-sm text-[#F2F2F2]">
                  <span>Total</span>
                  <span className="text-[#00C878] font-mono text-base">{formatPrice(calculatedTotal)}</span>
                </div>
              </div>

              {/* Book Space Button */}
              <button
                type="button"
                onClick={() => {
                  setCheckoutSpace(space);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-extrabold text-sm transition-all shadow-[0_4px_16px_rgba(0,200,120,0.3)] active:scale-95 flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Book Space</span>
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#718079]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00C878]" />
                <span>Clear pricing • Secure payment • Instant booking</span>
              </div>

            </div>
          </div>

        </div>

        {/* Mobile Sticky Booking Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-[#141816]/95 backdrop-blur-md border-t border-[#232D28] z-30 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#9EABA3]">Total</div>
            <div className="text-base font-extrabold text-[#00C878] font-mono">
              {formatPrice(calculatedTotal)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCheckoutSpace(space);
              setIsCheckoutOpen(true);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-[#0D0D0D] font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Book Space</span>
          </button>
        </div>

      </div>
    </div>
  );
};
