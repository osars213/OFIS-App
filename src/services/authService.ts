import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User, UserRole } from '../types';

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export const authService = {
  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'coworker',
    phone?: string
  ): Promise<AuthResponse> {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo / Offline fallback user creation
      const mockUser: User = {
        id: `user-${Date.now()}`,
        name: fullName || email.split('@')[0],
        email,
        role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        phone: phone || '',
      };
      return { user: mockUser, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            phone: phone || '',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          name: fullName || data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email || email,
          role,
          avatar: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          phone: phone || data.user.user_metadata?.phone,
        };
        return { user, error: null };
      }

      return { user: null, error: 'Sign up succeeded, please verify your email.' };
    } catch (err: any) {
      return { user: null, error: err.message || 'An unexpected authentication error occurred.' };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured() || !supabase) {
      const mockUser: User = {
        id: `demo-${email.toLowerCase().includes('host') ? 'host' : 'user'}`,
        name: email.split('@')[0],
        email,
        role: email.toLowerCase().includes('host') ? 'host' : 'coworker',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      return { user: mockUser, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Fetch full profile from public.profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const user: User = {
          id: data.user.id,
          name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email || email,
          role: (profile?.role as UserRole) || (data.user.user_metadata?.role as UserRole) || 'coworker',
          avatar: profile?.avatar_url || data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          phone: profile?.phone || data.user.user_metadata?.phone,
          company: profile?.company,
        };

        return { user, error: null };
      }

      return { user: null, error: 'User could not be loaded.' };
    } catch (err: any) {
      return { user: null, error: err.message || 'Login failed.' };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    }
    return { error: null };
  },

  async getCurrentSessionUser(): Promise<User | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return {
        id: session.user.id,
        name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        role: (profile?.role as UserRole) || (session.user.user_metadata?.role as UserRole) || 'coworker',
        avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        phone: profile?.phone || session.user.user_metadata?.phone,
        company: profile?.company,
      };
    } catch (err) {
      console.warn('Could not restore Supabase auth session:', err);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, error: null };
    }

    try {
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name) payload.full_name = updates.name;
      if (updates.avatar) payload.avatar_url = updates.avatar;
      if (updates.phone) payload.phone = updates.phone;
      if (updates.company) payload.company = updates.company;
      if (updates.role) payload.role = updates.role;

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset' };
    }
  },
};
