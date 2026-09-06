import { Space, Booking, SpaceCategory } from '../types';
import { storage } from './storageService';

const RECENT_SEARCHES_KEY = 'recent_searches_list';
const RECENTLY_VIEWED_KEY = 'recently_viewed_spaces_list';

export const DEFAULT_TRENDING_SEARCHES = [
  'Meeting Rooms',
  'Creative Studios',
  'Day Pass',
  'Virtual Office',
  'Podcast Studio',
  'Lekki Coworking'
];

export const INITIAL_RECENT_SEARCHES = [
  'Victoria Island Office',
  'Podcast Studio',
  'Meeting Room Abuja',
  'Lekki Coworking',
  'Day Pass'
];

export const recommendationsService = {
  // --- RECENT SEARCHES ---
  getRecentSearches: (): string[] => {
    return storage.get<string[]>(RECENT_SEARCHES_KEY, INITIAL_RECENT_SEARCHES);
  },

  addRecentSearch: (query: string): string[] => {
    if (!query || !query.trim()) return recommendationsService.getRecentSearches();
    const clean = query.trim();
    const existing = recommendationsService.getRecentSearches();
    const filtered = (existing || []).filter(q => q && q.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 5); // Keep up to 5
    storage.set(RECENT_SEARCHES_KEY, updated);
    return updated;
  },

  clearRecentSearches: (): string[] => {
    storage.set(RECENT_SEARCHES_KEY, []);
    return [];
  },

  getTrendingSearches: (): string[] => {
    return DEFAULT_TRENDING_SEARCHES;
  },

  // --- RECENTLY VIEWED SPACES ---
  getRecentlyViewedIds: (): string[] => {
    return storage.get<string[]>(RECENTLY_VIEWED_KEY, []);
  },

  recordSpaceView: (spaceId: string): string[] => {
    if (!spaceId) return recommendationsService.getRecentlyViewedIds();
    const existing = recommendationsService.getRecentlyViewedIds();
    const filtered = existing.filter(id => id !== spaceId);
    const updated = [spaceId, ...filtered].slice(0, 10); // Keep last 10
    storage.set(RECENTLY_VIEWED_KEY, updated);
    return updated;
  },

  clearRecentlyViewed: (): string[] => {
    storage.set(RECENTLY_VIEWED_KEY, []);
    return [];
  },

  // --- SMART RECOMMENDATIONS ---
  getRecommendedSpaces: (
    allSpaces: Space[],
    bookings: Booking[],
    viewedIds: string[],
    savedIds: string[]
  ): Space[] => {
    if (!allSpaces || allSpaces.length === 0) return [];

    // Extract user preferences from bookings
    const bookedCategories = new Set(
      bookings.map(b => {
        const found = allSpaces.find(s => s.id === b.spaceId);
        return found?.category;
      }).filter(Boolean)
    );
    const bookedCities = new Set(bookings.map(b => b.spaceCity).filter(Boolean));

    // Extract categories from viewed spaces
    const viewedSpaces = viewedIds
      .map(id => allSpaces.find(s => s.id === id))
      .filter((s): s is Space => Boolean(s));
    const viewedCategories = new Set(viewedSpaces.map(s => s.category));
    const viewedCities = new Set(viewedSpaces.map(s => s.city));

    // Extract categories from saved spaces
    const savedSpaces = savedIds
      .map(id => allSpaces.find(s => s.id === id))
      .filter((s): s is Space => Boolean(s));
    const savedCategories = new Set(savedSpaces.map(s => s.category));

    // Score each space
    const scored = allSpaces.map(space => {
      let score = 0;

      // 1. Previous bookings affinity (Highest priority)
      if (bookedCategories.has(space.category)) score += 50;
      if (bookedCities.has(space.city)) score += 25;

      // 2. Recently viewed affinity
      if (viewedCategories.has(space.category)) score += 35;
      if (viewedCities.has(space.city)) score += 20;

      // 3. Saved / Favourite categories
      if (savedCategories.has(space.category)) score += 30;
      if (savedIds.includes(space.id)) score += 15;

      // 4. Verified & Superhost
      if (space.isVerified) score += 20;
      if (space.isSuperhost) score += 15;

      // 5. Rating & Reviews
      score += (space.rating || 4.5) * 6; // up to 30
      score += Math.min(space.reviewsCount || 0, 50) * 0.2; // up to 10

      return { space, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.map(item => item.space);
  },

  // --- CONTINUE BROWSING ---
  getContinueBrowsingSpaces: (
    allSpaces: Space[],
    viewedIds: string[],
    bookings: Booking[]
  ): Space[] => {
    if (!viewedIds || viewedIds.length === 0) return [];
    const bookedSpaceIds = new Set(bookings.map(b => b.spaceId));

    // Get viewed spaces that haven't been booked yet, in the order they were viewed
    const unbookedViewed = viewedIds
      .filter(id => !bookedSpaceIds.has(id))
      .map(id => allSpaces.find(s => s.id === id))
      .filter((s): s is Space => Boolean(s));

    // If all were booked or none left, return recent viewed
    if (unbookedViewed.length === 0) {
      return viewedIds
        .map(id => allSpaces.find(s => s.id === id))
        .filter((s): s is Space => Boolean(s));
    }

    return unbookedViewed;
  },

  // --- BOOK AGAIN / RECENTLY BOOKED ---
  getRecentlyBookedSpaces: (
    allSpaces: Space[],
    bookings: Booking[]
  ): { space: Space; booking: Booking }[] => {
    if (!bookings || bookings.length === 0) return [];

    const seenSpaceIds = new Set<string>();
    const results: { space: Space; booking: Booking }[] = [];

    // bookings are sorted newest first
    for (const b of bookings) {
      if (!seenSpaceIds.has(b.spaceId)) {
        seenSpaceIds.add(b.spaceId);
        const space = allSpaces.find(s => s.id === b.spaceId);
        if (space) {
          results.push({ space, booking: b });
        }
      }
    }

    return results;
  }
};
