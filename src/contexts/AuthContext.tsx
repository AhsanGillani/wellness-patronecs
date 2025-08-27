import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  effectiveRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [effectiveRole, setEffectiveRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const fetchProfile = async (userId: string) => {
    // Don't fetch profile if we're in the middle of signup
    if (isSigningUp) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // Handle the case where profile doesn't exist yet (expected for new users)
        if (error.code === 'PGRST116' || error.code === '406') {
          setProfile(null);
          setEffectiveRole('patient');
          return;
        }
        throw error;
      }
      
      setProfile(data);
      
      // Get effective role using database function
      try {
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_current_user_role');
        
        if (!roleError && roleData) {
          setEffectiveRole(roleData);
        } else {
          // Fallback to profile role, treating doctor and professional as equivalent
          const role = data?.role;
          if (role === 'doctor' || role === 'professional') {
            setEffectiveRole('professional');
          } else {
            setEffectiveRole(role || 'patient');
          }
        }
      } catch (roleError) {
        const role = data?.role;
        if (role === 'doctor' || role === 'professional') {
          setEffectiveRole('professional');
        } else {
          setEffectiveRole(role || 'patient');
        }
      }
    } catch (error) {
      setProfile(null);
      setEffectiveRole(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only fetch profile if we're not signing up
        if (session?.user && !isSigningUp) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 1000); // Increased delay to ensure signup completes
        } else if (!session?.user) {
          setProfile(null);
          setEffectiveRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && !isSigningUp) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 1000);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isSigningUp]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    setIsSigningUp(true);
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData || {}
      }
    });

    // Keep the flag true for a bit longer to prevent profile fetching
    setTimeout(() => {
      setIsSigningUp(false);
    }, 5000);

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { error: new Error('No user logged in') };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);
    
    if (!error) {
      await fetchProfile(user.id);
    }
    
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    effectiveRole,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};