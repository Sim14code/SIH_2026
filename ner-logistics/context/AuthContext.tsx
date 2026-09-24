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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (mounted) {
            if (profile) {
              setUser({ ...profile, email: session.user.email });
            } else {
              // Fallback if profile not created yet
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                full_name: 'Demo User',
                role: 'PUBLIC_REPORTER',
                state_jurisdiction: null
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading session', err);
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
          
        setUser(profile ? { ...profile, email: session.user.email } : {
          id: session.user.id,
          email: session.user.email || '',
          full_name: 'Demo User',
          role: 'PUBLIC_REPORTER',
          state_jurisdiction: null
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Demo fast-login function for the prototype
  const loginAs = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const email = role === 'ADMIN_DISPATCHER' ? 'admin@bhoomirakshak.gov.in' 
                  : role === 'FIELD_OFFICER' ? 'field@bhoomirakshak.gov.in' 
                  : 'public@demo.com';
      
      let { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123'
      });
      
      if (error && (error.message.includes('Invalid login credentials') || error.status === 400)) {
        // If user doesn't exist yet in Supabase Auth, auto-create them for demo ease!
        const full_name = role === 'ADMIN_DISPATCHER' ? 'Admin Dispatcher' : role === 'FIELD_OFFICER' ? 'Field Commander' : 'Public Reporter';
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password: 'password123',
          options: {
            data: { full_name, role }
          }
        });
        if (signUpErr) {
          console.error("Auto-signup failed:", signUpErr.message);
          alert(`Login failed: ${signUpErr.message}`);
        } else {
          // Attempt login once more after signup
          await supabase.auth.signInWithPassword({
            email,
            password: 'password123'
          });
        }
      } else if (error) {
        console.error("Login failed:", error.message);
        alert(`Login failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || 'PUBLIC_REPORTER',
      isAuthenticated: !!user,
      isLoading,
      loginAs,
      logout
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
