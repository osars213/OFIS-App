import { Space, SearchFilterState } from '../types';
import { MOCK_SPACES } from '../mockData';
import { storageService } from './storageService';

const SPACES_KEY = 'spaces_list';

export const spacesService = {
  getAllSpaces(): Space[] {
    const customSpaces = storageService.getItem<Space[]>(SPACES_KEY, []);
    return [...MOCK_SPACES, ...customSpaces];
  },

  getSpaceById(id: string): Space | undefined {
    const all = this.getAllSpaces();
    return all.find(s => s.id === id);
  },

  addSpace(space: Omit<Space, 'id' | 'rating' | 'reviewsCount' | 'isVerified'>): Space {
    const newSpace: Space = {
      ...space,
      id: `space_${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      isVerified: true,
    };
    const customSpaces = storageService.getItem<Space[]>(SPACES_KEY, []);
    storageService.setItem(SPACES_KEY, [newSpace, ...customSpaces]);
    return newSpace;
  },

  filterSpaces(filters: SearchFilterState): Space[] {
    let spaces = this.getAllSpaces();

    // Query text search
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      spaces = spaces.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.neighborhood.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // City filter
    if (filters.city && filters.city !== 'All Cities') {
      spaces = spaces.filter(s => s.city.toLowerCase() === filters.city.toLowerCase());
    }

    // Neighborhood filter
    if (filters.neighborhood && filters.neighborhood !== 'All') {
      spaces = spaces.filter(s => s.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase()));
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      spaces = spaces.filter(s => s.category === filters.category);
    }

    // Max Price per hour
    if (filters.maxPrice > 0) {
      spaces = spaces.filter(s => s.pricePerHour <= filters.maxPrice);
    }

    // Backup Power requirement
    if (filters.needsBackupPower) {
      spaces = spaces.filter(s => s.hasBackupPower);
    }

    // High speed internet
    if (filters.needsHighSpeedInternet) {
      spaces = spaces.filter(s => s.internetSpeedMbps >= 200);
    }

    // Soundproofing
    if (filters.needsSoundproofing) {
      spaces = spaces.filter(s => s.noiseLevel === 'Soundproofed Studio' || s.noiseLevel === 'Silent / Library');
    }

    // Instant booking
    if (filters.instantBookingOnly) {
      spaces = spaces.filter(s => s.instantBooking);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        spaces.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case 'price_desc':
        spaces.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case 'rating':
        spaces.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        spaces.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case 'recommended':
      default:
        // Sort superhosts and top rated first
        spaces.sort((a, b) => (b.isSuperhost ? 1 : 0) - (a.isSuperhost ? 1 : 0));
        break;
    }

    return spaces;
  }
};
