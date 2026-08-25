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
          <div className="flex items-center space-x-2 text-[#F2F2F2] font-mono text-[11px] font-bold tracking-wider uppercase">
            <History className="w-3.5 h-3.5 text-[#00C878]" />
            <span>Continue Browsing</span>
          </div>
          <p className="text-xs text-[#718079] mt-0.5">
            Workspaces you recently explored
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={clearRecentlyViewed}
            className="text-[11px] font-mono text-[#718079] hover:text-[#F2F2F2] flex items-center space-x-1 hover:underline transition-colors mr-2"
            aria-label="Clear recently viewed history"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Carousel Arrows */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-[#141816] hover:bg-[#1E2522] border border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2] transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-[#141816] hover:bg-[#1E2522] border border-[#232D28] text-[#9EABA3] hover:text-[#F2F2F2] transition-colors"
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
