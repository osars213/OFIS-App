import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { recommendationsService } from '../services/recommendationsService';
import { WorkspaceCard } from './WorkspaceCard';
import { RecommendationSectionSkeleton } from './RecommendationSkeleton';
import { History, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export const ContinueBrowsingSection: React.FC = () => {
  const {
    allSpaces,
    recentlyViewedIds,
    bookings,
    clearRecentlyViewed,
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const continueSpaces = useMemo(() => {
    return recommendationsService.getContinueBrowsingSpaces(
      allSpaces,
      recentlyViewedIds,
      bookings
    );
  }, [allSpaces, recentlyViewedIds, bookings]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <RecommendationSectionSkeleton title="Continue browsing" count={3} isCarousel={true} />;
  }

  // Hide completely if no browsing history
  if (!continueSpaces || continueSpaces.length === 0) {
    return null;
  }

  return (
    <section id="continue-browsing-section" className="space-y-3.5 pt-2">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[#111827] dark:text-[#F9FAFB] font-mono text-[11px] font-bold tracking-wider uppercase">
            <History className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Continue Browsing</span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Workspaces you recently explored
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={clearRecentlyViewed}
            className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] flex items-center space-x-1 hover:underline transition-colors mr-2 cursor-pointer"
            aria-label="Clear recently viewed history"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Carousel Arrows */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors shadow-2xs cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#F1F5F9] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors shadow-2xs cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-1 scroll-smooth snap-x"
      >
        {continueSpaces.map((space) => (
          <div key={`viewed-${space.id}`} className="snap-start">
            <WorkspaceCard
              space={space}
              layout="carousel"
              badgeLabel="Recently Viewed"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
