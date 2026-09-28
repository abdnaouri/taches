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
      fullName: row.full_name || 'Utilisateur',
      avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      activeRole: (row.active_role as UserRole) || 'CUSTOMER',
      balanceAvailable: Number(row.balance_available ?? 100),
      balanceEscrow: Number(row.balance_escrow ?? 0),
      createdAt: row.created_at || new Date().toISOString(),
      performerTier: row.performer_tier || 'level_3',
      performerXp: Number(row.performer_xp ?? 780),
      performerRating: Number(row.performer_rating ?? 4.96),
      performerReviewsCount: Number(row.performer_reviews_count ?? 48),
      performerCompletedTasks: Number(row.performer_completed_tasks ?? 52),
      passedQualification: Boolean(row.passed_qualification ?? true),
      customerRating: Number(row.customer_rating ?? 5.0),
      customerTotalSpent: Number(row.customer_total_spent ?? 640),
      customerTasksPosted: Number(row.customer_tasks_posted ?? 11),
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
        balanceAvailable: 100,
        balanceEscrow: 0,
        createdAt: new Date().toISOString(),
        performerTier: 'level_3',
        performerXp: 780,
        performerRating: 5.0,
        performerReviewsCount: 0,
        performerCompletedTasks: 0,
        passedQualification: true,
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
        balanceAvailable: 100,
        balanceEscrow: 0,
        createdAt: new Date().toISOString(),
        performerTier: 'level_3',
        performerXp: 780,
        performerRating: 5.0,
        performerReviewsCount: 0,
        performerCompletedTasks: 0,
        passedQualification: true,
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

    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user.email || '').finally(() => {
          setLoading(false);
        });
      } else {
        setProfile(null);
        localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user.email || '');
      } else {
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

  // Sign In with email & password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email || email);

        // Execute pending callback if any
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
      } catch { }
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
    } catch { }

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

      if (Object.keys(dbUpdates).length > 0) {
        await (supabase as any).from('profiles').update(dbUpdates).eq('id', user.id);
      }

    } catch (err) {
      console.warn('Failed to update profile in DB:', err);
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
