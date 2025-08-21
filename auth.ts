// lib/auth.ts
import * as Linking from 'expo-linking';

/**
 * Generates the correct redirect URL for Supabase auth operations,
 * handling web and native environments.
 */
export function getRedirectTo(): string {
  const url = Linking.createURL('auth/callback');
  // On web, Linking.createURL may return a relative path.
  // We need to provide an absolute URL to Supabase.
  if (typeof window !== 'undefined' && !url.startsWith('http')) {
    return `${window.location.origin}/auth/callback`;
  }
  return url;
}