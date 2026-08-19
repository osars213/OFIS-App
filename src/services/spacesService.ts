import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Space, Desk, FilterState } from '../types';
import { INITIAL_SPACES } from '../mockData';

// Helper to map DB space row to frontend Space interface
export const mapDbSpaceToSpace = (row: any, desks: Desk[] = []): Space => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

    return {
      id: row.id,
      listing_id: row.listing_id || `OFS-${row.id?.substring(0, 6)?.toUpperCase()}`,
      source: 'direct_host',
      name: row.name,
      tagline: row.tagline || '',
      description: row.description || '',
      primaryCategory: row.primary_category || 'WORK',
      subcategory: row.subcategory || 'coworking_desks',
      
      hostId: row.owner_id,
      hostName: profile?.full_name || row.host_name || 'Verified OFIS Host',
      hostAvatar: profile?.avatar_url || row.host_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      hostEmail: profile?.email || row.host_email || '',
      hostPhone: profile?.phone || row.host_phone || '+234 801 234 5678',
      hostWhatsApp: profile?.whatsapp || row.host_whatsapp || '+234 801 234 5678',
      isSuperhost: row.is_superhost ?? true,

    city: row.city || 'Lagos',
    country: row.country || 'Nigeria',
    address: row.address || '',
    neighborhood: row.neighborhood || row.city || 'Lagos',
    coordinates: {
      lat: row.latitude || 6.435,
      lng: row.longitude || 3.440,
    },
    latitude: row.latitude || 6.435,
    longitude: row.longitude || 3.440,

    rating: Number(row.rating) || 5.0,
    reviewCount: Number(row.review_count) || 0,
    images: Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : ['https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80'],
    capacity: Number(row.capacity) || 12,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    equipment: Array.isArray(row.equipment) ? row.equipment : [],
    rules: Array.isArray(row.rules) ? row.rules : ['Valid ID required', 'Quiet call zones'],
    cancellationPolicy: row.cancellation_policy || 'Flexible: Free cancellation up to 2 hours before start',
    openingHours: row.opening_hours || '08:00 AM - 08:00 PM (Mon - Sat)',
    
    wifiSSID: row.wifi_ssid || 'OFIS_Guest_HighSpeed',
    wifiPass: row.wifi_pass || '',
    doorPIN: row.door_pin || '',

    dailyRate: Number(row.daily_rate_usd) || Math.round((Number(row.daily_rate_ngn) || 25000) / 1550),
    hourlyRate: Number(row.hourly_rate_usd) || Math.round((Number(row.hourly_rate_ngn) || 5000) / 1550),
    weeklyRate: Number(row.weekly_rate_ngn) || 110000,
    monthlyRate: Number(row.monthly_rate_ngn) || 420000,
    hourlyRateNGN: Number(row.hourly_rate_ngn) || 5000,
    dailyRateNGN: Number(row.daily_rate_ngn) || 25000,

    desks: desks.length > 0 ? desks : [
      {
        id: `desk-${row.id}-1`,
        spaceId: row.id,
        name: 'Desk Alpha 01',
        code: 'A-01',
        row: 1,
        col: 1,
        zone: 'collaborative',
        status: 'available',
        features: ['Ergonomic Mesh Chair', 'Dedicated Multi-Socket Power', 'High-Speed LAN'],
        monitorSetup: 'Dual 27" 4K USB-C Displays',
        chairType: 'Herman Miller Aeron',
        standingMotorized: true,
        hasPowerOutlet: true,
        hasLanCable: true,
        daylightRating: 5,
        noiseLevel: 'Gentle ambient',
      }
    ],
    floorplanLayout: {
      gridRows: 3,
      gridCols: 4,
      roomZones: [
        { id: 'zone-1', name: 'Open Desk Workstation', zone: 'collaborative', x: 0, y: 0, w: 4, h: 3, color: 'rgba(0, 200, 120, 0.15)' }
      ],
      facilityPoints: [
        { type: 'coffee', name: 'Espresso Bar', x: 0, y: 0 },
        { type: 'entrance', name: 'Reception & Smart Door Access', x: 2, y: 0 }
      ]
    },

    instantBook: row.instant_book ?? true,
    quietLevel: row.quiet_level || 'High',
    createdAt: row.created_at || new Date().toISOString(),
    featured: row.is_featured ?? false,
  };
};

export const spacesService = {
  async fetchSpaces(filters?: Partial<FilterState>): Promise<{ spaces: Space[]; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { spaces: INITIAL_SPACES, error: null };
    }

    try {
      let query = supabase
        .from('spaces')
        .select(`
          *,
          profiles!owner_id (
            full_name,
            avatar_url,
            email,
            phone,
            whatsapp
          ),
          desks (*)
        `)
        .neq('verification_status', 'suspended');

      // Filter by Primary Category
      if (filters?.category && filters.category !== 'all' && filters.category !== 'saved') {
        query = query.eq('primary_category', filters.category);
      }

      // Filter by City
      if (filters?.city && filters.city !== 'all') {
        query = query.ilike('city', `%${filters.city}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          console.info('[OFIS Backend] Notice: Supabase tables are being initialized. Please run /supabase/schema.sql in the Supabase SQL editor to create all tables. Using demo catalog in the meantime.');
        } else {
          console.warn('Supabase fetchSpaces notice:', error.message);
        }
        // Fallback gracefully to demo seed so user never gets a blank screen
        return { spaces: INITIAL_SPACES, error: error.message };
      }

      if (!data || data.length === 0) {
        return { spaces: INITIAL_SPACES, error: null };
      }

      const spaces = data.map((row: any) => {
        const desks: Desk[] = (row.desks || []).map((d: any) => ({
          id: d.id,
          spaceId: d.space_id,
          name: d.name,
          code: d.code,
          row: d.row_num,
          col: d.col_num,
          zone: d.zone,
          status: d.status,
          features: d.features || [],
          monitorSetup: d.monitor_setup || 'Standard Monitor',
          chairType: d.chair_type || 'Ergonomic Chair',
          standingMotorized: d.standing_motorized ?? false,
          hasPowerOutlet: d.has_power_outlet ?? true,
          hasLanCable: d.has_lan_cable ?? true,
          daylightRating: d.daylight_rating || 4,
          noiseLevel: d.noise_level || 'Gentle ambient',
          currentOccupant: d.current_occupant || undefined,
        }));

        return mapDbSpaceToSpace(row, desks);
      });

      return { spaces, error: null };
    } catch (err: any) {
      console.error('Database connection exception in fetchSpaces:', err);
      return { spaces: INITIAL_SPACES, error: err.message };
    }
  },

  async createSpace(spaceData: Partial<Space>, ownerId: string): Promise<{ space: Space | null; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      const mockSpace: Space = {
        ...(INITIAL_SPACES[0]),
        id: `space-${Date.now()}`,
        name: spaceData.name || 'New Workspace',
        hostId: ownerId,
        ...spaceData,
      } as Space;
      return { space: mockSpace, error: null };
    }

    try {
      const payload = {
        host_id: ownerId,
        owner_id: ownerId,
        name: spaceData.name || 'Premium Workspace',
        tagline: spaceData.tagline || '',
        description: spaceData.description || '',
        space_type: spaceData.primaryCategory === 'CREATE' ? 'creator_studio' : 'coworking_space',
        primary_category: spaceData.primaryCategory || 'WORK',
        subcategory: spaceData.subcategory || 'coworking_desks',
        address: spaceData.address || 'Victoria Island, Lagos',
        city: spaceData.city || 'Lagos',
        state: `${spaceData.city || 'Lagos'} State`,
        neighborhood: spaceData.neighborhood || spaceData.city || 'Lagos',
        country: spaceData.country || 'Nigeria',
        latitude: spaceData.coordinates?.lat || spaceData.latitude || 6.435,
        longitude: spaceData.coordinates?.lng || spaceData.longitude || 3.440,
        capacity: spaceData.capacity || 10,
        opening_hours: spaceData.openingHours || '08:00 AM - 08:00 PM (Mon - Sat)',
        rules: spaceData.rules || ['Valid ID required'],
        cancellation_policy: spaceData.cancellationPolicy || 'Flexible cancellation',
        hourly_price: spaceData.hourlyRateNGN || 5000,
        daily_price: spaceData.dailyRateNGN || 25000,
        hourly_rate_ngn: spaceData.hourlyRateNGN || 5000,
        daily_rate_ngn: spaceData.dailyRateNGN || 25000,
        weekly_rate_ngn: spaceData.weeklyRate || 110000,
        monthly_rate_ngn: spaceData.monthlyRate || 420000,
        amenities: spaceData.amenities || [],
        equipment: spaceData.equipment || [],
        images: spaceData.images || ['https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80'],
        wifi_ssid: spaceData.wifiSSID || 'OFIS_Guest_HighSpeed',
        wifi_pass: spaceData.wifiPass || '',
        door_pin: spaceData.doorPIN || '',
        verified: true,
        status: 'available',
        verification_status: 'verified',
        availability_status: 'available',
      };

      const { data, error } = await supabase
        .from('spaces')
        .insert(payload)
        .select(`
          *,
          profiles!owner_id (full_name, avatar_url, email, phone, whatsapp)
        `)
        .single();

      if (error) {
        return { space: null, error: error.message };
      }

      // Also create initial desk if provided
      if (spaceData.desks && spaceData.desks.length > 0) {
        const deskPayloads = spaceData.desks.map((d, index) => ({
          space_id: data.id,
          name: d.name || `Desk ${index + 1}`,
          code: d.code || `D-0${index + 1}`,
          row_num: d.row || 1,
          col_num: d.col || (index + 1),
          zone: d.zone || 'collaborative',
          status: 'available',
          features: d.features || ['Ergonomic Mesh Chair'],
          monitor_setup: d.monitorSetup || 'Dual 27" 4K',
          chair_type: d.chairType || 'Herman Miller Aeron',
        }));

        await supabase.from('desks').insert(deskPayloads);
      }

      // Store credentials in secure vault table
      try {
        await supabase.from('space_access_credentials').upsert({
          space_id: data.id,
          wifi_ssid: spaceData.wifiSSID || 'OFIS_Guest_HighSpeed',
          wifi_pass: spaceData.wifiPass || '',
          door_pin: spaceData.doorPIN || '',
          access_instructions: 'Show your OFIS digital QR pass at reception or dial keypad PIN.',
          updated_at: new Date().toISOString(),
        });
      } catch (credErr) {
        console.debug('space_access_credentials upsert notice:', credErr);
      }

      return { space: mapDbSpaceToSpace(data, spaceData.desks || []), error: null };
    } catch (err: any) {
      return { space: null, error: err.message || 'Failed to create space in database.' };
    }
  },

  async updateSpace(spaceId: string, updates: Partial<Space>): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, error: null };
    }

    try {
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.tagline !== undefined) payload.tagline = updates.tagline;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.hourlyRateNGN !== undefined) payload.hourly_rate_ngn = updates.hourlyRateNGN;
      if (updates.dailyRateNGN !== undefined) payload.daily_rate_ngn = updates.dailyRateNGN;
      if (updates.capacity !== undefined) payload.capacity = updates.capacity;
      if (updates.amenities !== undefined) payload.amenities = updates.amenities;
      if (updates.images !== undefined) payload.images = updates.images;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.city !== undefined) payload.city = updates.city;

      const { error } = await supabase
        .from('spaces')
        .update(payload)
        .eq('id', spaceId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Update failed.' };
    }
  },

  async deleteSpace(spaceId: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', spaceId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Delete failed.' };
    }
  },

  // Subscribe to real-time space mutations
  subscribeToSpaces(onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured() || !supabase) {
      return { unsubscribe: () => {} };
    }

    const channel = supabase
      .channel('public:spaces')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spaces' },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase?.removeChannel(channel);
      },
    };
  },
};
