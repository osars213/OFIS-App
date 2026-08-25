import { Space, SearchFilters } from '../types';
import { MOCK_SPACES } from '../mockData';
import { storage } from './storageService';
import { getSpaceAvailability } from '../utils/availability';
import { getSupabaseClient, isSupabaseConfigured, mapDbSpaceToSpace, mapSpaceToDbSpace } from './supabaseClient';

const SPACES_KEY = 'spaces_list';

export const spacesService = {
  getSpaces: (): Space[] => {
    // If Supabase is configured, default to empty array if no cached data exists,
    // ensuring we never show mock listings in production.
    const defaultSpaces = isSupabaseConfigured() ? [] : MOCK_SPACES;
    return storage.get<Space[]>(SPACES_KEY, defaultSpaces);
  },

  fetchSpacesAsync: async (): Promise<{ spaces: Space[]; source: 'supabase' | 'cache' }> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('spaces')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          if (data.length > 0) {
            const mappedSpaces: Space[] = data.map(mapDbSpaceToSpace);
            storage.set(SPACES_KEY, mappedSpaces);
            return { spaces: mappedSpaces, source: 'supabase' };
          } else {
            // Live Supabase is connected and returned 0 listings.
            // Do not mix mock data with live production data.
            storage.set(SPACES_KEY, []);
            return { spaces: [], source: 'supabase' };
          }
        }
      } catch (err) {
        console.warn('[spacesService] Supabase fetch error, using cache:', err);
      }
    }

    // In dev fallback mode (when Supabase is unconfigured), use mock data.
    const fallbackSpaces = isSupabaseConfigured() ? [] : MOCK_SPACES;
    const cached = storage.get<Space[]>(SPACES_KEY, fallbackSpaces);
    return { spaces: cached, source: 'cache' };
  },

  getSpaceById: (id: string): Space | undefined => {
    const spaces = spacesService.getSpaces();
    return spaces.find(s => s.id === id);
  },

  getSpaceByIdAsync: async (id: string): Promise<Space | undefined> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('spaces')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return mapDbSpaceToSpace(data);
        }
      } catch (err) {
        console.warn('[spacesService] Error fetching single space from Supabase:', err);
      }
    }
    return spacesService.getSpaceById(id);
  },

  addSpace: async (newSpace: Space): Promise<void> => {
    const spaces = spacesService.getSpaces();
    spaces.unshift(newSpace);
    storage.set(SPACES_KEY, spaces);

    const client = getSupabaseClient();
    if (client) {
      try {
        const dbPayload = mapSpaceToDbSpace(newSpace);
        await client.from('spaces').upsert(dbPayload);
      } catch (err) {
        console.warn('[spacesService] Error syncing space to Supabase:', err);
      }
    }
  },

  updateSpace: async (updatedSpace: Space): Promise<void> => {
    const spaces = spacesService.getSpaces();
    const index = spaces.findIndex(s => s.id === updatedSpace.id);
    if (index !== -1) {
      spaces[index] = updatedSpace;
      storage.set(SPACES_KEY, spaces);
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        const dbPayload = mapSpaceToDbSpace(updatedSpace);
        await client.from('spaces').update(dbPayload).eq('id', updatedSpace.id);
      } catch (err) {
        console.warn('[spacesService] Error updating space in Supabase:', err);
      }
    }
  },

  deleteSpace: async (spaceId: string): Promise<void> => {
    const spaces = spacesService.getSpaces();
    const filtered = spaces.filter(s => s.id !== spaceId);
    storage.set(SPACES_KEY, filtered);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('spaces').delete().eq('id', spaceId);
      } catch (err) {
        console.warn('[spacesService] Error deleting space from Supabase:', err);
      }
    }
  },

  toggleSpaceActive: async (spaceId: string): Promise<Space | undefined> => {
    const spaces = spacesService.getSpaces();
    const target = spaces.find(s => s.id === spaceId);
    if (target) {
      target.isActive = target.isActive === false ? true : false;
      storage.set(SPACES_KEY, spaces);

      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from('spaces').update({ is_active: target.isActive }).eq('id', spaceId);
        } catch (err) {
          console.warn('[spacesService] Error toggling active status in Supabase:', err);
        }
      }
      return target;
    }
    return undefined;
  },

  filterSpaces: (filters: SearchFilters): Space[] => {
    let spaces = spacesService.getSpaces();

    // Query text (title, location, neighborhood, tags)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      spaces = spaces.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.neighborhood.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // City
    if (filters.city && filters.city !== 'All Cities') {
      spaces = spaces.filter(s => s.city.toLowerCase() === filters.city.toLowerCase());
    }

    // Category
    if (filters.category && filters.category !== 'all') {
      spaces = spaces.filter(s => s.category === filters.category);
    }

    // Max Price per hour
    if (filters.maxPrice && filters.maxPrice > 0) {
      spaces = spaces.filter(s => s.pricePerHour <= filters.maxPrice);
    }

    // Room / Event / Meeting Capacity
    if (filters.minCapacity && filters.minCapacity > 0) {
      spaces = spaces.filter(s => (s.capacity || 1) >= filters.minCapacity);
    }

    // Backup Power requirement
    if (filters.needsBackupPower) {
      spaces = spaces.filter(s => s.hasBackupPower);
    }

    // High Speed Internet (200Mbps+)
    if (filters.needsHighSpeedInternet) {
      spaces = spaces.filter(s => s.internetSpeedMbps >= 200);
    }

    // Wired Internet (Ethernet / Cat6 / LAN)
    if (filters.needsWiredInternet) {
      spaces = spaces.filter(s => 
        s.amenities.some(a => /ethernet|wired|lan|server|cat6/i.test(a)) ||
        s.tags.some(t => /wired|ethernet|lan/i.test(t)) ||
        s.internetSpeedMbps >= 250
      );
    }

    // Fixed Wireless & Wi-Fi Internet
    if (filters.needsFixedInternet) {
      spaces = spaces.filter(s => 
        s.amenities.some(a => /wi-fi|wifi|wireless|fiber|internet/i.test(a)) ||
        s.internetSpeedMbps >= 100
      );
    }

    // Soundproofing
    if (filters.needsSoundproofing) {
      spaces = spaces.filter(s => s.noiseLevel === 'Soundproofed Studio' || s.noiseLevel === 'Silent / Library');
    }

    // Instant Booking Only
    if (filters.instantBookingOnly) {
      spaces = spaces.filter(s => s.instantBooking || s.tags.includes('Instant Book'));
    }

    // Available Now Only (Real-Time Availability Filter)
    if (filters.availableNowOnly) {
      spaces = spaces.filter(s => getSpaceAvailability(s).status === 'available_now');
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
        spaces.sort((a, b) => (b.isSuperhost ? 1 : 0) - (a.isSuperhost ? 1 : 0) || b.rating - a.rating);
        break;
    }

    return spaces;
  }
};
