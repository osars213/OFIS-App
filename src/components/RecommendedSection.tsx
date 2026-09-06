import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { recommendationsService } from '../services/recommendationsService';
import { WorkspaceCard } from './WorkspaceCard';
import { RecommendationSectionSkeleton } from './RecommendationSkeleton';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';

export const RecommendedSection: React.FC = () => {
  const {
    allSpaces,
    bookings,
    recentlyViewedIds,
    savedSpaceIds,
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate lightweight instant personalization resolution
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const recommendedSpaces = useMemo(() => {
    const list = recommendationsService.getRecommendedSpaces(
      allSpaces,
      bookings,
      recentlyViewedIds,
      savedSpaceIds
    );
    // Take top 3 curated recommended spaces
    return list.slice(0, 3);
  }, [allSpaces, bookings, recentlyViewedIds, savedSpaceIds]);

  if (isLoading) {
    return <RecommendationSectionSkeleton count={3} />;
  }

  if (!recommendedSpaces || recommendedSpaces.length === 0) {
    return null;
  }

  // Determine personalization rationale for subtitle
  let rationale = "Curated verified workspaces with high-speed power & connectivity";
  if (bookings.length > 0) {
    rationale = "Personalized based on your previous bookings & workspace preferences";
  } else if (recentlyViewedIds.length > 0) {
    rationale = "Curated from your recent browsing & category interest";
  } else if (savedSpaceIds.length > 0) {
    rationale = "Tailored to your saved hubs & favorite workspace types";
  }

  return (
    <section id="recommended-for-you-section" className="space-y-4 pt-1">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5">
        <div>
          <div className="flex items-center space-x-2 text-[#16A34A] font-mono text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Recommended for You</span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 max-w-xl">
            {rationale}
          </p>
        </div>
      </div>

      {/* Recommended Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendedSpaces.map((space, idx) => {
          const matchLabel = idx === 0 ? 'Top Pick' : idx === 1 ? '98% Match' : 'Recommended';
          return (
            <WorkspaceCard
              key={`rec-${space.id}`}
              space={space}
              layout="grid"
              badgeLabel={matchLabel}
            />
          );
        })}
      </div>
    </section>
  );
};
