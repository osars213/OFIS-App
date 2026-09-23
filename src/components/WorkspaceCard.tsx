import React from 'react';
import { Space } from '../types';
import { useApp } from '../context/AppContext';
import { CATEGORY_METADATA } from '../mockData';
import { getSpaceAvailability } from '../utils/availability';
import { getCategoryLabel, formatSpaceRate, getSpacePricing } from '../utils/pricing';
import { formatLocationShort } from '../utils/location';
import { 
  Star, 
  MapPin, 
  Users, 
  Zap, 
  Heart, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Activity,
  ArrowLeftRight,
  Bell,
  Wifi
} from 'lucide-react';

interface WorkspaceCardProps {
  space: Space;
  layout?: 'grid' | 'carousel' | 'compact';
  badgeLabel?: string;
  badgeType?: 'match' | 'category' | 'recent' | 'verified';
  onBookDirect?: (space: Space) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  space,
  layout = 'grid',
  badgeLabel,
  badgeType,
  onBookDirect,
}) => {
  const {
    setSelectedSpaceId,
    setCurrentView,
    savedSpaceIds,
    toggleSaveSpace,
    setCheckoutSpace,
    setIsCheckoutOpen,
    openQuickBook,
    formatPrice,
    comparedSpaceIds,
    toggleSpaceCompare,
    openAvailabilityAlertModal,
  } = useApp();

  const isSaved = savedSpaceIds.includes(space.id);
  const isCompared = comparedSpaceIds.includes(space.id);
  const categoryBadge = getCategoryLabel(space.category);
  const pricing = getSpacePricing(space);
  const availability = getSpaceAvailability(space);

  const handleCardClick = () => {
    setSelectedSpaceId(space.id);
    setCurrentView('details');
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookDirect) {
      onBookDirect(space);
    } else {
      setCheckoutSpace(space);
      setIsCheckoutOpen(true);
    }
  };

  const handleQuickBookNextSlot = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (availability.nextSlot) {
      openQuickBook(space, {
        date: availability.nextSlot.date,
        startTime: availability.nextSlot.time,
      });
    } else {
      openQuickBook(space);
    }
  };

  const isCarousel = layout === 'carousel';

  return (
    <div
      id={`workspace-card-${space.id}`}
      className={`group bg-white dark:bg-[#0B4A50] rounded-3xl border border-[#E2ECEB] dark:border-[#166D74] hover:border-[#14BEB8]/60 overflow-hidden shadow-sm dark:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${
        isCarousel ? 'w-[285px] sm:w-[330px] shrink-0' : 'w-full'
      }`}
    >
      {/* Card Image with 24px top radius */}
      <div 
        className="relative aspect-[16/10] overflow-hidden bg-[#F3F6F5] dark:bg-[#07383D] cursor-pointer" 
        onClick={handleCardClick}
      >
        <img
          src={space.featuredImage}
          alt={space.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80';
          }}
        />

        {/* Subtle Dark Gradient Overlay for optimal badge and text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        {/* Top Badges (Category & Featured / Superhost) */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 max-w-[80%]">
          {badgeLabel ? (
            <span className="px-2.5 py-1 rounded-xl bg-[#FFA987] text-[#12383B] text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#12383B]" />
              <span>{badgeLabel}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-black/65 backdrop-blur-md border border-white/20 text-[10px] font-semibold tracking-wide text-[#28D2CB] uppercase">
              {categoryBadge}
            </span>
          )}

          {space.isSuperhost && (
            <span className="px-2.5 py-1 rounded-xl bg-[#FFA987] text-[#12383B] text-[10px] font-bold uppercase tracking-wide shadow-xs">
              Superhost
            </span>
          )}
        </div>

        {/* Action Buttons: Compare, Alert & Favorite */}
        <div className="absolute top-3.5 right-3.5 flex items-center space-x-1.5 z-10">
          <button
            type="button"
            id={`alert-btn-${space.id}`}
            onClick={(e) => {
              e.stopPropagation();
              openAvailabilityAlertModal(space);
            }}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white hover:text-[#FFA987] transition-all cursor-pointer shadow-xs active:scale-95"
            aria-label="Set availability alert"
            title="Alert me via SMS/Email when available for specific dates"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id={`compare-btn-${space.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSpaceCompare(space.id);
            }}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-xs active:scale-95 ${
              isCompared
                ? 'bg-[#14BEB8] text-white border-[#14BEB8]'
                : 'bg-black/60 hover:bg-black/80 border-white/20 text-white hover:text-[#14BEB8]'
            }`}
            aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
            title={isCompared ? 'Remove from comparison list' : 'Add to comparison list'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveSpace(space.id);
            }}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white hover:text-[#FFA987] transition-all cursor-pointer shadow-xs active:scale-95"
            aria-label="Save to favorites"
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#FFA987] text-[#FFA987]' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Badges: Live Status & Location */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
          {/* Location Tag */}
          <div className="flex items-center space-x-1.5 text-[11px] text-white bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 truncate max-w-[55%] shadow-xs">
            <MapPin className="w-3 h-3 text-[#FFA987] shrink-0" />
            <span className="font-semibold truncate">{formatLocationShort(space)}</span>
          </div>

          {/* Live Availability Status Pill */}
          <div 
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md text-[11px] font-semibold tracking-wide border shrink-0 shadow-xs ${
              availability.status === 'available_now'
                ? 'bg-[#07383D]/90 text-[#28D2CB] border-[#14BEB8]/60'
                : availability.status === 'available_today'
                ? 'bg-[#07383D]/90 text-[#FFA987] border-[#FFA987]/50'
                : 'bg-black/75 text-[#B8D1D0] border-white/20'
            }`}
          >
            {availability.status === 'available_now' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14BEB8] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14BEB8]" />
              </span>
            )}
            {availability.status === 'available_today' && (
              <span className="inline-flex rounded-full h-1.5 w-1.5 bg-[#FFA987]" />
            )}
            <span>{availability.statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Card Content with Generous Internal Spacing */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2.5">
          {/* Workspace Name */}
          <h3
            onClick={handleCardClick}
            className="text-base sm:text-lg font-bold text-[#12383B] dark:text-white group-hover:text-[#006B70] dark:group-hover:text-[#28D2CB] cursor-pointer transition-colors line-clamp-1 leading-snug"
          >
            {space.title}
          </h3>

          {/* Next Available Slot Banner (If not available right now) */}
          {availability.nextSlot && availability.status !== 'available_now' && (
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74]">
              <div className="flex items-center space-x-1.5 text-[#5D7A7D] dark:text-[#B8D1D0]">
                <Clock className="w-3.5 h-3.5 text-[#14BEB8] shrink-0" />
                <span className="text-[11px] font-medium">Next Available:</span>
              </div>
              <span className="font-bold text-xs text-[#12383B] dark:text-white">
                {availability.nextSlot.label}
              </span>
            </div>
          )}

          {/* Core Amenities Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {space.isVerified !== false && (
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#14BEB8]/15 dark:bg-[#14BEB8]/20 border border-[#14BEB8]/30 text-[10px] font-bold text-[#006B70] dark:text-[#28D2CB]">
                <ShieldCheck className="w-3 h-3 text-[#14BEB8] shrink-0" />
                <span>Verified</span>
              </div>
            )}

            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#F3F6F5] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-[10px] font-medium text-[#5D7A7D] dark:text-[#B8D1D0]">
              <Wifi className="w-3 h-3 text-[#14BEB8] shrink-0" />
              <span>{space.internetSpeedMbps ? `${space.internetSpeedMbps} Mbps` : 'Fiber'}</span>
            </div>

            {space.hasBackupPower && (
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#F3F6F5] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-[10px] font-medium text-[#5D7A7D] dark:text-[#B8D1D0]">
                <Zap className="w-3 h-3 text-[#FFA987] shrink-0" />
                <span>24/7 Power</span>
              </div>
            )}

            {availability.occupancyLabel && (
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#F3F6F5] dark:bg-[#07383D] border border-[#E2ECEB] dark:border-[#166D74] text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0]">
                <Activity className={`w-3 h-3 ${availability.occupancyLevel === 'low' ? 'text-[#14BEB8]' : 'text-[#5D7A7D] dark:text-[#B8D1D0]'}`} />
                <span>{availability.occupancyLabel}</span>
              </div>
            )}
          </div>

          {/* Key Specs Row: Capacity & Rating */}
          <div className="flex items-center justify-between text-xs text-[#5D7A7D] dark:text-[#B8D1D0] pt-1">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-[#14BEB8]" />
              <span className="font-semibold text-[#12383B] dark:text-[#B8D1D0]">
                {space.category === 'meeting' 
                  ? `${space.capacity} Seats` 
                  : space.category === 'event' 
                  ? `${space.capacity} Hall` 
                  : `Up to ${space.capacity}`}
              </span>
            </div>

            <div className="flex items-center space-x-1 text-[#12383B] dark:text-white">
              <Star className="w-3.5 h-3.5 fill-[#FFA987] text-[#FFA987]" />
              <span className="font-bold text-xs">{space.rating}</span>
              <span className="text-[#5D7A7D] dark:text-[#B8D1D0] text-[11px]">({space.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Price & Actions Row */}
        <div className="pt-3 border-t border-[#E2ECEB] dark:border-[#166D74] flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-[#5D7A7D] dark:text-[#B8D1D0] uppercase tracking-wider font-semibold">
              {pricing.basis === 'person' ? 'Per Person' : 'Rate'}
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base sm:text-lg font-bold text-[#006B70] dark:text-[#28D2CB] font-mono tracking-tight">
                {formatPrice(pricing.rate)}
              </span>
              <span className="text-xs text-[#5D7A7D] dark:text-[#B8D1D0]">/ {pricing.period}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCardClick}
              className="px-3.5 py-2 rounded-xl bg-[#FFF9F4] dark:bg-[#07383D] hover:bg-[#F3F6F5] dark:hover:bg-[#105A60] text-xs font-semibold text-[#12383B] dark:text-white border border-[#E2ECEB] dark:border-[#166D74] transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              Details
            </button>
            
            {/* Quick Book Button with Primary Teal styling */}
            {availability.status !== 'available_now' && availability.nextSlot ? (
              <button
                type="button"
                onClick={handleQuickBookNextSlot}
                className="px-3.5 py-2 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-xs font-bold text-white transition-all flex items-center space-x-1 active:scale-95 shadow-sm whitespace-nowrap cursor-pointer"
                title={`Quick book slot: ${availability.nextSlot.label}`}
              >
                <span>Book Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBookClick}
                className="px-3.5 py-2 rounded-xl bg-[#14BEB8] hover:bg-[#0EA8A2] text-xs font-bold text-white transition-all flex items-center space-x-1 active:scale-95 shadow-sm cursor-pointer"
              >
                <span>Book</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
