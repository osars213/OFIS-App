import React from 'react';

export const WorkspaceCardSkeleton: React.FC<{ layout?: 'grid' | 'carousel' }> = ({ layout = 'grid' }) => {
  const isCarousel = layout === 'carousel';
  return (
    <div
      className={`bg-[#141816] rounded-2xl border border-[#1E2522] overflow-hidden shadow-lg animate-pulse flex flex-col justify-between ${
        isCarousel ? 'w-[280px] sm:w-[320px] shrink-0' : 'w-full'
      }`}
    >
      {/* Image Skeleton */}
      <div className="relative aspect-[16/10] bg-[#1C231F]" />

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="space-y-2">
          <div className="h-5 bg-[#232D28] rounded-md w-3/4" />
          <div className="flex justify-between pt-1">
            <div className="h-3.5 bg-[#1F2722] rounded w-1/4" />
            <div className="h-3.5 bg-[#1F2722] rounded w-1/4" />
            <div className="h-3.5 bg-[#1F2722] rounded w-1/4" />
          </div>
        </div>

        <div className="pt-3 border-t border-[#1E2522] flex items-center justify-between">
          <div className="h-6 bg-[#232D28] rounded w-1/3" />
          <div className="flex gap-2">
            <div className="h-8 bg-[#1F2722] rounded-xl w-14" />
            <div className="h-8 bg-[#232D28] rounded-xl w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const RecommendationSectionSkeleton: React.FC<{ title?: string; count?: number; isCarousel?: boolean }> = ({
  title = 'Curating recommendations...',
  count = 3,
  isCarousel = false,
}) => {
  return (
    <section className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-4 bg-[#232D28] rounded w-32 animate-pulse" />
          <div className="h-3 bg-[#1C231F] rounded w-48 animate-pulse" />
        </div>
      </div>

      {isCarousel ? (
        <div className="flex gap-4 overflow-hidden py-1">
          {Array.from({ length: count }).map((_, idx) => (
            <WorkspaceCardSkeleton key={idx} layout="carousel" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: count }).map((_, idx) => (
            <WorkspaceCardSkeleton key={idx} layout="grid" />
          ))}
        </div>
      )}
    </section>
  );
};
