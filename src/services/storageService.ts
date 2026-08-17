import { supabase, isSupabaseConfigured } from './supabaseClient';

export const storageService = {
  async uploadSpaceImage(file: File, spaceId: string): Promise<{ url: string | null; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      // In demo/offline mode, convert to object URL or data URL
      const localUrl = URL.createObjectURL(file);
      return { url: localUrl, error: null };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${spaceId}/${Date.now()}.${fileExt}`;
      const filePath = `spaces/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ofis-media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return { url: null, error: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('ofis-media')
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err.message || 'Image upload failed' };
    }
  },

  async uploadAvatar(file: File, userId: string): Promise<{ url: string | null; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      const localUrl = URL.createObjectURL(file);
      return { url: localUrl, error: null };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('ofis-media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return { url: null, error: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('ofis-media')
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err.message || 'Avatar upload failed' };
    }
  },
};
