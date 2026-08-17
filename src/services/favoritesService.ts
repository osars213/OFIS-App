import { supabase, isSupabaseConfigured } from './supabaseClient';

export const favoritesService = {
  async fetchFavorites(userId: string): Promise<{ favoriteSpaceIds: string[]; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      // Local fallback for development/demo
      const saved = localStorage.getItem(`ofis_favs_${userId}`);
      if (saved) {
        try {
          return { favoriteSpaceIds: JSON.parse(saved), error: null };
        } catch {
          return { favoriteSpaceIds: [], error: null };
        }
      }
      return { favoriteSpaceIds: ['space-1', 'space-3'], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('space_id')
        .eq('user_id', userId);

      if (error) return { favoriteSpaceIds: [], error: error.message };

      return { favoriteSpaceIds: (data || []).map(f => f.space_id), error: null };
    } catch (err: any) {
      return { favoriteSpaceIds: [], error: err.message };
    }
  },

  async toggleFavorite(userId: string, spaceId: string): Promise<{ isFavorited: boolean; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      const saved = localStorage.getItem(`ofis_favs_${userId}`);
      let list: string[] = saved ? JSON.parse(saved) : ['space-1', 'space-3'];
      const exists = list.includes(spaceId);
      list = exists ? list.filter(id => id !== spaceId) : [...list, spaceId];
      localStorage.setItem(`ofis_favs_${userId}`, JSON.stringify(list));
      return { isFavorited: !exists, error: null };
    }

    try {
      // Check if already favorited
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('space_id', spaceId)
        .single();

      if (data) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('space_id', spaceId);
        return { isFavorited: false, error: null };
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: userId, space_id: spaceId });
        return { isFavorited: true, error: null };
      }
    } catch (err: any) {
      return { isFavorited: false, error: err.message };
    }
  },
};
