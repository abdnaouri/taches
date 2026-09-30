'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, UserRole } from '@/types/database';

import { initialUser } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  authPromptMessage: string | null;
  openAuthModal: (mode?: 'login' | 'signup', promptMessage?: string, onComplete?: () => void) => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInDemo: () => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  toggleRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_PROFILE_KEY = 'taches_auth_profile';
const LOCAL_STORAGE_DEMO_KEY = 'taches_demo_auth_active';

const createDemoUserAndSession = (customProfile?: UserProfile) => {
  const profileToUse = customProfile || initialUser;
  const mockUser: User = {
    id: profileToUse.id || 'usr_me_1',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      full_name: profileToUse.fullName,
      avatar_url: profileToUse.avatarUrl,
      active_role: profileToUse.activeRole,
    },
    aud: 'authenticated',
    confirmation_sent_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    created_at: profileToUse.createdAt || new Date().toISOString(),
    email: profileToUse.email,
    phone: '',
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  } as User;

  const mockSession: Session = {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
    token_type: 'bearer',
    user: mockUser,
  };

  return { mockUser, mockSession, profile: profileToUse };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
  const [postAuthCallback, setPostAuthCallback] = useState<(() => void) | null>(null);

  // Map DB snake_case to frontend UserProfile
  // Map DB snake_case to frontend UserProfile
  const mapDbProfile = (row: any, userEmail: string): UserProfile => {
    return {
      id: row.id,
      email: row.email || userEmail,
      fullName: row.full_name || 'Utilisateur',
      avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      activeRole: (row.active_role as UserRole) || 'CUSTOMER',
      balanceAvailable: Number(row.balance_available ?? 0),
      balanceEscrow: Number(row.balance_escrow ?? 0),
      isAdmin: Boolean(row.is_admin ?? false),
      createdAt: row.created_at || new Date().toISOString(),
      performerTier: row.performer_tier || 'level_1',
      performerXp: Number(row.performer_xp ?? 0),
      performerRating: Number(row.performer_rating ?? 5.0),
      performerReviewsCount: Number(row.performer_reviews_count ?? 0),
      performerCompletedTasks: Number(row.performer_completed_tasks ?? 0),
      passedQualification: Boolean(row.passed_qualification ?? false),
      customerRating: Number(row.customer_rating ?? 5.0),
      customerTotalSpent: Number(row.customer_total_spent ?? 0),
      customerTasksPosted: Number(row.customer_tasks_posted ?? 0),

      // Extended Worker Fields
      headline: row.headline || initialUser.headline,
      bio: row.bio || initialUser.bio,
      city: row.city || initialUser.city || 'Casablanca',
      phone: row.phone || initialUser.phone,
      whatsappEnabled: row.whatsapp_enabled !== undefined ? Boolean(row.whatsapp_enabled) : initialUser.whatsappEnabled,
      cin: row.cin || initialUser.cin,
      cinVerified: row.cin_verified !== undefined ? Boolean(row.cin_verified) : initialUser.cinVerified,
      languages: row.languages || initialUser.languages,
      skills: row.skills || initialUser.skills,
      specializedCategories: row.specialized_categories || initialUser.specializedCategories,
      minTaskReward: row.min_task_reward ?? initialUser.minTaskReward,
      isAvailableForHire: row.is_available_for_hire !== undefined ? Boolean(row.is_available_for_hire) : initialUser.isAvailableForHire,
      bankName: row.bank_name || initialUser.bankName,
      bankRib: row.bank_rib || initialUser.bankRib,
      bankAccountHolder: row.bank_account_holder || initialUser.bankAccountHolder,
      portfolio: row.portfolio || initialUser.portfolio,
      certifications: row.certifications || initialUser.certifications,
      notifyWhatsapp: row.notify_whatsapp !== undefined ? Boolean(row.notify_whatsapp) : initialUser.notifyWhatsapp,
      notifyEmail: row.notify_email !== undefined ? Boolean(row.notify_email) : initialUser.notifyEmail,
    };
  };

  // Fetch or create profile for authenticated user
  const fetchProfile = useCallback(async (userId: string, email: string): Promise<UserProfile> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const mapped = mapDbProfile(data, email);
        setProfile(mapped);
        try {
          localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(mapped));
        } catch { }
        return mapped;
      }

      // If profile record does not exist yet, build fallback and insert it
      const fallback: UserProfile = {
        id: userId,
        email: email,
        fullName: email.split('@')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
        activeRole: 'CUSTOMER',
        balanceAvailable: 0,
        balanceEscrow: 0,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        performerTier: 'level_1',
        performerXp: 0,
        performerRating: 5.0,
        performerReviewsCount: 0,
        performerCompletedTasks: 0,
        passedQualification: false,
        customerRating: 5.0,
        customerTotalSpent: 0,
        customerTasksPosted: 0,
      };

      await (supabase as any).from('profiles').insert({
        id: userId,
        email,
        full_name: fallback.fullName,
        avatar_url: fallback.avatarUrl,
        active_role: fallback.activeRole,
        balance_available: fallback.balanceAvailable,
        balance_escrow: fallback.balanceEscrow,
        passed_qualification: false,
      });

      setProfile(fallback);
      try {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(fallback));
      } catch { }
      return fallback;
    } catch (err) {
      console.warn('Profile fetch exception:', err);
      // Return cached or basic fallback
      const cached = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
        return parsed;
      }
      const basic: UserProfile = {
        id: userId,
        email,
        fullName: email.split('@')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
        activeRole: 'CUSTOMER',
        balanceAvailable: 0,
        balanceEscrow: 0,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        performerTier: 'level_1',
        performerXp: 0,
        performerRating: 5.0,
        performerReviewsCount: 0,
        performerCompletedTasks: 0,
        passedQualification: false,
        customerRating: 5.0,
        customerTotalSpent: 0,
        customerTasksPosted: 0,
      };
      setProfile(basic);
      return basic;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '');
    }
  }, [user, fetchProfile]);

  // Initial Auth Check and Auth State Listener
  useEffect(() => {
    // Attempt fast read from localStorage
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (cached) {
        setProfile(JSON.parse(cached));
      }
    } catch { }

    const isDemoActive = typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_DEMO_KEY) === 'true';

    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        fetchProfile(currentSession.user.id, currentSession.user.email || '').finally(() => {
          setLoading(false);
        });
      } else if (isDemoActive) {
        const cachedProfileStr = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY) : null;
        const userProfile = cachedProfileStr ? JSON.parse(cachedProfileStr) : initialUser;
        const { mockUser, mockSession } = createDemoUserAndSession(userProfile);
        setUser(mockUser);
        setSession(mockSession);
        setProfile(userProfile);
        setLoading(false);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        try {
          localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
        } catch { }
        setLoading(false);
      }
    }).catch(() => {
      if (isDemoActive) {
        const cachedProfileStr = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY) : null;
        const userProfile = cachedProfileStr ? JSON.parse(cachedProfileStr) : initialUser;
        const { mockUser, mockSession } = createDemoUserAndSession(userProfile);
        setUser(mockUser);
        setSession(mockSession);
        setProfile(userProfile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        try {
          localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
        } catch { }
        await fetchProfile(newSession.user.id, newSession.user.email || '');
      } else if (localStorage.getItem(LOCAL_STORAGE_DEMO_KEY) === 'true') {
        // Keep demo session active
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        try {
          localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
        } catch { }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Demo Login helper
  const signInDemo = async () => {
    try {
      // 1. Try real Supabase auth if configured and reachable
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'aero@example.com',
          password: 'password123',
        });

        if (!error && data.user && data.session) {
          setUser(data.user);
          setSession(data.session);
          try {
            localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
          } catch { }
          await fetchProfile(data.user.id, data.user.email || 'aero@example.com');
          if (postAuthCallback) {
            postAuthCallback();
            setPostAuthCallback(null);
          }
          setIsAuthModalOpen(false);
          return { success: true };
        }
      } catch {
        // Continue to offline demo user fallback
      }

      // 2. Offline / Demo Fallback Mode
      const cachedProfileStr = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY) : null;
      const userProfile = cachedProfileStr ? JSON.parse(cachedProfileStr) : initialUser;
      const { mockUser, mockSession } = createDemoUserAndSession(userProfile);

      setUser(mockUser);
      setSession(mockSession);
      setProfile(userProfile);

      try {
        localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, 'true');
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(userProfile));
      } catch { }

      if (postAuthCallback) {
        postAuthCallback();
        setPostAuthCallback(null);
      }
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la connexion démo' };
    }
  };

  // Sign In with email & password
  const signIn = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        // If it is the demo account, fallback gracefully
        if (trimmedEmail.toLowerCase() === 'aero@example.com') {
          return await signInDemo();
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        try {
          localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
        } catch { }
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email || trimmedEmail);

        // Execute pending callback if any
        if (postAuthCallback) {
          postAuthCallback();
          setPostAuthCallback(null);
        }
        setIsAuthModalOpen(false);
      }

      return { success: true };
    } catch (err: any) {
      if (trimmedEmail.toLowerCase() === 'aero@example.com') {
        return await signInDemo();
      }
      return { success: false, error: err.message || 'Erreur lors de la connexion' };
    }
  };

  // Sign Up with email, password, full name, and role
  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'CUSTOMER') => {
    try {
      // 1. Call server API route which creates pre-confirmed user
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, fullName, role }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Erreur lors de la création du compte' };
      }

      // 2. Immediately sign in to establish client session
      const signInRes = await signIn(email, password);
      return signInRes;
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de l’inscription' };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      try {
        localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
      } catch { }
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const baseProfile = profile || initialUser;
    const newProfile = { ...baseProfile, ...updates };
    setProfile(newProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
    } catch { }

    if (user && !user.id.startsWith('usr_me_')) {
      try {
        const dbUpdates: any = {};
        if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.activeRole !== undefined) dbUpdates.active_role = updates.activeRole;
        if (updates.balanceAvailable !== undefined) dbUpdates.balance_available = updates.balanceAvailable;
        if (updates.balanceEscrow !== undefined) dbUpdates.balance_escrow = updates.balanceEscrow;
        if (updates.passedQualification !== undefined) dbUpdates.passed_qualification = updates.passedQualification;
        if (updates.customerTasksPosted !== undefined) dbUpdates.customer_tasks_posted = updates.customerTasksPosted;
        if (updates.customerTotalSpent !== undefined) dbUpdates.customer_total_spent = updates.customerTotalSpent;
        if (updates.performerCompletedTasks !== undefined) dbUpdates.performer_completed_tasks = updates.performerCompletedTasks;
        if (updates.headline !== undefined) dbUpdates.headline = updates.headline;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.city !== undefined) dbUpdates.city = updates.city;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.whatsappEnabled !== undefined) dbUpdates.whatsapp_enabled = updates.whatsappEnabled;
        if (updates.cin !== undefined) dbUpdates.cin = updates.cin;
        if (updates.cinVerified !== undefined) dbUpdates.cin_verified = updates.cinVerified;
        if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
        if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
        if (updates.specializedCategories !== undefined) dbUpdates.specialized_categories = updates.specializedCategories;
        if (updates.minTaskReward !== undefined) dbUpdates.min_task_reward = updates.minTaskReward;
        if (updates.isAvailableForHire !== undefined) dbUpdates.is_available_for_hire = updates.isAvailableForHire;
        if (updates.bankName !== undefined) dbUpdates.bank_name = updates.bankName;
        if (updates.bankRib !== undefined) dbUpdates.bank_rib = updates.bankRib;
        if (updates.bankAccountHolder !== undefined) dbUpdates.bank_account_holder = updates.bankAccountHolder;
        if (updates.portfolio !== undefined) dbUpdates.portfolio = updates.portfolio;
        if (updates.certifications !== undefined) dbUpdates.certifications = updates.certifications;
        if (updates.notifyWhatsapp !== undefined) dbUpdates.notify_whatsapp = updates.notifyWhatsapp;
        if (updates.notifyEmail !== undefined) dbUpdates.notify_email = updates.notifyEmail;

        if (Object.keys(dbUpdates).length > 0) {
          await (supabase as any).from('profiles').update(dbUpdates).eq('id', user.id);
        }
      } catch (err) {
        console.warn('Failed to update profile in DB:', err);
      }
    }
  };

  // Toggle user role
  const toggleRole = async (role: UserRole) => {
    await updateProfile({ activeRole: role });
  };

  // Open auth modal
  const openAuthModal = (
    mode: 'login' | 'signup' = 'login',
    promptMessage?: string,
    onComplete?: () => void
  ) => {
    setAuthModalMode(mode);
    setAuthPromptMessage(promptMessage || null);
    if (onComplete) {
      setPostAuthCallback(() => onComplete);
    } else {
      setPostAuthCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  // Close auth modal
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
    setPostAuthCallback(null);
  };

  const isAuthenticated = Boolean(user && session);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAuthenticated,
        isAuthModalOpen,
        authModalMode,
        authPromptMessage,
        openAuthModal,
        closeAuthModal,
        signIn,
        signInDemo,
        signUp,
        signOut,
        updateProfile,
        toggleRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
