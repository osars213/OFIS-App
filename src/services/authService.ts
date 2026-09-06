import { UserProfile } from '../types';
import { INITIAL_USER, INITIAL_HOST, GUEST_USER } from '../mockData';
import { storage } from './storageService';
import { getSupabaseClient, mapDbProfileToUser } from './supabaseClient';

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

  fetchProfileAsync: async (userId: string): Promise<UserProfile | null> => {
    const client = getSupabaseClient();
    if (!client || !userId || userId.startsWith('guest')) return null;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const user = mapDbProfileToUser(data);
        storage.set(USER_KEY, user);
        return user;
      }
    } catch (err) {
      console.warn('[authService] Error fetching profile from Supabase:', err);
    }
    return null;
  },

  updateProfileAsync: async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    const client = getSupabaseClient();
    if (!client || !userId || userId.startsWith('guest')) return;

    try {
      const dbPayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (data.name !== undefined) dbPayload.name = data.name;
      if (data.phone !== undefined) dbPayload.phone = data.phone;
      if (data.avatar !== undefined) dbPayload.avatar = data.avatar;
      if (data.role !== undefined) dbPayload.role = data.role;
      if (data.company !== undefined) dbPayload.company = data.company;
      if (data.bio !== undefined) dbPayload.bio = data.bio;
      if (data.walletBalanceNgn !== undefined) dbPayload.wallet_balance_ngn = data.walletBalanceNgn;
      if (data.savedSpaceIds !== undefined) dbPayload.saved_space_ids = data.savedSpaceIds;
      if (data.isEmailVerified !== undefined) dbPayload.is_email_verified = data.isEmailVerified;
      if (data.emailVerifiedAt !== undefined) dbPayload.email_verified_at = data.emailVerifiedAt;

      await client.from('profiles').update(dbPayload).eq('id', userId);
    } catch (err) {
      console.warn('[authService] Error updating profile in Supabase:', err);
    }
  },

  register: async (payload: RegisterPayload): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
    const cleanName = (payload.name || '').trim();
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const cleanPhone = (payload.phone || '').trim();
    const cleanCompany = (payload.company || '').trim();
    const password = (payload.password || '').trim() || 'Password123!';

    if (!cleanName) {
      return { success: false, message: 'Please provide your full name.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    const client = getSupabaseClient();

    // 1. Try Supabase Auth first if configured
    if (client) {
      try {
        const { data: authData, error: authError } = await client.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              name: cleanName,
              phone: cleanPhone,
              role: payload.role,
              company: cleanCompany,
              avatar: payload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            },
          },
        });

        if (!authError && authData.user) {
          const userProfile: UserProfile = {
            id: authData.user.id,
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone || '+234 800 000 0000',
            avatar: payload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            role: payload.role,
            isEmailVerified: authData.user.email_confirmed_at ? true : false,
            emailVerifiedAt: authData.user.email_confirmed_at,
            company: cleanCompany || (payload.role === 'host' ? 'OFIS Workspace Host' : 'Independent Professional'),
            bio: payload.role === 'host' ? 'Verified Workspace Host on OFIS network.' : 'OFIS verified remote professional.',
            walletBalanceNgn: payload.role === 'user' ? 25000 : 150000,
            savedSpaceIds: [],
            createdAt: new Date().toISOString(),
          };

          // Upsert into public.profiles
          try {
            await client.from('profiles').upsert({
              id: authData.user.id,
              name: userProfile.name,
              email: userProfile.email,
              phone: userProfile.phone,
              avatar: userProfile.avatar,
              role: userProfile.role,
              company: userProfile.company,
              bio: userProfile.bio,
              wallet_balance_ngn: userProfile.walletBalanceNgn,
              saved_space_ids: userProfile.savedSpaceIds,
              is_email_verified: userProfile.isEmailVerified,
            });
          } catch (profileErr) {
            console.warn('[authService] Note on upserting profile table:', profileErr);
          }

          authService.setCurrentUser(userProfile);
          return {
            success: true,
            user: userProfile,
            message: `Account created successfully with Supabase Auth! Please verify your email ${userProfile.email} to list workspaces or pay.`,
          };
        } else if (authError && authError.message.toLowerCase().includes('already registered')) {
          // If already registered in Supabase, attempt sign in with provided password
          const loginRes = await authService.login(cleanEmail, password);
          return loginRes;
        }
      } catch (err: any) {
        console.warn('[authService] Supabase signup error, falling back to local store:', err);
      }
    }

    // 2. Local fallback storage
    const users = authService.getAllUsers();
    const existing = users.find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (existing) {
      const updatedUser: UserProfile = {
        id: existing.id,
        name: existing.name || cleanName,
        email: existing.email,
        phone: existing.phone || cleanPhone,
        avatar: existing.avatar || payload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        role: existing.role || payload.role,
        isEmailVerified: existing.isEmailVerified ?? false,
        emailVerifiedAt: existing.emailVerifiedAt,
        company: existing.company || cleanCompany,
        bio: existing.bio || (payload.role === 'host' ? 'Verified Workspace Host on OFIS network.' : 'OFIS verified remote professional.'),
        walletBalanceNgn: existing.walletBalanceNgn ?? (payload.role === 'user' ? 25000 : 150000),
        savedSpaceIds: existing.savedSpaceIds || [],
        createdAt: existing.createdAt || new Date().toISOString(),
      };

      authService.setCurrentUser(updatedUser);
      return {
        success: true,
        user: updatedUser,
        message: `Welcome back, ${updatedUser.name}! Logged into your existing OFIS account.`,
      };
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    ];

    const newUser: StoredUserAccount = {
      id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || '+234 800 000 0000',
      avatar: payload.avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      role: payload.role,
      isEmailVerified: false, // Must be verified before listing or paying
      company: cleanCompany || (payload.role === 'host' ? 'OFIS Workspace Host' : 'Independent Professional'),
      bio: payload.role === 'host' ? 'Verified Workspace Host on OFIS network.' : 'OFIS verified remote professional.',
      walletBalanceNgn: payload.role === 'user' ? 25000 : 150000,
      savedSpaceIds: [],
      createdAt: new Date().toISOString(),
      password: password || undefined,
    };

    const updatedUsers = [newUser, ...users];
    storage.set(USERS_DB_KEY, updatedUsers);
    
    const { password: _, ...userProfile } = newUser;
    authService.setCurrentUser(userProfile);

    return {
      success: true,
      user: userProfile,
      message: `Account created successfully! Welcome to OFIS, ${newUser.name}. Please verify your email (${userProfile.email}) to list workspaces and authorize payments.`,
    };
  },

  login: async (emailOrPhone: string, password?: string): Promise<{ success: boolean; user?: UserProfile; message: string }> => {
    const query = (emailOrPhone || '').trim().toLowerCase();
    const cleanQueryNoSpaces = query.replace(/[\s+-]/g, '');
    const client = getSupabaseClient();

    // 1. Try Supabase Auth if email and password provided
    if (client && query.includes('@') && password) {
      try {
        const { data: authData, error: authError } = await client.auth.signInWithPassword({
          email: query,
          password: password,
        });

        if (!authError && authData.user) {
          // Fetch authoritative profile
          const { data: profileData } = await client
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          const userProfile: UserProfile = profileData
            ? mapDbProfileToUser(profileData)
            : {
                id: authData.user.id,
                name: authData.user.user_metadata?.name || 'OFIS Member',
                email: authData.user.email || query,
                phone: authData.user.user_metadata?.phone || '+234 800 000 0000',
                avatar: authData.user.user_metadata?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                role: authData.user.user_metadata?.role || 'user',
                company: authData.user.user_metadata?.company || 'Independent Professional',
                walletBalanceNgn: 25000,
                savedSpaceIds: [],
                createdAt: new Date().toISOString(),
              };

          authService.setCurrentUser(userProfile);
          return {
            success: true,
            user: userProfile,
            message: `Welcome back, ${userProfile.name}! (Authenticated with Supabase)`,
          };
        }
      } catch (err) {
        console.warn('[authService] Supabase login attempt note:', err);
      }
    }

    // 2. Local registered user database check
    const users = authService.getAllUsers();
    const matched = users.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uPhone = (u.phone || '').replace(/[\s+-]/g, '');
      const uName = (u.name || '').toLowerCase();
      return uEmail === query || uPhone === cleanQueryNoSpaces || (cleanQueryNoSpaces.length >= 7 && uPhone.includes(cleanQueryNoSpaces)) || uName === query;
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
    if (query.includes('host') || query.includes('funke')) {
      storage.set(USER_KEY, INITIAL_HOST);
      return { success: true, user: INITIAL_HOST, message: 'Logged in as Host (Funke Akindele-Cole)' };
    }

    if (query.includes('tunde') || query.includes('user') || query.includes('paystack')) {
      storage.set(USER_KEY, INITIAL_USER);
      return { success: true, user: INITIAL_USER, message: 'Logged in as User (Babatunde Adeyemi)' };
    }

    return {
      success: false,
      message: 'Account not found with this email or phone. Please create a new account.',
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

  loginAsDefault: (role: 'user' | 'host' = 'user'): UserProfile => {
    const user = role === 'host' ? INITIAL_HOST : INITIAL_USER;
    storage.set(USER_KEY, user);
    return user;
  },

  verifyEmail: (userId?: string): UserProfile => {
    const current = authService.getCurrentUser();
    const updated: UserProfile = {
      ...current,
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
    };
    storage.set(USER_KEY, updated);

    // Update in local users store if present
    const users = authService.getAllUsers();
    const updatedUsers = users.map(u => {
      if (u.id === (userId || current.id) || (u.email && u.email.toLowerCase() === current.email.toLowerCase())) {
        return { ...u, isEmailVerified: true, emailVerifiedAt: new Date().toISOString() };
      }
      return u;
    });
    storage.set(USERS_DB_KEY, updatedUsers);

    authService.updateProfileAsync(updated.id, { isEmailVerified: true, emailVerifiedAt: updated.emailVerifiedAt });
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

    authService.updateProfileAsync(userId, { isEmailVerified: isVerified, emailVerifiedAt: isVerified ? new Date().toISOString() : undefined });
    return updated;
  },
};
