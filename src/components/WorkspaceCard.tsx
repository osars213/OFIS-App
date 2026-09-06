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
      className={`group bg-white dark:bg-[#172033] rounded-[20px] border border-[#E5E7EB] dark:border-[#1E293B] hover:border-[#10B981]/50 overflow-hidden shadow-2xs dark:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-2xl flex flex-col justify-between ${
        isCarousel ? 'w-[285px] sm:w-[330px] shrink-0' : 'w-full'
      }`}
    >
      {/* Card Image with 18-20px top radius */}
      <div 
        className="relative aspect-[16/10] overflow-hidden bg-[#F1F5F9] dark:bg-[#0B1220] cursor-pointer" 
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

        {/* Top Badges (Category & Superhost) */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 max-w-[80%]">
          {badgeLabel ? (
            <span className="px-2.5 py-1 rounded-lg bg-[#10B981] text-white text-[10px] font-semibold tracking-wide uppercase flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>{badgeLabel}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md border border-white/20 text-[10px] font-semibold tracking-wide text-[#34D399] uppercase">
              {categoryBadge}
            </span>
          )}

          {space.isSuperhost && (
            <span className="px-2.5 py-1 rounded-lg bg-[#10B981] text-white text-[10px] font-semibold uppercase tracking-wide shadow-xs">
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
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white hover:text-[#34D399] transition-all cursor-pointer shadow-xs active:scale-95"
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
                ? 'bg-[#10B981] text-white border-[#10B981]'
                : 'bg-black/60 hover:bg-black/80 border-white/20 text-white hover:text-[#34D399]'
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
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white hover:text-[#34D399] transition-all cursor-pointer shadow-xs active:scale-95"
            aria-label="Save to favorites"
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#10B981] text-[#10B981]' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Badges: Live Status & Location */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
          {/* Location Tag */}
          <div className="flex items-center space-x-1.5 text-[11px] text-white bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 truncate max-w-[55%] shadow-xs">
            <MapPin className="w-3 h-3 text-[#34D399] shrink-0" />
            <span className="font-semibold truncate">{formatLocationShort(space)}</span>
          </div>

          {/* Live Availability Status Pill */}
          <div 
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-medium tracking-wide border shrink-0 shadow-xs ${
              availability.status === 'available_now'
                ? 'bg-black/75 text-[#34D399] border-[#10B981]/50'
                : availability.status === 'available_today'
                ? 'bg-black/75 text-[#6EE7B7] border-[#10B981]/30'
                : 'bg-black/75 text-slate-300 border-white/20'
            }`}
          >
            {availability.status === 'available_now' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
              </span>
            )}
            {availability.status === 'available_today' && (
              <span className="inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]" />
            )}
            <span>{availability.statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Card Content with Generous Internal Padding (p-4 sm:p-5) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2.5">
          {/* Workspace Name */}
          <h3
            onClick={handleCardClick}
            className="text-base sm:text-lg font-bold text-[#111827] dark:text-[#F8FAFC] group-hover:text-[#10B981] cursor-pointer transition-colors line-clamp-1 leading-snug"
          >
            {space.title}
          </h3>

          {/* Next Available Slot Banner (If not available right now) */}
          {availability.nextSlot && availability.status !== 'available_now' && (
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#101827] border border-[#E5E7EB] dark:border-[#1E293B]">
              <div className="flex items-center space-x-1.5 text-[#6B7280] dark:text-[#94A3B8]">
                <Clock className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span className="text-[11px] font-medium">Next Available:</span>
              </div>
              <span className="font-bold text-xs text-[#111827] dark:text-[#F8FAFC]">
                {availability.nextSlot.label}
              </span>
            </div>
          )}

          {/* Core Amenities Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {space.isVerified !== false && (
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#D1FAE5] dark:bg-[#101827] border border-[#10B981]/30 dark:border-[#1E293B] text-[10px] font-semibold text-[#10B981]">
                <ShieldCheck className="w-3 h-3 text-[#10B981] shrink-0" />
                <span>Verified</span>
              </div>
            )}

            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#101827] border border-[#E5E7EB] dark:border-[#1E293B] text-[10px] font-medium text-[#4B5563] dark:text-[#94A3B8]">
              <Wifi className="w-3 h-3 text-[#10B981] shrink-0" />
              <span>{space.internetSpeedMbps ? `${space.internetSpeedMbps} Mbps` : 'Fast Internet'}</span>
            </div>

            {space.hasBackupPower && (
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#101827] border border-[#E5E7EB] dark:border-[#1E293B] text-[10px] font-medium text-[#4B5563] dark:text-[#94A3B8]">
                <Zap className="w-3 h-3 text-[#10B981] shrink-0" />
                <span>24/7 Power</span>
              </div>
            )}

            {availability.occupancyLabel && (
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#101827] border border-[#E5E7EB] dark:border-[#1E293B] text-[10px] text-[#6B7280] dark:text-[#94A3B8]">
                <Activity className={`w-3 h-3 ${availability.occupancyLevel === 'low' ? 'text-[#10B981]' : 'text-[#6B7280] dark:text-[#94A3B8]'}`} />
                <span>{availability.occupancyLabel}</span>
              </div>
            )}
          </div>

          {/* Key Specs Row: Capacity & Rating */}
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#94A3B8] pt-1">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="font-medium text-[#4B5563] dark:text-[#CBD5E1]">
                {space.category === 'meeting' 
                  ? `${space.capacity} Seats` 
                  : space.category === 'event' 
                  ? `${space.capacity} Hall` 
                  : `Up to ${space.capacity}`}
              </span>
            </div>

            <div className="flex items-center space-x-1 text-[#111827] dark:text-[#F8FAFC]">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-bold text-xs">{space.rating}</span>
              <span className="text-[#6B7280] dark:text-[#94A3B8] text-[11px]">({space.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Price & Actions Row */}
        <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-semibold">
              {pricing.basis === 'person' ? 'Per Person' : 'Rate'}
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base sm:text-lg font-bold text-[#10B981]">
                {formatPrice(pricing.rate)}
              </span>
              <span className="text-xs text-[#6B7280] dark:text-[#94A3B8]">/ {pricing.period}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCardClick}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#101827] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-xs font-semibold text-[#111827] dark:text-[#F8FAFC] border border-[#E5E7EB] dark:border-[#1E293B] transition-all cursor-pointer shadow-2xs"
            >
              Details
            </button>
            
            {/* Quick Book Button */}
            {availability.status !== 'available_now' && availability.nextSlot ? (
              <button
                type="button"
                onClick={handleQuickBookNextSlot}
                className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-white transition-all flex items-center space-x-1 active:scale-95 shadow-sm whitespace-nowrap cursor-pointer"
                title={`Quick book slot: ${availability.nextSlot.label}`}
              >
                <span>Book Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBookClick}
                className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-white transition-all flex items-center space-x-1 active:scale-95 shadow-sm cursor-pointer"
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
