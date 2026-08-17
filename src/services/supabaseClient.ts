import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let supabaseUrl = rawUrl.replace(/\/+$/, '');
try {
  if (rawUrl.startsWith('http')) {
    const parsed = new URL(rawUrl);
    // Extract base origin (e.g. https://xyz.supabase.co) so /rest/v1 or /auth/v1 paths aren't duplicated by supabase-js
    supabaseUrl = parsed.origin;
  }
} catch {
  supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    supabaseUrl.startsWith('http') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0
  );
};

export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl,
    hasKey: Boolean(supabaseAnonKey && supabaseAnonKey.length > 0),
    isConfigured: isSupabaseConfigured(),
  };
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
