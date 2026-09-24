'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

export type UserRole = 'ADMIN_DISPATCHER' | 'FIELD_OFFICER' | 'PUBLIC_REPORTER';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  state_jurisdiction: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAs: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILES: Record<UserRole, { email: string; full_name: string; jurisdiction: string }> = {
  ADMIN_DISPATCHER: {
    email: 'admin@bhoomirakshak.gov.in',
    full_name: 'Admin Dispatcher',
    jurisdiction: 'NER Central Command (Guwahati)',
  },
  FIELD_OFFICER: {
    email: 'field@bhoomirakshak.gov.in',
    full_name: 'Field Commander Sharma',
    jurisdiction: 'Assam-Meghalaya Border Sector',
  },
  PUBLIC_REPORTER: {
    email: 'citizen@ner-logistics.in',
    full_name: 'Public Reporter',
    jurisdiction: 'Citizen Portal',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        // 1. Check local demo session first for instant responsiveness
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('ner_demo_auth_profile');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (mounted && parsed?.role) {
                setUser(parsed);
                setIsLoading(false);
                return;
              }
            } catch {
              localStorage.removeItem('ner_demo_auth_profile');
            }
          }
        }

        // 2. Check Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({ ...profile, email: session.user.email || profile.email });
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || 'Demo User',
              role: (session.user.user_metadata?.role as UserRole) || 'PUBLIC_REPORTER',
              state_jurisdiction: null,
            });
          }
        }
      } catch (err) {
        console.warn('Session load notice:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setUser(profile ? { ...profile, email: session.user.email || profile.email } : {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || 'Demo User',
          role: (session.user.user_metadata?.role as UserRole) || 'PUBLIC_REPORTER',
          state_jurisdiction: null,
        });
      } else if (event === 'SIGNED_OUT') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ner_demo_auth_profile');
        }
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Demo fast-login function with graceful fallback
  const loginAs = async (role: UserRole) => {
    setIsLoading(true);
    const demoInfo = DEMO_PROFILES[role];
    const fallbackProfile: UserProfile = {
      id: `demo-${role.toLowerCase()}-${Date.now()}`,
      email: demoInfo.email,
      full_name: demoInfo.full_name,
      role: role,
      state_jurisdiction: demoInfo.jurisdiction,
    };

    try {
      // Attempt Supabase Password sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoInfo.email,
        password: 'password123',
      });

      if (!error && data?.user) {
        // Fetch or assign profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const activeUser: UserProfile = profile
          ? { ...profile, email: data.user.email || profile.email }
          : fallbackProfile;

        setUser(activeUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ner_demo_auth_profile', JSON.stringify(activeUser));
        }
      } else {
        // Graceful Demo Mode: Set state and persist locally so demo is 100% reliable
        setUser(fallbackProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ner_demo_auth_profile', JSON.stringify(fallbackProfile));
        }
      }
    } catch (err) {
      console.warn('Falling back to local demo authentication profile:', err);
      setUser(fallbackProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ner_demo_auth_profile', JSON.stringify(fallbackProfile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ner_demo_auth_profile');
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore signOut error if not signed in via remote session
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || 'PUBLIC_REPORTER',
      isAuthenticated: !!user,
      isLoading,
      loginAs,
      logout,
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
