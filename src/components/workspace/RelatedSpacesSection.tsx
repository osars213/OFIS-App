import React, { useMemo } from 'react';
import { Space } from '../../types';
import { WorkspaceCard } from '../WorkspaceCard';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RelatedSpacesSectionProps {
  currentSpace: Space;
  allSpaces: Space[];
  onSelectSpace?: (spaceId: string) => void;
}

export const RelatedSpacesSection: React.FC<RelatedSpacesSectionProps> = ({
  currentSpace,
  allSpaces,
  onSelectSpace,
}) => {
  const recommendations = useMemo(() => {
    const otherSpaces = allSpaces.filter((s) => s.id !== currentSpace.id);

    // Score other spaces based on multiple affinity signals
    const scored = otherSpaces.map((s) => {
      let score = 0;

      // 1. Same neighborhood (+40 points)
      if (s.neighborhood && currentSpace.neighborhood && s.neighborhood.toLowerCase() === currentSpace.neighborhood.toLowerCase()) {
        score += 40;
      }
      // 2. Same city (+20 points)
      if (s.city && currentSpace.city && s.city.toLowerCase() === currentSpace.city.toLowerCase()) {
        score += 20;
      }
      // 3. Same category (+30 points)
      if (s.category === currentSpace.category) {
        score += 30;
      }
      // 4. Comparable price range (within 35%) (+15 points)
      const priceDiff = Math.abs(s.pricePerHour - currentSpace.pricePerHour) / currentSpace.pricePerHour;
      if (priceDiff < 0.35) {
        score += 15;
      }
      // 5. Superhost & verified boost (+10 points)
      if (s.isSuperhost) score += 10;
      if (s.isVerified) score += 5;

      return { space: s, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 3).map((item) => item.space);
  }, [currentSpace, allSpaces]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4 pt-8 border-t border-[#1E2522]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-[#F2F2F2]">You May Also Like</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#00C878]/10 text-[10px] font-mono font-bold text-[#00C878] border border-[#00C878]/20 flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Smart Match</span>
            </span>
          </div>
          <p className="text-xs text-[#9EABA3]">
            Curated alternatives in {currentSpace.neighborhood || currentSpace.city} with verified power & fiber
          </p>
        </div>
      </div>

      {/* Grid of Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {recommendations.map((recSpace) => (
          <WorkspaceCard
            key={recSpace.id}
            space={recSpace}
            layout="grid"
            badgeLabel={recSpace.neighborhood === currentSpace.neighborhood ? 'Nearby' : undefined}
          />
        ))}
      </div>
    </div>
  );
};
