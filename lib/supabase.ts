import 'react-native-url-polyfill/auto';
import 'expo-standard-web-crypto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Evitar romper SSR/Web al importar AsyncStorage en Node.
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function createLocalStorageAdapter(): StorageAdapter | undefined {
  if (!isBrowser) return undefined;
  return {
    getItem: async (key) => window.localStorage.getItem(key),
    setItem: async (key, value) => void window.localStorage.setItem(key, value),
    removeItem: async (key) => void window.localStorage.removeItem(key),
  };
}

function createAsyncStorageAdapter(): StorageAdapter | undefined {
  if (!isReactNative) return undefined;
  try {
    // Carga diferida para evitar acceso a window en SSR.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default as StorageAdapter;
    return AsyncStorage;
  } catch {
    return undefined;
  }
}

const storage = createAsyncStorageAdapter() ?? createLocalStorageAdapter();

const options: any = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
};
if (storage) options.auth.storage = storage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);


