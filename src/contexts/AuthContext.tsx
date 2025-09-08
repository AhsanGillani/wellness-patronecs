import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  effectiveRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    userData?: any
  ) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
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

  // Simple local cache for profile to speed up initial paint
  const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  const cacheKeyFor = (userId: string) => `cached_profile_${userId}`;
  const readCachedProfile = (userId: string) => {
    try {
      const raw = localStorage.getItem(cacheKeyFor(userId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (typeof parsed.ts !== "number" || !parsed.data) return null;
      if (Date.now() - parsed.ts > PROFILE_CACHE_TTL_MS) return null;
      return parsed.data;
    } catch {
      return null;
    }
  };
  const writeCachedProfile = (userId: string, data: any) => {
    try {
      localStorage.setItem(
        cacheKeyFor(userId),
        JSON.stringify({ ts: Date.now(), data })
      );
    } catch {}
  };
  const clearCachedProfile = (userId: string) => {
    try {
      localStorage.removeItem(cacheKeyFor(userId));
    } catch {}
  };
  const fetchProfile = async (userId: string) => {
    // Don't fetch profile if we're in the middle of signup
    if (isSigningUp) {
      return;
    }

    try {
      // 1) Hydrate quickly from cache if available
      const cached = readCachedProfile(userId);
      if (cached) {
        setProfile(cached);
        const role = cached?.role;
        if (role === "professional") {
          setEffectiveRole("professional");
        } else {
          setEffectiveRole(role || "patient");
        }
      }

      // 2) Fetch fresh profile (minimal fields)
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, user_id, role, first_name, last_name, email, avatar_url, phone, location, bio, specialization, years_experience, verification_status, created_at, updated_at"
        )
        .eq("user_id", userId)
        .single();

      if (error) {
        // Handle the case where profile doesn't exist yet (expected for new users)
        if (error.code === "PGRST116" || error.code === "406") {
          setProfile(null);
          setEffectiveRole(null); // Don't assign default role
          clearCachedProfile(userId);
          return;
        }

        // Handle RLS/permission errors - might indicate token issues
        if (
          error.code === "42501" ||
          error.message?.includes("permission denied") ||
          error.message?.includes("Invalid Refresh Token")
        ) {
          console.log("Permission denied or invalid token, signing out user");
          await supabase.auth.signOut();
          return;
        }

        throw error;
      }

      setProfile(data);
      writeCachedProfile(userId, data);

      // Set effective role directly from profile data (much faster than RPC call)
      const role = data?.role;
      if (role === "professional") {
        setEffectiveRole("professional");
      } else {
        setEffectiveRole(role || "patient");
      }
    } catch (error) {
      // Don't wipe existing profile/role on transient errors; keep current UI stable
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (!isMounted) return;

        // Handle token refresh errors
        if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed successfully");
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setSession(null);
          setUser(null);
          setProfile(null);
          setEffectiveRole(null);
          setLoading(false);
          return;
        }

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
        console.error("Error in auth state change:", error);
        if (isMounted) {
          // If it's a token refresh error, sign out the user
          if (
            error instanceof Error &&
            error.message.includes("Invalid Refresh Token")
          ) {
            console.log("Invalid refresh token, signing out user");
            await supabase.auth.signOut();
          }
          setProfile(null);
          setEffectiveRole(null);
          setLoading(false);
        }
      }
    });

    // THEN check for existing session
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
        console.error("Error in getSession:", error);
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
        setTimeout(
          () =>
            resolve({
              error: new Error(
                "Request timed out. Please check your connection and try again."
              ),
            }),
          timeoutMs
        )
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
    if (
      result.error &&
      String(result.error?.message || "").includes("Request timed out")
    ) {
      result = await tryOnce(20000);
    }
    return result;
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    setIsSigningUp(true);
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData || {},
      },
    });

    // Keep the flag true for a bit longer to prevent profile fetching
    setTimeout(() => {
      setIsSigningUp(false);
    }, 5000);

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    try {
      if (user?.id) clearCachedProfile(user.id);
    } catch {}
    return { error };
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { error: new Error("No user logged in") };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
