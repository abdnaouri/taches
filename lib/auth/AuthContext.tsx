'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, UserRole } from '@/types/database';

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
  const mapDbProfile = (row: any, userEmail: string): UserProfile => {
    return {
      id: row.id,
      email: row.email || userEmail,
      fullName: row.full_name || userEmail.split('@')[0],
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
      headline: row.headline || '',
      bio: row.bio || '',
      city: row.city || 'Casablanca',
      phone: row.phone || '',
      whatsappEnabled: row.whatsapp_enabled !== undefined ? Boolean(row.whatsapp_enabled) : true,
      cin: row.cin || '',
      cinVerified: Boolean(row.cin_verified ?? false),
      languages: row.languages || [],
      skills: row.skills || [],
      specializedCategories: row.specialized_categories || [],
      minTaskReward: row.min_task_reward ? Number(row.min_task_reward) : 30,
      isAvailableForHire: row.is_available_for_hire !== undefined ? Boolean(row.is_available_for_hire) : true,
      bankName: row.bank_name || 'CIH Bank',
      bankRib: row.bank_rib || '',
      bankAccountHolder: row.bank_account_holder || '',
      portfolio: row.portfolio || [],
      certifications: row.certifications || [],
      notifyWhatsapp: row.notify_whatsapp !== undefined ? Boolean(row.notify_whatsapp) : true,
      notifyEmail: row.notify_email !== undefined ? Boolean(row.notify_email) : true,
    };
  };

  // Fetch profile for authenticated user from Supabase API
  const fetchProfile = useCallback(async (userId: string, email: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          try {
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(data.profile));
          } catch { }
          return data.profile;
        }
      }

      // Direct Supabase query fallback if API route failed
      const { data: dbData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (dbData) {
        const mapped = mapDbProfile(dbData, email);
        setProfile(mapped);
        try {
          localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(mapped));
        } catch { }
        return mapped;
      }

      return null;
    } catch (err) {
      console.error('Profile fetch exception:', err);
      const cached = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
        return parsed;
      }
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '');
    }
  }, [user, fetchProfile]);

  // Initial Auth Check and Auth State Listener
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (cached) {
        setProfile(JSON.parse(cached));
      }
    } catch { }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        fetchProfile(currentSession.user.id, currentSession.user.email || '').finally(() => {
          setLoading(false);
        });
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
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await fetchProfile(newSession.user.id, newSession.user.email || '');
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

  // Demo / Fast Login with seeded user account
  const signInDemo = async () => {
    return await signIn('aero@example.com', 'password123');
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
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email || trimmedEmail);

        if (postAuthCallback) {
          postAuthCallback();
          setPostAuthCallback(null);
        }
        setIsAuthModalOpen(false);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la connexion' };
    }
  };

  // Sign Up with email, password, full name, and role
  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'CUSTOMER') => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, fullName, role }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Erreur lors de la création du compte' };
      }

      // Automatically sign in
      return await signIn(email, password);
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de l’inscription' };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      try {
        localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
      } catch { }
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile && !user) return;
    const targetId = user?.id || profile?.id;
    if (!targetId) return;

    const newProfile = { ...(profile || {}), ...updates } as UserProfile;
    setProfile(newProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
    } catch { }

    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetId, ...updates }),
      });
    } catch (err) {
      console.error('Failed to update profile via API:', err);
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
