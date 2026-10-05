import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Zap, 
  Wifi, 
  ShieldCheck, 
  Star, 
  Heart, 
  Share2, 
  Clock, 
  Users, 
  Building2, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Navigation, 
  ChevronRight,
  Sparkles,
  Calendar as CalendarIcon,
  MessageSquare,
  ArrowLeftRight,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FloorPlan } from './FloorPlan';
import { reviewsService } from '../services/reviewsService';
import { FloorPlanSeat } from '../types';
import { getSpaceAvailability } from '../utils/availability';
import { getSpacePricing, formatSpaceRate } from '../utils/pricing';
import { formatLocationFull } from '../utils/location';

// Workspace Premium Sub-components
import { HeroGallery } from './workspace/HeroGallery';
import { QuickFactsBar } from './workspace/QuickFactsBar';
import { CategorizedAmenities } from './workspace/CategorizedAmenities';
import { InteractiveWorkspaceMap } from './workspace/InteractiveWorkspaceMap';
import { HostProfileCard } from './workspace/HostProfileCard';
import { WorkspaceAvailabilityCalendar } from './workspace/WorkspaceAvailabilityCalendar';
import { EnhancedReviewsSection } from './workspace/EnhancedReviewsSection';
import { RelatedSpacesSection } from './workspace/RelatedSpacesSection';
import { StickyBookingBar } from './workspace/StickyBookingBar';

export const SpaceDetails: React.FC = () => {
  const {
    selectedSpace,
    setSelectedSpaceId,
    allSpaces,
    setCurrentView,
    savedSpaceIds,
    toggleSaveSpace,
    setCheckoutSpace,
    setIsCheckoutOpen,
    openQuickBook,
    setDirectionsSpace,
    setIsDirectionsOpen,
    setContactSpace,
    setIsContactOpen,
    setReviewSpace,
    setIsWriteReviewOpen,
    formatPrice,
    formatTime,
    comparedSpaceIds,
    toggleSpaceCompare,
    setIsCompareModalOpen,
    openAvailabilityAlertModal,
  } = useApp();

  const [selectedSeat, setSelectedSeat] = useState<FloorPlanSeat | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string; durationHours: number } | null>(null);

  const reviewsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  if (!selectedSpace) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#07383D] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <p className="text-[#5D7A7D] dark:text-[#B8D1D0]">No space selected</p>
          <button
            type="button"
            onClick={() => setCurrentView('explore')}
            className="px-4 py-2 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-bold text-xs cursor-pointer"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const isSaved = savedSpaceIds.includes(selectedSpace.id);
  const [reviews, setReviews] = useState(() => reviewsService.getReviewsForSpace(selectedSpace.id));

  React.useEffect(() => {
    if (selectedSpace?.id) {
      reviewsService.fetchReviewsAsync(selectedSpace.id).then(fetched => {
        if (fetched && fetched.length > 0) {
          setReviews(fetched);
        }
      });
    }
  }, [selectedSpace?.id]);

  const availability = getSpaceAvailability(selectedSpace);

  const handleBookNow = () => {
    if (selectedSlot) {
      openQuickBook(selectedSpace, {
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
      });
    } else if (availability.status !== 'available_now' && availability.nextSlot) {
      openQuickBook(selectedSpace, {
        date: availability.nextSlot.date,
        startTime: availability.nextSlot.time,
      });
    } else {
      setCheckoutSpace(selectedSpace);
      setIsCheckoutOpen(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedSpace.title,
        text: selectedSpace.tagline,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#07383D] pb-36">
      
      {/* Sticky Top Navigation Bar */}
      <div className="sticky top-16 z-30 bg-[#FFF9F4]/90 dark:bg-[#07383D]/90 backdrop-blur-md border-b border-[#E2ECEB] dark:border-[#166D74] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentView('explore')}
            className="flex items-center space-x-2 text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#006B70] dark:hover:text-[#28D2CB] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspaces</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id={`details-compare-btn-${selectedSpace.id}`}
              onClick={() => toggleSpaceCompare(selectedSpace.id)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                comparedSpaceIds.includes(selectedSpace.id)
                  ? 'bg-[#14BEB8] text-white border-[#14BEB8] font-bold shadow-xs'
                  : 'bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border-[#E2ECEB] dark:border-[#166D74] text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white'
              }`}
              title={comparedSpaceIds.includes(selectedSpace.id) ? 'Remove from compare list' : 'Add to compare list'}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{comparedSpaceIds.includes(selectedSpace.id) ? 'Comparing' : 'Compare'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSaveSpace(selectedSpace.id)}
              className="p-2 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-[#12383B] dark:text-white hover:text-[#14BEB8] transition-all cursor-pointer shadow-2xs"
              aria-label="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#FFA987] text-[#FFA987]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-[#12383B] dark:text-white hover:text-[#14BEB8] transition-all cursor-pointer shadow-2xs"
              aria-label="Share workspace"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Title & Metadata Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Availability Status Pill */}
            <div 
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wide border ${
                availability.status === 'available_now'
                  ? 'bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 text-[#006B70] dark:text-[#28D2CB] border-[#14BEB8]/40'
                  : availability.status === 'available_today'
                  ? 'bg-[#14BEB8]/10 dark:bg-[#14BEB8]/15 text-[#006B70] dark:text-[#28D2CB] border-[#14BEB8]/25'
                  : 'bg-[#F3F6F5] dark:bg-[#0B4A50] text-[#5D7A7D] dark:text-[#B8D1D0] border-[#E2ECEB] dark:border-[#166D74]'
              }`}
            >
              {availability.status === 'available_now' && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14BEB8] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14BEB8]" />
                </span>
              )}
              {availability.status === 'available_today' && (
                <span className="inline-flex rounded-full h-1.5 w-1.5 bg-[#14BEB8]" />
              )}
              <span>{availability.statusLabel}</span>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border border-[#14BEB8]/30 text-[#006B70] dark:text-[#28D2CB] text-xs font-mono font-bold uppercase">
              {String(selectedSpace.category || '').replace(/_/g, ' ')}
            </span>
            
            {selectedSpace.isSuperhost && (
              <span className="px-2.5 py-1 rounded-lg bg-[#FFA987] text-[#006B70] text-xs font-mono font-bold uppercase shadow-2xs">
                Superhost Verified
              </span>
            )}
            
            <button
              type="button"
              onClick={scrollToReviews}
              className="flex items-center space-x-1 text-xs text-[#12383B] dark:text-white hover:text-[#006B70] dark:hover:text-[#28D2CB] transition-colors cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-[#FFA987] text-[#FFA987]" />
              <span className="font-bold">{selectedSpace.rating}</span>
              <span className="text-[#5D7A7D] dark:text-[#B8D1D0]">({selectedSpace.reviewsCount} reviews)</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#12383B] dark:text-white tracking-tight">
            {selectedSpace.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[#5D7A7D] dark:text-[#B8D1D0]">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#FFA987]" />
              <span>{formatLocationFull(selectedSpace)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setDirectionsSpace(selectedSpace);
                setIsDirectionsOpen(true);
              }}
              className="text-[#006B70] dark:text-[#28D2CB] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </button>
          </div>
        </div>

        {/* 1. FULL-SCREEN HERO GALLERY */}
        <HeroGallery
          space={selectedSpace}
          isSaved={isSaved}
          onToggleSave={() => toggleSaveSpace(selectedSpace.id)}
          onShare={handleShare}
        />

        {/* 2. QUICK FACTS BAR */}
        <QuickFactsBar
          space={selectedSpace}
          formatTime={formatTime}
          onReviewsClick={scrollToReviews}
          onMapClick={scrollToMap}
        />

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Space Power & Connectivity High-Performance Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  <Zap className="w-4 h-4 text-[#FFA987]" />
                  <span>Power Backup</span>
                </div>
                <div className="text-sm font-bold text-[#12383B] dark:text-white">{selectedSpace.powerType}</div>
                <p className="text-[10px] text-[#006B70] dark:text-[#28D2CB] font-mono">{selectedSpace.powerUptimeGuaranteePercent}% Uptime Guarantee</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  <Wifi className="w-4 h-4 text-[#FFA987]" />
                  <span>Internet Speed</span>
                </div>
                <div className="text-sm font-bold text-[#12383B] dark:text-white">{selectedSpace.internetSpeedMbps} Mbps</div>
                <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] font-mono">{selectedSpace.internetIsp || 'Dedicated Fiber'}</p>
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center space-x-1.5 text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                  <Users className="w-4 h-4 text-[#FFA987]" />
                  <span>Capacity & Noise</span>
                </div>
                <div className="text-sm font-bold text-[#12383B] dark:text-white">{selectedSpace.capacity} Guests</div>
                <p className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] font-mono">{selectedSpace.noiseLevel}</p>
              </div>
            </div>

            {/* About this Workspace */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#12383B] dark:text-white">About this Workspace</h3>
              <p className="text-sm text-[#5D7A7D] dark:text-[#B8D1D0] leading-relaxed whitespace-pre-line">
                {selectedSpace.description}
              </p>
            </div>

            {/* Interactive Floor Plan if available */}
            {selectedSpace.floorPlanSeats && selectedSpace.floorPlanSeats.length > 0 && (
              <FloorPlan
                seats={selectedSpace.floorPlanSeats}
                selectedSeatId={selectedSeat?.id}
                onSelectSeat={(seat) => setSelectedSeat(seat)}
                formatPrice={formatPrice}
              />
            )}

            {/* 4. CATEGORIZED AMENITIES */}
            <CategorizedAmenities space={selectedSpace} />

            {/* 7. AVAILABILITY CALENDAR */}
            <div ref={calendarRef}>
              <WorkspaceAvailabilityCalendar
                space={selectedSpace}
                formatPrice={formatPrice}
                formatTime={formatTime}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot);
                  openQuickBook(selectedSpace, {
                    date: slot.date,
                    startTime: slot.startTime,
                  });
                }}
              />
            </div>

            {/* 5. INTERACTIVE MAP */}
            <div ref={mapRef}>
              <InteractiveWorkspaceMap
                space={selectedSpace}
                onOpenDirections={() => {
                  setDirectionsSpace(selectedSpace);
                  setIsDirectionsOpen(true);
                }}
              />
            </div>

            {/* 6. ENHANCED HOST CARD */}
            <HostProfileCard
              host={selectedSpace.host}
              space={selectedSpace}
              allSpaces={allSpaces}
              onContactHost={() => {
                setContactSpace(selectedSpace);
                setIsContactOpen(true);
              }}
              onSelectSpace={(spaceId) => setSelectedSpaceId(spaceId)}
            />

            {/* 8. VERIFIED REVIEWS */}
            <div ref={reviewsRef}>
              <EnhancedReviewsSection
                reviews={reviews}
                overallRating={selectedSpace.rating}
                reviewsCount={selectedSpace.reviewsCount}
                onWriteReviewClick={() => {
                  setReviewSpace(selectedSpace);
                  setIsWriteReviewOpen(true);
                }}
              />
            </div>

            {/* 9. RELATED SPACES ("You May Also Like") */}
            <RelatedSpacesSection
              currentSpace={selectedSpace}
              allSpaces={allSpaces}
              onSelectSpace={(spaceId) => setSelectedSpaceId(spaceId)}
            />

          </div>

          {/* Booking Summary Sidebar (1 Col Sticky Card) */}
          <div className="space-y-6">
            <div className="sticky top-32 p-6 rounded-3xl bg-white dark:bg-[#0B4A50] border border-[#E2ECEB] dark:border-[#166D74] shadow-sm dark:shadow-2xl space-y-6">
              
              {(() => {
                const pricing = getSpacePricing(selectedSpace);
                return (
                  <div className="flex items-baseline justify-between border-b border-[#E2ECEB] dark:border-[#166D74] pb-4">
                    <div>
                      <div className="text-[10px] font-mono text-[#5D7A7D] dark:text-[#B8D1D0] uppercase tracking-wider font-semibold">
                        {pricing.basis === 'person' ? 'Per Person' : 'Entire Space'}
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-extrabold text-[#006B70] dark:text-[#28D2CB] font-mono tracking-tight reflective-price">
                          {formatPrice(pricing.rate)}
                        </span>
                        <span className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]"> / {pricing.period}</span>
                      </div>
                    </div>
                    {selectedSpace.pricePerDay && pricing.period === 'hour' && (
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#12383B] dark:text-white">
                          {formatPrice(selectedSpace.pricePerDay)}
                        </div>
                        <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">Full Day Pass</div>
                      </div>
                    )}
                    {pricing.sessionDurationHours && (
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#006B70] dark:text-[#28D2CB]">
                          {pricing.sessionDurationHours}h Block
                        </div>
                        <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">Per Session</div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Selected Slot or Live Status Banner */}
              {selectedSlot ? (
                <div className="p-3 rounded-2xl bg-[#14BEB8]/15 dark:bg-[#07383D] border border-[#14BEB8]/30 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-[#006B70] dark:text-[#28D2CB]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Selected Date & Slot</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-[#12383B] dark:text-white">
                    {selectedSlot.date} @ {formatTime(selectedSlot.startTime)} ({selectedSlot.durationHours} hrs)
                  </div>
                </div>
              ) : availability.status !== 'available_now' && availability.nextSlot ? (
                <div className="p-3 rounded-2xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                    <Clock className="w-3.5 h-3.5 text-[#FFA987]" />
                    <span>Next Available Reservation</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-[#12383B] dark:text-white">
                    {availability.nextSlot.label}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#FFA987]/15 dark:bg-[#07383D] border border-[#FFA987]/30 flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFA987] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFA987]" />
                  </span>
                  <span className="text-xs text-[#006B70] dark:text-[#28D2CB] font-bold">Instant Pass Active Now</span>
                </div>
              )}

              {/* Instant Booking Reassurance Details */}
              <div className="space-y-3 text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">
                {availability.occupancyLabel && (
                  <div className="flex items-center justify-between">
                    <span>Live Demand</span>
                    <span className="font-semibold text-[#006B70] dark:text-[#28D2CB]">
                      {availability.occupancyLabel}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Operating Hours</span>
                  <span className="font-semibold text-[#12383B] dark:text-white">
                    {formatTime(selectedSpace.operatingHours.open)} - {formatTime(selectedSpace.operatingHours.close)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Digital Pass</span>
                  <span className="text-[#006B70] dark:text-[#28D2CB] font-semibold">Instant Mobile QR Gate</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cancellation</span>
                  <span className="text-[#12383B] dark:text-white">Free up to 1hr prior</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full py-3.5 rounded-2xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>
                    {selectedSlot 
                      ? `Book Selected Slot (${formatTime(selectedSlot.startTime)})`
                      : availability.status !== 'available_now' && availability.nextSlot
                      ? `Book Next Available (${availability.nextSlot.time})`
                      : 'Book Instant Pass'}
                  </span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={scrollToCalendar}
                    className="w-full py-2.5 rounded-2xl bg-[#FFF9F4] dark:bg-[#07383D] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] border border-[#E2ECEB] dark:border-[#166D74] text-xs font-semibold text-[#5D7A7D] dark:text-[#B8D1D0] hover:text-[#12383B] dark:hover:text-white flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-[#FFA987]" />
                    <span>Choose Dates</span>
                  </button>

                  <button
                    type="button"
                    id="space-details-availability-alert-btn"
                    onClick={() => openAvailabilityAlertModal(selectedSpace, selectedSlot ? { startDate: selectedSlot.date } : undefined)}
                    className="w-full py-2.5 rounded-2xl bg-[#FFA987]/15 dark:bg-[#FFA987]/10 hover:bg-[#FFA987]/25 border border-[#FFA987]/30 text-xs font-semibold text-[#C05621] dark:text-[#FFA987] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    title="Get SMS/Email alert when this space is free"
                  >
                    <Bell className="w-3.5 h-3.5 text-[#FFA987]" />
                    <span>Alert When Free</span>
                  </button>
                </div>
              </div>

              {/* Host Contact Quick Link */}
              <div className="pt-4 border-t border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <img 
                    src={selectedSpace.host.avatar} 
                    alt={selectedSpace.host.name} 
                    className="w-9 h-9 rounded-xl object-cover border border-[#14BEB8]/50" 
                  />
                  <div>
                    <div className="font-bold text-[#12383B] dark:text-white">{selectedSpace.host.name}</div>
                    <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">{selectedSpace.host.companyName}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setContactSpace(selectedSpace);
                    setIsContactOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0B4A50] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] text-xs font-semibold text-[#006B70] dark:text-[#28D2CB] border border-[#E2ECEB] dark:border-[#166D74] cursor-pointer shadow-2xs"
                >
                  Contact
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* 3. PERSISTENT STICKY BOOKING BAR */}
      <StickyBookingBar
        space={selectedSpace}
        formatPrice={formatPrice}
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot ? formatTime(selectedSlot.startTime) : undefined}
        nextSlot={availability.nextSlot}
        isAvailableNow={availability.status === 'available_now'}
        onBookNow={handleBookNow}
        onContactHost={() => {
          setContactSpace(selectedSpace);
          setIsContactOpen(true);
        }}
        onDirections={() => {
          setDirectionsSpace(selectedSpace);
          setIsDirectionsOpen(true);
        }}
      />

    </div>
  );
};
