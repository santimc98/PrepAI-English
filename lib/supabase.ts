import 'react-native-url-polyfill/auto';
import 'expo-standard-web-crypto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // No romper la build en CI; solo warn
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL/ANON_KEY no configuradas. El login no funcionará hasta que definas las variables.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    storage: {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    },
  },
  global: {
    headers: { 'X-Client-Info': 'prepaienglish' },
  },
});


