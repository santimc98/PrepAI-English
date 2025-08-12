import 'react-native-url-polyfill/auto';
import 'expo-standard-web-crypto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // No romper la build en CI; solo warn
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL/ANON_KEY no configuradas. El login no funcionará hasta que definas las variables.'
  );
}

const isWeb = Platform.OS === 'web';

type AuthStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

const authOptions: {
  flowType: 'pkce';
  autoRefreshToken: boolean;
  persistSession: boolean;
  storage?: AuthStorage;
} = {
  flowType: 'pkce',
  autoRefreshToken: true,
  persistSession: true,
};

if (!isWeb) {
  // Cargar AsyncStorage solo en entornos RN para evitar 'window is not defined' en web
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default as AuthStorage;
  authOptions.storage = {
    getItem: (key: string) => AsyncStorage.getItem(key),
    setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
    removeItem: (key: string) => AsyncStorage.removeItem(key),
  };
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: authOptions,
  global: {
    headers: { 'X-Client-Info': 'prepaienglish' },
  },
});


