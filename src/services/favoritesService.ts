import { storage } from './storageService';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const SAVED_SPACES_KEY = 'saved_space_ids';

export const favoritesService = {
  getSavedIds: (): string[] => {
    const defaultFavorites = isSupabaseConfigured() ? [] : ['space-vi-hive', 'space-ikoyi-boardroom'];
    return storage.get<string[]>(SAVED_SPACES_KEY, defaultFavorites);
  },

  fetchFavoritesAsync: async (userId?: string): Promise<string[]> => {
    const client = getSupabaseClient();
    if (client && userId && !userId.startsWith('guest')) {
      try {
        const { data: profile } = await client
          .from('profiles')
          .select('saved_space_ids')
          .eq('id', userId)
          .single();

        if (profile && Array.isArray(profile.saved_space_ids)) {
          storage.set(SAVED_SPACES_KEY, profile.saved_space_ids);
          return profile.saved_space_ids;
        }

        const { data: favs, error } = await client
          .from('favorites')
          .select('space_id')
          .eq('user_id', userId);

        if (!error && favs) {
          const ids = favs.map((f: any) => f.space_id);
          storage.set(SAVED_SPACES_KEY, ids);
          return ids;
        }
      } catch (err) {
        console.warn('[favoritesService] Error fetching favorites from Supabase:', err);
      }
    }
    return favoritesService.getSavedIds();
  },

  toggleFavorite: (spaceId: string, userId?: string): string[] => {
    const current = favoritesService.getSavedIds();
    const exists = current.includes(spaceId);
    const updated = exists ? current.filter(id => id !== spaceId) : [...current, spaceId];
    storage.set(SAVED_SPACES_KEY, updated);

    // Sync to Supabase in background
    const client = getSupabaseClient();
    if (client && userId && !userId.startsWith('guest')) {
      if (exists) {
        client.from('favorites').delete().match({ user_id: userId, space_id: spaceId }).then(() => {});
      } else {
        client.from('favorites').insert({ user_id: userId, space_id: spaceId }).then(() => {});
      }
      client.from('profiles').update({ saved_space_ids: updated }).eq('id', userId).then(() => {});
    }

    return updated;
  }
};
