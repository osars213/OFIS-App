import React from 'react';
import { Space } from '../types';
import { useApp } from '../context/AppContext';
import { CATEGORY_METADATA } from '../mockData';
import { getSpaceAvailability } from '../utils/availability';
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
  ArrowLeftRight
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
  } = useApp();

  const isSaved = savedSpaceIds.includes(space.id);
  const isCompared = comparedSpaceIds.includes(space.id);
  const categoryBadge = CATEGORY_METADATA[space.category]?.label || 'Workspace';
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
      className={`group bg-[#141816] rounded-2xl border border-[#1E2522] hover:border-[#00C878]/50 overflow-hidden shadow-lg transition-all duration-200 flex flex-col justify-between ${
        isCarousel ? 'w-[280px] sm:w-[320px] shrink-0' : 'w-full'
      }`}
    >
      {/* Card Image */}
      <div 
        className="relative aspect-[16/10] overflow-hidden bg-[#1A201D] cursor-pointer" 
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

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141816]/95 via-transparent to-black/40" />

        {/* Top Badges (Category & Superhost) */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[80%]">
          {badgeLabel ? (
            <span className="px-2.5 py-1 rounded-lg bg-[#00C878] text-[#0D0D0D] text-[10px] font-mono font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{badgeLabel}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-[#0D0D0D]/85 backdrop-blur-md border border-[#232D28] text-[10px] font-mono font-bold tracking-wider text-[#00C878] uppercase">
              {categoryBadge}
            </span>
          )}

          {space.isSuperhost && (
            <span className="px-2 py-1 rounded-lg bg-[#00C878]/90 text-[#0D0D0D] text-[10px] font-mono font-bold uppercase tracking-wider">
              Superhost
            </span>
          )}
        </div>

        {/* Action Buttons: Compare & Favorite */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
          <button
            type="button"
            id={`compare-btn-${space.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSpaceCompare(space.id);
            }}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
              isCompared
                ? 'bg-[#00C878] text-[#0D0D0D] border-[#00C878] shadow-md'
                : 'bg-[#0D0D0D]/80 border-[#232D28] text-[#F2F2F2] hover:text-[#00C878]'
            }`}
            aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
            title={isCompared ? 'Remove from comparison list' : 'Add to comparison list'}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveSpace(space.id);
            }}
            className="p-2 rounded-xl bg-[#0D0D0D]/80 backdrop-blur-md border border-[#232D28] text-[#F2F2F2] hover:text-[#00C878] transition-all cursor-pointer"
            aria-label="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#00C878] text-[#00C878]' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Badges: Live Status & Location */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Location Tag */}
          <div className="flex items-center space-x-1.5 text-[11px] text-[#F2F2F2] bg-[#0D0D0D]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#232D28] truncate max-w-[55%]">
            <MapPin className="w-3 h-3 text-[#00C878] shrink-0" />
            <span className="font-semibold truncate">{space.neighborhood}, {space.city}</span>
          </div>

          {/* 1. Live Availability Status Pill */}
          <div 
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-mono font-semibold tracking-wide border shrink-0 ${
              availability.status === 'available_now'
                ? 'bg-[#00C878]/20 text-[#00C878] border-[#00C878]/40'
                : availability.status === 'available_today'
                ? 'bg-[#00C878]/15 text-[#00C878] border-[#00C878]/25'
                : 'bg-[#18201B]/90 text-[#9EABA3] border-[#2E3B34]'
            }`}
          >
            {availability.status === 'available_now' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C878] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C878]" />
              </span>
            )}
            {availability.status === 'available_today' && (
              <span className="inline-flex rounded-full h-1.5 w-1.5 bg-[#00C878]" />
            )}
            <span>{availability.statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          {/* Space Name */}
          <h3
            onClick={handleCardClick}
            className="text-base font-bold text-[#F2F2F2] group-hover:text-[#00C878] cursor-pointer transition-colors line-clamp-1 leading-snug"
          >
            {space.title}
          </h3>

          {/* 2. Next Available Slot Banner (If not available right now) */}
          {availability.nextSlot && availability.status !== 'available_now' && (
            <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-[#18201B] border border-[#232D28]">
              <div className="flex items-center space-x-1.5 text-[#9EABA3]">
                <Clock className="w-3.5 h-3.5 text-[#00C878] shrink-0" />
                <span className="text-[11px]">Next Available:</span>
              </div>
              <span className="font-mono font-bold text-xs text-[#F2F2F2]">
                {availability.nextSlot.label}
              </span>
            </div>
          )}

          {/* 3. Occupancy Indicator & Confidence row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {/* Occupancy Indicator (gracefully hidden if none exists) */}
            {availability.occupancyLabel && (
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#18201B] border border-[#232D28] text-[10px] font-mono text-[#9EABA3]">
                <Activity className={`w-3 h-3 ${availability.occupancyLevel === 'low' ? 'text-[#00C878]' : 'text-[#9EABA3]'}`} />
                <span>{availability.occupancyLabel}</span>
              </div>
            )}

            {/* Confidence Badges */}
            {availability.confidenceBadges.map((badgeLabel, idx) => (
              <div
                key={idx}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#18201B] border border-[#232D28] text-[10px] font-medium text-[#9EABA3]"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-[#00C878] shrink-0" />
                <span>{badgeLabel}</span>
              </div>
            ))}
          </div>

          {/* Key Specs Row: Capacity, Power, Rating */}
          <div className="flex items-center justify-between text-xs text-[#9EABA3] pt-1">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-[#00C878]" />
              <span className="font-medium">
                {space.category === 'meeting' 
                  ? `${space.capacity} Seats` 
                  : space.category === 'event' 
                  ? `${space.capacity} Hall` 
                  : `Up to ${space.capacity}`}
              </span>
            </div>
            
            {space.hasBackupPower && (
              <div className="flex items-center space-x-1 text-[#00C878]">
                <Zap className="w-3.5 h-3.5 text-[#00C878]" />
                <span className="text-[11px] font-medium text-[#9EABA3]">24/7 Power</span>
              </div>
            )}

            <div className="flex items-center space-x-1 text-[#F2F2F2]">
              <Star className="w-3.5 h-3.5 fill-[#00C878] text-[#00C878]" />
              <span className="font-bold text-xs">{space.rating}</span>
              <span className="text-[#718079] text-[11px]">({space.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Price & Actions Row */}
        <div className="pt-3 border-t border-[#1E2522] flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-[#718079] uppercase tracking-wider font-mono font-semibold">Rate</div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base sm:text-lg font-black text-[#00C878] font-mono">
                {formatPrice(space.pricePerHour)}
              </span>
              <span className="text-xs text-[#9EABA3]">/ hour</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCardClick}
              className="px-3 py-2 rounded-xl bg-[#18201B] hover:bg-[#232D28] text-xs font-semibold text-[#F2F2F2] border border-[#232D28] transition-all"
            >
              Details
            </button>
            
            {/* Quick Book Button */}
            {availability.status !== 'available_now' && availability.nextSlot ? (
              <button
                type="button"
                onClick={handleQuickBookNextSlot}
                className="px-3 py-2 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-xs font-bold text-[#0D0D0D] transition-all flex items-center space-x-1 active:scale-95 shadow-md whitespace-nowrap"
                title={`Quick book slot: ${availability.nextSlot.label}`}
              >
                <span>Book Next Available</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBookClick}
                className="px-3.5 py-2 rounded-xl bg-[#00C878] hover:bg-[#00E58B] text-xs font-bold text-[#0D0D0D] transition-all flex items-center space-x-1 active:scale-95 shadow-md"
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
