import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

// Use the generated DB types for the profile
export type UserProfile = Database['public']['Tables']['users']['Row'];
export type AuthUser = User & { profile?: UserProfile };

type AuthContextType = {
  session: Session | null;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * ✅ Create user profile ONCE and fetch profile data
   * auth.users.id === public.users.id
   */
  const ensureUserProfile = async (authUser: User, username?: string): Promise<AuthUser> => {
    console.log('[Profile] Starting profile fetch for user:', authUser.id);
    const startTime = Date.now();
    
    try {
      const { data: existing, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log('[Profile] Profile query completed in:', Date.now() - startTime, 'ms');
      
      if (error) {
        console.error('[Profile] Error fetching profile:', error.message);
        // Return user without profile if there's an error
        return {
          ...authUser,
          profile: undefined
        };
      }
      
      console.log("[Profile] Existing user profile:", existing);
      
      let profile: UserProfile | undefined = existing ?? undefined;
      
      if (!existing) {
        console.log('[Profile] Creating new profile...');
        const insertStartTime = Date.now();
        
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            username: username || authUser.email!.split('@')[0], // use provided username or email prefix
            role: 'super_admin', // change if needed
          })
          .select()
          .single();
          
        console.log('[Profile] Profile creation completed in:', Date.now() - insertStartTime, 'ms');
          
        if (insertError) {
          console.error('[Profile] Failed to create user profile:', insertError.message);
          // Return user without profile if creation fails
          return {
            ...authUser,
            profile: undefined
          };
        } else {
          console.log('[Profile] New profile created:', newProfile);
          profile = newProfile as UserProfile;
        }
      }

      const enhancedUser: AuthUser = {
        ...authUser,
        profile: profile
      };
      
      console.log('[Profile] Enhanced user ready:', !!enhancedUser.profile);
      return enhancedUser;
      
    } catch (error) {
      console.error('[Profile] Unexpected error in ensureUserProfile:', error);
      // Return basic user if anything fails
      return {
        ...authUser,
        profile: undefined
      };
    }
  };

  // Refresh current user's profile from DB and update local state
  const refreshUser = async () => {
    if (!session?.user && !user) return;
    const id = session?.user?.id ?? user?.id;
    if (!id) return;

    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      setUser((prev) => ({ ...(prev ?? session?.user!), profile: data ?? undefined } as AuthUser));
    } catch (e) {
      console.error('[Auth] refreshUser failed', e);
    }
  };

  useEffect(() => {
    console.log('[Auth] AuthProvider mounted, setting up listener...');
    
    // The onAuthStateChange listener handles everything - initial session and changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] onAuthStateChange', event, !!session);
      console.log('[Auth] Setting session and user...');
      
      setSession(session);
      
      if (session?.user) {
        console.log('[Auth] User found, setting basic user first...');
        // Set basic user immediately so loading can finish
        const basicUser: AuthUser = {
          ...session.user,
          profile: undefined
        };
        setUser(basicUser);
        
        // Set loading to false immediately
        console.log('[Auth] Setting isLoading to false (basic user set)');
        setIsLoading(false);
        
        // Fetch profile in background (non-blocking)
        console.log('[Auth] Starting background profile fetch...');
        const pendingUsername = (globalThis as any).__pendingUsername;
        ensureUserProfile(session.user, pendingUsername)
          .then(enhancedUser => {
            console.log('[Auth] Background profile fetch completed, updating user...');
            setUser(enhancedUser);
            // Clear the pending username
            delete (globalThis as any).__pendingUsername;
          })
          .catch(error => {
            console.error('[Auth] Background profile fetch failed:', error);
            // Keep the basic user if profile fetch fails
            delete (globalThis as any).__pendingUsername;
          });
      } else {
        console.log('[Auth] No user, setting null...');
        setUser(null);
        // Set loading to false immediately
        console.log('[Auth] Setting isLoading to false (no user)');
        setIsLoading(false);
      }

      if (event === 'SIGNED_OUT') {
        console.log('[Auth] received SIGNED_OUT event');
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      console.log('[Auth] Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username?: string) => {
    // Step 1: Create auth user
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) throw signUpError;

    // Step 2: Sign them in immediately to create a session
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
    
    // The onAuthStateChange listener will handle creating the profile with username
    // We need to store the username temporarily for the profile creation
    if (username) {
      (globalThis as any).__pendingUsername = username;
    }
  };

  const signOut = async () => {
    // We only need to call the signOut method.
    // The onAuthStateChange listener will automatically detect the SIGNED_OUT event
    // and clear the session and user state. This is the most reliable approach.
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      console.error('[Auth] signOut error:', error.message);
      return false; // The UI can use this to show an error
    }

    // Return true to indicate the sign-out process was initiated successfully.
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        setUser,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
