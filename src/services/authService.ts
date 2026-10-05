import { UserProfile } from '../types';
import { INITIAL_USER, INITIAL_HOST, GUEST_USER } from '../mockData';
import { storage } from './storageService';
import { 
  getSupabaseClient, 
  mapDbProfileToUser, 
  mapProfileToDbProfile 
} from './supabaseClient';

const USER_KEY = 'current_user';
const USERS_DB_KEY = 'registered_users_db';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'host';
  company?: string;
  password?: string;
  avatar?: string;
}

export interface StoredUserAccount extends UserProfile {
  password?: string;
}

const DEFAULT_USERS_STORE: StoredUserAccount[] = [
  { ...INITIAL_USER, password: 'password123' },
  { ...INITIAL_HOST, password: 'password123' },
];

export const authService = {
  getCurrentUser: (): UserProfile => {
    return storage.get<UserProfile>(USER_KEY, INITIAL_USER);
  },

  setCurrentUser: (user: UserProfile): void => {
    storage.set(USER_KEY, user);
  },

  getAllUsers: (): StoredUserAccount[] => {
    return storage.get<StoredUserAccount[]>(USERS_DB_KEY, DEFAULT_USERS_STORE);
  },

  fetchProfileAsync: async (userId?: string): Promise<UserProfile | null> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: sessionData } = await client.auth.getSession();
        const activeUserId = sessionData?.session?.user?.id || (userId && !userId.startsWith('user-') && !userId.startsWith('guest') ? userId : undefined);

        if (activeUserId) {
          const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', activeUserId)
            .maybeSingle();

          if (!error && data) {
            const user = mapDbProfileToUser(data);
            storage.set(USER_KEY, user);
            return user;
          }
        }
      } catch (err: any) {
        console.warn('[authService] Error fetching profile from Supabase:', err?.message || err);
      }
    }

    return authService.getCurrentUser();
  },

  updateProfileAsync: async (userId?: string, data?: Partial<UserProfile>): Promise<void> => {
    if (!data) return;

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: sessionData } = await client.auth.getSession();
        const activeUserId = sessionData?.session?.user?.id || (userId && !userId.startsWith('user-') && !userId.startsWith('guest') ? userId : undefined);
        if (!activeUserId) return;

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (data.name !== undefined) updatePayload.name = data.name;
        if (data.phone !== undefined) updatePayload.phone = data.phone;
        if (data.avatar !== undefined) updatePayload.avatar = data.avatar;
        if (data.role !== undefined) updatePayload.role = data.role;
        if (data.company !== undefined) updatePayload.company = data.company;
        if (data.bio !== undefined) updatePayload.bio = data.bio;
        if (data.walletBalanceNgn !== undefined) updatePayload.wallet_balance_ngn = data.walletBalanceNgn;
        if (data.savedSpaceIds !== undefined) updatePayload.saved_space_ids = data.savedSpaceIds;

        await client.from('profiles').update(updatePayload).eq('id', activeUserId);
      } catch (err: any) {
        console.warn('[authService] Error updating profile in Supabase:', err?.message || err);
      }
    }
  },

  loginWithGoogle: async (): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not configured.' };
    }

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: 'Redirecting to Google authentication...',
      };
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      return {
        success: false,
        message: err.message || 'Google sign-in failed. Please try again.',
      };
    }
  },

  register: async (payload: RegisterPayload): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
    const cleanName = (payload.name || '').trim();
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const cleanPhone = (payload.phone || '').trim();
    const cleanCompany = (payload.company || '').trim();
    const password = (payload.password || '').trim() || 'Password123!';

    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Please provide your full name (minimum 2 characters).' };
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    ];

    let createdUserId = `user-${Date.now()}`;
    let isEmailVerified = false;

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: authData, error: authError } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
              phone: cleanPhone,
              role: payload.role || 'user',
              company: cleanCompany,
            },
          },
        });

        if (authError) {
          if (authError.message.toLowerCase().includes('already registered') || authError.message.toLowerCase().includes('unique')) {
            return {
              success: false,
              message: 'An account already exists with this email address. Please sign in instead.',
            };
          }
          console.warn('[authService] Supabase signUp notice:', authError.message);
        } else if (authData.user) {
          createdUserId = authData.user.id;
          isEmailVerified = Boolean(authData.user.email_confirmed_at);
        }
      } catch (err: any) {
        console.warn('[authService] Supabase signUp exception:', err);
      }
    }

    const userProfile: UserProfile = {
      id: createdUserId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || '+234 800 000 0000',
      avatar: payload.avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      role: payload.role || 'user',
      company: cleanCompany || (payload.role === 'host' ? 'OFIS Workspace Host' : 'Independent Professional'),
      bio: payload.role === 'host' ? 'Verified Workspace Host on OFIS network.' : 'OFIS verified remote professional.',
      walletBalanceNgn: payload.role === 'user' ? 25000 : 150000,
      savedSpaceIds: [],
      isEmailVerified,
      createdAt: new Date().toISOString(),
    };

    // Ensure profile row in Supabase profiles table
    if (client) {
      try {
        await client.from('profiles').upsert(mapProfileToDbProfile(userProfile), { onConflict: 'id' });
      } catch (profErr) {
        console.warn('[authService] Profile upsert notice:', profErr);
      }
    }

    authService.setCurrentUser(userProfile);

    // Save to local list for quick fallback
    const users = authService.getAllUsers();
    const updatedUsers = [{ ...userProfile, password }, ...users.filter(u => u.email !== cleanEmail)];
    storage.set(USERS_DB_KEY, updatedUsers);

    return {
      success: true,
      user: userProfile,
      message: `Account created successfully! Welcome to OFIS, ${userProfile.name}.`,
    };
  },

  login: async (emailOrPhone: string, password?: string): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
    const query = (emailOrPhone || '').trim();
    const cleanEmail = query.toLowerCase();

    // 1. Try Supabase Auth if query is an email and password is provided
    const client = getSupabaseClient();
    if (client && cleanEmail.includes('@') && password) {
      try {
        const { data: authData, error: authError } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!authError && authData.user) {
          let userProfile = await authService.fetchProfileAsync(authData.user.id);

          if (!userProfile) {
            userProfile = {
              id: authData.user.id,
              name: authData.user.user_metadata?.name || cleanEmail.split('@')[0],
              email: authData.user.email || cleanEmail,
              phone: authData.user.user_metadata?.phone || '+234 800 000 0000',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              role: (authData.user.user_metadata?.role as any) || 'user',
              company: authData.user.user_metadata?.company || 'Independent Professional',
              bio: 'Verified OFIS Member',
              walletBalanceNgn: 25000,
              savedSpaceIds: [],
              isEmailVerified: Boolean(authData.user.email_confirmed_at),
              createdAt: new Date().toISOString(),
            };

            try {
              await client.from('profiles').upsert(mapProfileToDbProfile(userProfile), { onConflict: 'id' });
            } catch (pErr) {
              console.warn('[authService] Profile auto-create error:', pErr);
            }
          }

          authService.setCurrentUser(userProfile);
          return {
            success: true,
            user: userProfile,
            message: `Welcome back, ${userProfile.name}! Signed in via Supabase.`,
          };
        } else if (authError) {
          console.warn('[authService] Supabase signIn notice:', authError.message);
          if (authError.message.toLowerCase().includes('invalid login credentials')) {
            return {
              success: false,
              message: 'Incorrect password or email. Please verify your credentials and try again.',
            };
          }
        }
      } catch (err: any) {
        console.warn('[authService] Supabase signIn exception:', err);
      }
    }

    // 2. Demo accounts & offline local account fallback (for phone logins or demo testing)
    const cleanQueryNoSpaces = cleanEmail.replace(/[\s+-]/g, '');
    const users = authService.getAllUsers();
    const matched = users.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uPhone = (u.phone || '').replace(/[\s+-]/g, '');
      const uName = (u.name || '').toLowerCase();
      return uEmail === cleanEmail || uPhone === cleanQueryNoSpaces || (cleanQueryNoSpaces.length >= 7 && uPhone.includes(cleanQueryNoSpaces)) || uName === cleanEmail;
    });

    if (matched) {
      if (password && matched.password && matched.password !== password) {
        return {
          success: false,
          message: 'Incorrect password for this account. Please try again.',
        };
      }
      const { password: _, ...userProfile } = matched;
      storage.set(USER_KEY, userProfile);
      return {
        success: true,
        user: userProfile,
        message: `Welcome back, ${userProfile.name}!`,
      };
    }

    // Check default quick accounts
    if (cleanEmail.includes('host') || cleanEmail.includes('funke')) {
      storage.set(USER_KEY, INITIAL_HOST);
      return { success: true, user: INITIAL_HOST, message: 'Logged in as Host (Funke Akindele-Cole)' };
    }

    if (cleanEmail.includes('tunde') || cleanEmail.includes('user') || cleanEmail.includes('paystack')) {
      storage.set(USER_KEY, INITIAL_USER);
      return { success: true, user: INITIAL_USER, message: 'Logged in as User (Babatunde Adeyemi)' };
    }

    return {
      success: false,
      message: 'Account not found with this email or phone. Please create a new account or check credentials.',
    };
  },

  switchRole: (role: 'user' | 'host'): UserProfile => {
    const current = authService.getCurrentUser();
    const user: UserProfile = {
      ...current,
      role,
      company: role === 'host' ? (current.company || 'OFIS Workspace Host') : current.company,
    };
    storage.set(USER_KEY, user);
    authService.updateProfileAsync(user.id, { role: user.role, company: user.company });
    return user;
  },

  logout: async (): Promise<UserProfile> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('[authService] Supabase signOut error:', err);
      }
    }
    storage.set(USER_KEY, GUEST_USER);
    return GUEST_USER;
  },

  verifyEmail: (userId?: string): UserProfile => {
    const current = authService.getCurrentUser();
    const updated: UserProfile = {
      ...current,
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
    };
    storage.set(USER_KEY, updated);

    const users = authService.getAllUsers();
    const updatedUsers = users.map(u => {
      if (u.id === (userId || current.id) || (u.email && u.email.toLowerCase() === current.email.toLowerCase())) {
        return { ...u, isEmailVerified: true, emailVerifiedAt: new Date().toISOString() };
      }
      return u;
    });
    storage.set(USERS_DB_KEY, updatedUsers);

    authService.updateProfileAsync(updated.id, { isEmailVerified: true });
    return updated;
  },

  setEmailVerifiedStatus: (userId: string, isVerified: boolean): UserProfile => {
    const current = authService.getCurrentUser();
    const isCurrent = current.id === userId;
    const updated: UserProfile = isCurrent ? {
      ...current,
      isEmailVerified: isVerified,
      emailVerifiedAt: isVerified ? new Date().toISOString() : undefined,
    } : current;

    if (isCurrent) {
      storage.set(USER_KEY, updated);
    }

    const users = authService.getAllUsers();
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, isEmailVerified: isVerified, emailVerifiedAt: isVerified ? new Date().toISOString() : undefined };
      }
      return u;
    });
    storage.set(USERS_DB_KEY, updatedUsers);

    authService.updateProfileAsync(userId, { isEmailVerified: isVerified });
    return updated;
  },

  loginAsDefault: (role: 'user' | 'host' = 'user'): UserProfile => {
    const user = role === 'host' ? INITIAL_HOST : INITIAL_USER;
    storage.set(USER_KEY, user);
    return user;
  },
};
