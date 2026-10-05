import { storage } from './storageService';
import { getSupabaseClient } from './supabaseClient';

const SAVED_SPACES_KEY = 'saved_space_ids';

export const favoritesService = {
  getSavedIds: (): string[] => {
    return storage.get<string[]>(SAVED_SPACES_KEY, ['space-vi-hive', 'space-ikoyi-boardroom']);
  },

  fetchFavoritesAsync: async (userId?: string): Promise<string[]> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: sessionData } = await client.auth.getSession();
        const activeUserId = sessionData?.session?.user?.id || (userId && !userId.startsWith('user-') && !userId.startsWith('guest') ? userId : undefined);

        if (activeUserId) {
          const { data, error } = await client
            .from('profiles')
            .select('saved_space_ids')
            .eq('id', activeUserId)
            .maybeSingle();

          if (!error && data?.saved_space_ids && Array.isArray(data.saved_space_ids)) {
            storage.set(SAVED_SPACES_KEY, data.saved_space_ids);
            return data.saved_space_ids;
          }
        }
      } catch (err: any) {
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

    // Sync to Supabase profile in background using authenticated session
    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(({ data: sessionData }) => {
        const activeUserId = sessionData?.session?.user?.id || (userId && !userId.startsWith('user-') && !userId.startsWith('guest') ? userId : undefined);
        if (activeUserId) {
          client.from('profiles').update({ saved_space_ids: updated }).eq('id', activeUserId).then(null, err => {
            console.warn('[favoritesService] Note updating favorites in Supabase:', err);
          });
        }
      });
    }

    return updated;
  }
};
