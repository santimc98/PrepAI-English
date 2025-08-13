import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { ExamLevel } from '@/types/level';

type Ctx = { level: ExamLevel | null; setLevel: (l: ExamLevel) => Promise<void>; ready: boolean };
const PrefsCtx = createContext<Ctx>({ level: null, setLevel: async () => {}, ready: false });

const KEY = 'pref:defaultExamLevel';

function readLevelSyncWeb(): ExamLevel | null {
  try {
    const v = globalThis?.localStorage?.getItem(KEY) ?? null;
    return v === 'B1' || v === 'B2' || v === 'C1' || v === 'C2' ? (v as ExamLevel) : null;
  } catch {
    return null;
  }
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevelState] = useState<ExamLevel | null>(Platform.OS === 'web' ? readLevelSyncWeb() : null);
  const [ready, setReady] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { getDefaultLevel } = await import('@/lib/prefs');
        try { setLevelState(await getDefaultLevel()); } catch {}
        setReady(true);
      })();
    }
  }, []);

  const setLevel = useCallback(async (l: ExamLevel) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(KEY, l);
      } else {
        const { setDefaultLevel } = await import('@/lib/prefs');
        await setDefaultLevel(l);
      }
      setLevelState(l);
      try {
        const { updateDefaultLevel } = await import('@/lib/db');
        await updateDefaultLevel?.(l as any);
      } catch {}
    } catch {}
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: StorageEvent) => { if (e.key === KEY) setLevelState(readLevelSyncWeb()); };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return <PrefsCtx.Provider value={{ level, setLevel, ready }}>{children}</PrefsCtx.Provider>;
}

export function usePrefs() { return useContext(PrefsCtx); }
