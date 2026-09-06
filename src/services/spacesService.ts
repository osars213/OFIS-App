import { Space, SearchFilters } from '../types';
import { storage } from './storageService';
import { getSpaceAvailability } from '../utils/availability';
import { normalizeCategory, getSpacePricing } from '../utils/pricing';
import { matchesLocationOrQuery, normalizeLocationText } from '../utils/location';
import { getSupabaseClient, isSupabaseConfigured, mapDbSpaceToSpace, mapSpaceToDbSpace } from './supabaseClient';

const SPACES_KEY = 'spaces_list';

export const spacesService = {
  getSpaces: (): Space[] => {
    // Default to empty array - never substitute mock spaces
    return storage.get<Space[]>(SPACES_KEY, []);
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
          const mappedSpaces: Space[] = data.map(mapDbSpaceToSpace);
          storage.set(SPACES_KEY, mappedSpaces);
          return { spaces: mappedSpaces, source: 'supabase' };
        }
      } catch (err) {
        console.warn('[spacesService] Supabase fetch error, using cache:', err);
      }
    }

    // Default to stored local cache without injecting mock spaces
    const cached = storage.get<Space[]>(SPACES_KEY, []);
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

  verifySpace: async (
    spaceId: string, 
    status: 'verified' | 'rejected', 
    notes?: string, 
    audit?: any
  ): Promise<Space | undefined> => {
    const spaces = spacesService.getSpaces();
    const target = spaces.find(s => s.id === spaceId);
    if (target) {
      target.verificationStatus = status;
      target.isVerified = status === 'verified';
      target.isActive = status === 'verified';
      target.reviewedAt = new Date().toISOString();
      target.adminReviewNotes = notes || (status === 'verified' ? 'Approved by OFIS Admin Verification Agent' : 'Changes requested before activation');
      target.verificationAudit = {
        photosChecked: true,
        powerChecked: true,
        internetChecked: true,
        locationChecked: true,
        pricingChecked: true,
        notes: notes || '',
        reviewedBy: 'OFIS AI Admin Agent',
        auditScore: status === 'verified' ? 98 : 55,
        verifiedAt: new Date().toISOString(),
        ...audit
      };
      storage.set(SPACES_KEY, spaces);

      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from('spaces').update({ is_active: target.isActive }).eq('id', spaceId);
        } catch (err) {
          console.warn('[spacesService] Error updating space verification in Supabase:', err);
        }
      }
      return target;
    }
    return undefined;
  },

  getPendingSpaces: (): Space[] => {
    const spaces = spacesService.getSpaces();
    return spaces.filter(s => s.verificationStatus === 'pending' || (s.isVerified === false && s.verificationStatus !== 'rejected'));
  },

  filterSpaces: (filters: SearchFilters): Space[] => {
    let spaces = spacesService.getSpaces();

    // 0. Strict Public Visibility Gate: All spaces must be verified and active before appearing in public discovery
    spaces = spaces.filter(s => {
      const isAct = s.isActive !== false;
      const isVer = s.isVerified === true || s.verificationStatus === 'verified' || (!s.verificationStatus && s.isVerified !== false);
      const notPendingOrRejected = s.verificationStatus !== 'pending' && s.verificationStatus !== 'rejected';
      return isAct && isVer && notPendingOrRejected;
    });

    // 1. Text Query (Search across title, address, neighborhood, city, state, description, tags)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      spaces = spaces.filter(s => matchesLocationOrQuery(s, filters.searchQuery));
    }

    // 2. City Filter
    if (filters.city && filters.city !== 'All Cities') {
      const targetCity = normalizeLocationText(filters.city);
      spaces = spaces.filter(s => {
        const spaceCity = normalizeLocationText(s.city);
        const spaceState = normalizeLocationText(s.state);
        return spaceCity === targetCity || spaceCity.includes(targetCity) || targetCity.includes(spaceCity) || spaceState.includes(targetCity);
      });
    }

    // 3. Specific Neighborhood Filter
    if (filters.neighborhood && filters.neighborhood !== 'All' && filters.neighborhood !== 'All Neighborhoods') {
      const targetNeighborhood = normalizeLocationText(filters.neighborhood);
      spaces = spaces.filter(s => {
        const spaceNeighborhood = normalizeLocationText(s.neighborhood);
        const spaceAddress = normalizeLocationText(s.address);
        return spaceNeighborhood === targetNeighborhood || spaceNeighborhood.includes(targetNeighborhood) || spaceAddress.includes(targetNeighborhood);
      });
    }

    // 4. Category
    if (filters.category && filters.category !== 'all') {
      const targetNormalized = normalizeCategory(filters.category);
      spaces = spaces.filter(s => normalizeCategory(s.category) === targetNormalized);
    }

    // 5. Pricing Period
    if (filters.pricingPeriod && filters.pricingPeriod !== 'all') {
      spaces = spaces.filter(s => {
        const pricing = getSpacePricing(s);
        return pricing.period === filters.pricingPeriod;
      });
    }

    // 6. Pricing Basis (Per person vs Per space)
    if (filters.pricingBasis && filters.pricingBasis !== 'all') {
      spaces = spaces.filter(s => {
        const pricing = getSpacePricing(s);
        return pricing.basis === filters.pricingBasis;
      });
    }

    // 7. Max Price (Unit-Period Aware Comparison)
    if (filters.maxPrice && filters.maxPrice > 0) {
      spaces = spaces.filter(s => {
        const pricing = getSpacePricing(s);
        
        // If an explicit period is chosen, strictly compare that period's rate
        if (filters.pricingPeriod === 'hour') {
          return pricing.period === 'hour' ? pricing.rate <= filters.maxPrice : (s.pricePerHour <= filters.maxPrice);
        } else if (filters.pricingPeriod === 'day') {
          return pricing.period === 'day' ? pricing.rate <= filters.maxPrice : (s.pricePerDay <= filters.maxPrice);
        } else if (filters.pricingPeriod === 'month') {
          return pricing.period === 'month' ? pricing.rate <= filters.maxPrice : ((s.pricePerDay * 20) <= filters.maxPrice);
        } else if (filters.pricingPeriod === 'session') {
          return pricing.period === 'session' ? pricing.rate <= filters.maxPrice : false;
        }

        // Generic / All periods: compare space's effective rate
        return pricing.rate <= filters.maxPrice || (s.pricePerHour && s.pricePerHour <= filters.maxPrice);
      });
    }

    // 8. Room / Event / Meeting Capacity
    if (filters.minCapacity && filters.minCapacity > 0) {
      spaces = spaces.filter(s => (s.capacity || 1) >= filters.minCapacity);
    }

    // 9. Backup Power requirement
    if (filters.needsBackupPower) {
      spaces = spaces.filter(s => s.hasBackupPower);
    }

    // 10. High Speed Internet (200Mbps+)
    if (filters.needsHighSpeedInternet) {
      spaces = spaces.filter(s => s.internetSpeedMbps >= 200);
    }

    // 11. Wired Internet (Ethernet / Cat6 / LAN)
    if (filters.needsWiredInternet) {
      spaces = spaces.filter(s => 
        (s.amenities || []).some(a => a && /ethernet|wired|lan|server|cat6/i.test(a)) ||
        (s.tags || []).some(t => t && /wired|ethernet|lan/i.test(t)) ||
        (s.internetSpeedMbps || 0) >= 250
      );
    }

    // 12. Fixed Wireless & Wi-Fi Internet
    if (filters.needsFixedInternet) {
      spaces = spaces.filter(s => 
        (s.amenities || []).some(a => a && /wi-fi|wifi|wireless|fiber|internet/i.test(a)) ||
        (s.internetSpeedMbps || 0) >= 100
      );
    }

    // 13. Soundproofing
    if (filters.needsSoundproofing) {
      spaces = spaces.filter(s => 
        s.noiseLevel === 'Soundproofed Studio' || 
        s.noiseLevel === 'Silent / Library' ||
        (s.amenities || []).some(a => a && /soundproof|acoustic/i.test(a)) ||
        (s.description || '').toLowerCase().includes('soundproof')
      );
    }

    // 14. Whiteboard
    if (filters.needsWhiteboard) {
      spaces = spaces.filter(s => 
        (s.amenities || []).some(a => a && /whiteboard|flipchart|board/i.test(a)) ||
        (s.description || '').toLowerCase().includes('whiteboard')
      );
    }

    // 15. AV / Projector / Presentation Display
    if (filters.needsProjector) {
      spaces = spaces.filter(s => 
        (s.amenities || []).some(a => a && /projector|display|tv|screen|led|polycom|av|monitor/i.test(a)) ||
        (s.description || '').toLowerCase().includes('display') ||
        (s.description || '').toLowerCase().includes('projector') ||
        (s.description || '').toLowerCase().includes('tv')
      );
    }

    // 16. Studio / Camera / Audio Equipment
    if (filters.needsCameraEquipment) {
      spaces = spaces.filter(s => 
        (s.amenities || []).some(a => a && /camera|mic|microphone|audio|light|strobe|cyclorama|rodecaster|green screen/i.test(a)) ||
        s.category === 'studio' ||
        (s.category as string) === 'podcast' ||
        (s.category as string) === 'photography'
      );
    }

    // 17. Specific Array of Amenities & Category-Specific Filter Options
    const allSelectedAmenities = [
      ...(filters.amenities || []),
      ...(filters.categoryAmenities || [])
    ];

    if (allSelectedAmenities.length > 0) {
      spaces = spaces.filter(s => {
        const spaceSearchable = [
          ...(s.amenities || []),
          ...(s.tags || []),
          s.title || '',
          s.description || '',
          s.powerType || '',
          s.internetIsp || '',
          s.noiseLevel || ''
        ].join(' ').toLowerCase();

        return allSelectedAmenities.every(amenity => {
          if (!amenity) return true;
          const aLower = (amenity || '').toLowerCase();
          if (aLower === 'ac' || aLower === 'air conditioning') {
            return /air condition|ac\b|climate control/i.test(spaceSearchable);
          }
          if (aLower === 'parking') {
            return /parking|garage|valet/i.test(spaceSearchable);
          }
          if (aLower === '24/7 access') {
            return /24\/7|24-7|round-the-clock|24 hours/i.test(spaceSearchable);
          }
          if (aLower === 'catering') {
            return /cater|refreshment|coffee|snack|tea|food/i.test(spaceSearchable);
          }
          if (aLower === 'sound system' || aLower === 'sound') {
            return /sound|speaker|audio|pa system|acoustic/i.test(spaceSearchable);
          }
          if (aLower === 'decoration allowed') {
            return /decorat|event|hall|setup|flex/i.test(spaceSearchable);
          }
          if (aLower === 'video conferencing') {
            return /video conferenc|zoom|polycom|webcam/i.test(spaceSearchable);
          }
          if (aLower === 'green screen') {
            return /green screen|chroma|cyclorama/i.test(spaceSearchable);
          }
          if (aLower === 'lighting') {
            return /light|strobe|softbox|aputure|godox/i.test(spaceSearchable);
          }
          if (aLower === 'hot desk') {
            return /hot desk|hot-desk|coworking desk|shared desk/i.test(spaceSearchable);
          }
          if (aLower === 'dedicated desk') {
            return /dedicated desk|fixed desk|reserved desk/i.test(spaceSearchable);
          }
          if (aLower === 'boardroom') {
            return /boardroom|board room|executive meeting/i.test(spaceSearchable);
          }
          if (aLower === 'classroom' || aLower === 'theatre' || aLower === 'u-shape') {
            return spaceSearchable.includes(aLower) || s.category === 'training-room';
          }
          return spaceSearchable.includes(aLower);
        });
      });
    }

    // 18. Instant Booking Only
    if (filters.instantBookingOnly) {
      spaces = spaces.filter(s => s.instantBooking || (s.tags || []).includes('Instant Book'));
    }

    // 19. Available Now Only
    if (filters.availableNowOnly) {
      spaces = spaces.filter(s => getSpaceAvailability(s).status === 'available_now');
    }

    // 20. Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        spaces.sort((a, b) => {
          const rateA = getSpacePricing(a).rate;
          const rateB = getSpacePricing(b).rate;
          return rateA - rateB;
        });
        break;
      case 'price_desc':
        spaces.sort((a, b) => {
          const rateA = getSpacePricing(a).rate;
          const rateB = getSpacePricing(b).rate;
          return rateB - rateA;
        });
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
