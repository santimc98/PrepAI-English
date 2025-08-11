import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

type OAuthProvider = 'google';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  WebBrowser.maybeCompleteAuthSession();
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(data.session ?? null);
        setInitializing(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = useCallback(async (provider: OAuthProvider) => {
    const redirectTo =
      Platform.OS === 'web'
        ? Linking.createURL('auth/callback')
        : AuthSession.makeRedirectUri({ scheme: 'prepaienglish', path: 'auth/callback' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: Platform.OS !== 'web' ? true : false,
        queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : undefined,
      },
    });
    if (error) throw error;
    if (data?.url) {
      if (Platform.OS === 'web') {
        // Redirigir el navegador directamente
        window.location.assign(data.url);
      } else {
        await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, user: session?.user ?? null, initializing, signInWithProvider, signOut }),
    [session, initializing, signInWithProvider, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}


