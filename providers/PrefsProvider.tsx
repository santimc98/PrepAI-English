// providers/PrefsProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { ExamLevel } from '@/types/level';
import { useAuth } from '@/providers/AuthProvider';
import { getProfileDefaultLevel, updateDefaultLevel } from '@/lib/db';

type Ctx = {
  level: ExamLevel;
  setLevel: (next: ExamLevel) => Promise<void>;
};

const DEFAULT_LEVEL: ExamLevel = 'B2';
const KEY = 'prefs:level';

const PrefsContext = createContext<Ctx>({
  level: DEFAULT_LEVEL,
  setLevel: async () => {},
});

function getStorage() {
  // web: localStorage; nativo: AsyncStorage (carga segura)
  if (Platform.OS === 'web') {
    return {
      getItem: async (k: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null),
      setItem: async (k: string, v: string) => {
        if (typeof localStorage !== 'undefined') localStorage.setItem(k, v);
      },
    };
  }
  try {
    // require dinámico para evitar "window is not defined" en web
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return {
      getItem: AsyncStorage.getItem,
      setItem: AsyncStorage.setItem,
    };
  } catch {
    return {
      getItem: async () => null,
      setItem: async () => {},
    };
  }
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [level, setLevelState] = useState<ExamLevel>(DEFAULT_LEVEL);
  const storage = useMemo(getStorage, []);

  // Carga inicial: prioridad nube si hay sesión; si no, local; fallback B2
  useEffect(() => {
    (async () => {
      let initial: ExamLevel | null = null;
      if (session?.user && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
        initial = await getProfileDefaultLevel();
      }
      if (!initial) {
        const raw = (await storage.getItem(KEY)) as string | null;
        if (raw === 'B1' || raw === 'B2' || raw === 'C1' || raw === 'C2') initial = raw as ExamLevel;
      }
      setLevelState(initial ?? DEFAULT_LEVEL);
    })();
  }, [session?.user?.id]);

  const setLevel = async (next: ExamLevel) => {
    // Reactivo inmediato
    setLevelState(next);

    // Persistencia local
    try {
      await storage.setItem(KEY, next);
    } catch (e) {
      console.warn('[prefs] setItem failed', e);
    }

    // Persistencia en nube
    if (session?.user && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
      try {
        await updateDefaultLevel(next);
      } catch (e) {
        console.warn('[prefs] updateDefaultLevel failed', e);
      }
    }
  };

  return <PrefsContext.Provider value={{ level, setLevel }}>{children}</PrefsContext.Provider>;
}

export const usePrefs = () => useContext(PrefsContext);
