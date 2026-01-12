import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserPreferences } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  preferences: UserPreferences | null;
  credits: number;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<{ error: Error | null }>;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async (userId: string) => {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setPreferences(data);
    }
  };

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase
      .from('credits_ledger')
      .select('balance_after')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setCredits(data?.balance_after ?? 0);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPreferences(session.user.id);
        fetchCredits(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await fetchPreferences(session.user.id);
          await fetchCredits(session.user.id);
        })();
      } else {
        setPreferences(null);
        setCredits(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      await supabase.from('user_preferences').insert({
        user_id: data.user.id,
        language: 'EN',
        reading_tone: 'soft',
        focus_areas: [],
        experience_level: 'beginner',
      });

      await supabase.from('credits_ledger').insert({
        user_id: data.user.id,
        amount: 3,
        transaction_type: 'signup',
        description: 'Welcome bonus credits',
        balance_after: 3,
      });

      await supabase.from('customers').insert({
        user_id: data.user.id,
        email: email,
      });
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPreferences(null);
    setCredits(0);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('user_preferences')
      .update({ ...prefs, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (!error) {
      setPreferences(prev => prev ? { ...prev, ...prefs } : null);
    }

    return { error: error as Error | null };
  };

  const refreshCredits = async () => {
    if (user) {
      await fetchCredits(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      preferences,
      credits,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePreferences,
      refreshCredits,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
