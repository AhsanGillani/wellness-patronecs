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

<<<<<<< HEAD
  // Simple local cache for profile to speed up initial paint
  const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  const cacheKeyFor = (userId: string) => `cached_profile_${userId}`;
  const readCachedProfile = (userId: string) => {
    try {
      const raw = localStorage.getItem(cacheKeyFor(userId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (typeof parsed.ts !== 'number' || !parsed.data) return null;
      if (Date.now() - parsed.ts > PROFILE_CACHE_TTL_MS) return null;
      return parsed.data;
    } catch {
      return null;
    }
  };
  const writeCachedProfile = (userId: string, data: any) => {
    try {
      localStorage.setItem(cacheKeyFor(userId), JSON.stringify({ ts: Date.now(), data }));
    } catch {}
  };
  const clearCachedProfile = (userId: string) => {
    try { localStorage.removeItem(cacheKeyFor(userId)); } catch {}
  };

=======
>>>>>>> main
  const fetchProfile = async (userId: string) => {
    // Don't fetch profile if we're in the middle of signup
    if (isSigningUp) {
      return;
    }

    try {
<<<<<<< HEAD
      // 1) Hydrate quickly from cache if available
      const cached = readCachedProfile(userId);
      if (cached) {
        setProfile(cached);
        const role = cached?.role;
        if (role === 'doctor' || role === 'professional') {
          setEffectiveRole('professional');
        } else {
          setEffectiveRole(role || 'patient');
        }
      }

      // 2) Fetch fresh profile (minimal fields)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, role, first_name, last_name, email, avatar_url, phone, location, bio, specialization, years_experience, verification_status, created_at, updated_at')
=======
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
>>>>>>> main
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // Handle the case where profile doesn't exist yet (expected for new users)
        if (error.code === 'PGRST116' || error.code === '406') {
          setProfile(null);
<<<<<<< HEAD
          setEffectiveRole(null); // Don't assign default role
          clearCachedProfile(userId);
=======
          setEffectiveRole('patient');
>>>>>>> main
          return;
        }
        throw error;
      }
      
      setProfile(data);
<<<<<<< HEAD
      writeCachedProfile(userId, data);
      
      // Set effective role directly from profile data (much faster than RPC call)
      const role = data?.role;
      if (role === 'doctor' || role === 'professional') {
        setEffectiveRole('professional');
      } else {
        setEffectiveRole(role || 'patient');
      }
    } catch (error) {
      // Don't wipe existing profile/role on transient errors; keep current UI stable
      console.error('Error fetching profile:', error);
=======
      
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
>>>>>>> main
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (!isMounted) return;
          
          setSession(session);
          setUser(session?.user ?? null);
          
          // Only fetch profile if we're not signing up
          if (session?.user && !isSigningUp) {
            // Fetch profile in background and set loading to false immediately
            fetchProfile(session.user.id);
            setLoading(false); // Show content immediately
          } else if (!session?.user) {
            setProfile(null);
            setEffectiveRole(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          if (isMounted) {
            setProfile(null);
            setEffectiveRole(null);
            setLoading(false);
          }
        }
=======
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
>>>>>>> main
      }
    );

    // THEN check for existing session
<<<<<<< HEAD
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !isSigningUp) {
          // Fetch profile in background and set loading to false immediately
          fetchProfile(session.user.id);
          setLoading(false); // Show content immediately
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
        if (isMounted) {
          setProfile(null);
          setEffectiveRole(null);
          setLoading(false);
        }
      }
    });

    // Safety timeout (silent). Only flips loading off if something hangs unusually long
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 8000); // 8 seconds

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [isSigningUp]);

  const signIn = async (email: string, password: string) => {
    const tryOnce = async (timeoutMs: number) => {
      const timeoutPromise = new Promise<{ error: any }>((resolve) =>
        setTimeout(() => resolve({ error: new Error('Request timed out. Please check your connection and try again.') }), timeoutMs)
      );
      const signInPromise = (async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error };
        return { error: null };
      })();
      return await Promise.race([signInPromise, timeoutPromise]);
    };

    // Attempt once (10s), then retry once with a longer window (20s)
    let result = await tryOnce(10000);
    if (result.error && String(result.error?.message || '').includes('Request timed out')) {
      result = await tryOnce(20000);
    }
    return result;
=======
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
>>>>>>> main
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
<<<<<<< HEAD
    try { if (user?.id) clearCachedProfile(user.id); } catch {}
=======
>>>>>>> main
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