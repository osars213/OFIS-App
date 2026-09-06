import { Space, SearchFilters, Booking, SavedComparison, WorkspaceComparisonDifference } from '../types';
import { storage } from './storageService';

const SAVED_COMPARISONS_KEY = 'saved_comparisons_list';

export const compareService = {
  // --- SAVED COMPARISONS ---
  getSavedComparisons: (): SavedComparison[] => {
    return storage.get<SavedComparison[]>(SAVED_COMPARISONS_KEY, [
      {
        id: 'comp-sample-1',
        title: 'Victoria Island Premium Hubs',
        spaceIds: ['space-1', 'space-2'],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        spacesCount: 2,
        highlightSummary: 'Leadspace vs Capital Square — Comparing 300 Mbps Fiber and Instant Booking',
      }
    ]);
  },

  saveComparison: (spaces: Space[], customTitle?: string): SavedComparison => {
    const existing = compareService.getSavedComparisons();
    const spaceIds = spaces.map(s => s.id);
    
    const title = customTitle && customTitle.trim()
      ? customTitle.trim()
      : `${spaces[0]?.neighborhood || spaces[0]?.city || 'Workspace'} Comparison (${spaces.length} spaces)`;

    const highlightSummary = spaces.map(s => s.title).join(' vs ');

    const newComparison: SavedComparison = {
      id: `comp-${Date.now()}`,
      title,
      spaceIds,
      createdAt: new Date().toISOString(),
      spacesCount: spaces.length,
      highlightSummary,
    };

    const updated = [newComparison, ...existing.filter(c => c.id !== newComparison.id)];
    storage.set(SAVED_COMPARISONS_KEY, updated);
    return newComparison;
  },

  deleteSavedComparison: (id: string): SavedComparison[] => {
    const existing = compareService.getSavedComparisons();
    const updated = existing.filter(c => c.id !== id);
    storage.set(SAVED_COMPARISONS_KEY, updated);
    return updated;
  },

  // --- SMART MATCH SCORE (0 - 100%) ---
  calculateSmartMatchScore: (
    space: Space,
    filters?: SearchFilters,
    userBookings: Booking[] = []
  ): number => {
    let baseScore = 80;

    // 1. High-Performance fundamentals (+12 pts max)
    if (space.hasBackupPower) baseScore += 4;
    if (space.powerUptimeGuaranteePercent >= 99) baseScore += 2;
    if (space.internetSpeedMbps >= 100) baseScore += 3;
    if (space.isSuperhost) baseScore += 3;

    // 2. Rating factor (+6 pts max)
    if (space.rating >= 4.9) baseScore += 4;
    else if (space.rating >= 4.7) baseScore += 2;

    // 3. User filter alignment (if provided)
    if (filters) {
      // Category match
      if (filters.category !== 'all') {
        if (space.category === filters.category) baseScore += 4;
        else baseScore -= 5;
      }
      // City match
      if (filters.city && filters.city !== 'All Cities' && space.city) {
        if ((space.city || '').toLowerCase() === (filters.city || '').toLowerCase()) baseScore += 3;
        else baseScore -= 6;
      }
      // Price range
      if (filters.maxPrice > 0 && space.pricePerHour <= filters.maxPrice) {
        baseScore += 2;
      }
      // Capacity
      if (filters.minCapacity > 0 && space.capacity >= filters.minCapacity) {
        baseScore += 2;
      }
    }

    // 4. Booking history affinity
    const bookedCategory = userBookings.some(b => b.spaceCity === space.city);
    if (bookedCategory) baseScore += 2;

    // Deterministic small variance based on space ID to avoid identical scores
    const hash = space.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variance = (hash % 5) - 2; // -2 to +2

    const finalScore = Math.min(99, Math.max(78, baseScore + variance));
    return finalScore;
  },

  // --- "BEST FOR" CONTEXTUAL LABELS ---
  getBestForLabel: (space: Space, allCompared: Space[]): string => {
    if (!allCompared || allCompared.length <= 1) {
      if (space.category === 'meeting') return 'Best for Meetings';
      if (space.category === 'podcast' || space.category === 'photography') return 'Best for Creators';
      if (space.internetSpeedMbps >= 250) return 'Fastest Internet';
      if (space.rating >= 4.9) return 'Most Popular';
      return 'Verified Hub';
    }

    // Compare with others in the set
    const maxSpeed = Math.max(...allCompared.map(s => s.internetSpeedMbps || 0));
    const minPrice = Math.min(...allCompared.map(s => s.pricePerHour || 999999));
    const maxRating = Math.max(...allCompared.map(s => s.rating || 0));
    const maxCapacity = Math.max(...allCompared.map(s => s.capacity || 0));

    if (space.internetSpeedMbps === maxSpeed && maxSpeed > 150) {
      return 'Fastest Internet';
    }

    if (space.pricePerHour === minPrice) {
      return 'Best Value';
    }

    if (space.category === 'meeting' || (space.capacity === maxCapacity && maxCapacity > 10)) {
      return 'Best for Meetings';
    }

    if (space.category === 'podcast' || space.category === 'photography') {
      return 'Best for Creators';
    }

    if (space.noiseLevel === 'Silent / Library' || space.noiseLevel === 'Soundproofed Studio') {
      return 'Quietest Space';
    }

    if (space.rating === maxRating && space.reviewsCount >= 10) {
      return 'Most Popular';
    }

    if (space.instantBooking || space.availabilityStatus === 'available_now') {
      return 'Immediate Check-In';
    }

    return 'Verified Superhost';
  },

  // --- DIFFERENCE HIGHLIGHTS ---
  generateDifferenceHighlights: (spaces: Space[]): WorkspaceComparisonDifference[] => {
    if (!spaces || spaces.length < 2) return [];

    const differences: WorkspaceComparisonDifference[] = [];

    const minPriceSpace = [...spaces].sort((a, b) => a.pricePerHour - b.pricePerHour)[0];
    const maxSpeedSpace = [...spaces].sort((a, b) => (b.internetSpeedMbps || 0) - (a.internetSpeedMbps || 0))[0];
    const maxCapacitySpace = [...spaces].sort((a, b) => b.capacity - a.capacity)[0];
    const highestRatedSpace = [...spaces].sort((a, b) => b.rating - a.rating)[0];

    // 1. Price advantage
    if (minPriceSpace && spaces.length >= 2 && minPriceSpace.pricePerHour < (spaces.find(s => s.id !== minPriceSpace.id)?.pricePerHour || Infinity)) {
      differences.push({
        spaceId: minPriceSpace.id,
        spaceTitle: minPriceSpace.title,
        category: 'pricing',
        highlightText: `${minPriceSpace.title} is the most affordable at ₦${(minPriceSpace.pricePerHour || 0).toLocaleString()}/hr.`,
        isAdvantage: true,
      });
    }

    // 2. Internet speed advantage
    if (maxSpeedSpace && maxSpeedSpace.internetSpeedMbps > 100) {
      differences.push({
        spaceId: maxSpeedSpace.id,
        spaceTitle: maxSpeedSpace.title,
        category: 'internet',
        highlightText: `${maxSpeedSpace.title} leads in connectivity with ${maxSpeedSpace.internetSpeedMbps} Mbps (${maxSpeedSpace.internetIsp || 'Fiber'}).`,
        isAdvantage: true,
      });
    }

    // 3. Unique Amenities per space
    spaces.forEach(space => {
      const lowerAmenities = (space.amenities || []).map(a => a.toLowerCase());
      const otherSpaces = spaces.filter(s => s.id !== space.id);
      
      const hasParking = lowerAmenities.some(a => a.includes('parking'));
      const othersLackParking = otherSpaces.every(s => !(s.amenities || []).some(a => a.toLowerCase().includes('parking')));
      if (hasParking && othersLackParking) {
        differences.push({
          spaceId: space.id,
          spaceTitle: space.title,
          category: 'amenities',
          highlightText: `${space.title} exclusively includes secure on-site vehicle parking.`,
          isAdvantage: true,
        });
      }

      const hasCoffee = lowerAmenities.some(a => a.includes('coffee') || a.includes('cafe') || a.includes('tea'));
      const othersLackCoffee = otherSpaces.every(s => !(s.amenities || []).some(a => a.toLowerCase().includes('coffee') || a.toLowerCase().includes('cafe')));
      if (hasCoffee && othersLackCoffee) {
        differences.push({
          spaceId: space.id,
          spaceTitle: space.title,
          category: 'amenities',
          highlightText: `${space.title} provides complimentary brewed barista coffee & refreshments.`,
          isAdvantage: true,
        });
      }

      const isInstant = space.availabilityStatus === 'available_now' || space.instantBooking;
      const othersNotInstant = otherSpaces.every(s => s.availabilityStatus !== 'available_now' && !s.instantBooking);
      if (isInstant && othersNotInstant) {
        differences.push({
          spaceId: space.id,
          spaceTitle: space.title,
          category: 'availability',
          highlightText: `${space.title} is ready right now for instant contactless QR check-in.`,
          isAdvantage: true,
        });
      }
    });

    // 4. Capacity leader if significant difference
    if (maxCapacitySpace && spaces.some(s => s.capacity < maxCapacitySpace.capacity / 2)) {
      differences.push({
        spaceId: maxCapacitySpace.id,
        spaceTitle: maxCapacitySpace.title,
        category: 'capacity',
        highlightText: `${maxCapacitySpace.title} accommodates the largest group (${maxCapacitySpace.capacity} seats).`,
        isAdvantage: true,
      });
    }

    return differences;
  },

  // --- SHARE COMPARISON TEXT ---
  generateComparisonShareText: (spaces: Space[]): { title: string; text: string; url: string } => {
    const title = `OFIS Workspace Comparison (${spaces.length} Spaces)`;
    
    let text = `⚡ OFIS Workspace Comparison:\n\n`;
    spaces.forEach((s, idx) => {
      const perHour = s.pricePerHour || 0;
      const perDay = s.pricePerDay || perHour * 8;
      text += `${idx + 1}. ${s.title} (${s.neighborhood}, ${s.city})\n`;
      text += `   • Rate: ₦${perHour.toLocaleString()}/hr (₦${perDay.toLocaleString()}/day)\n`;
      text += `   • Internet: ${s.internetSpeedMbps} Mbps | Power: ${s.powerUptimeGuaranteePercent}% Uptime\n`;
      text += `   • Rating: ${s.rating} ★ (${s.reviewsCount} reviews)\n\n`;
    });
    text += `Book verified Nigerian workspaces with instant digital passes on OFIS: ${window.location.origin}`;

    return {
      title,
      text,
      url: window.location.href,
    };
  }
};
