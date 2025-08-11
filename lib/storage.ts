// Cargar AsyncStorage de forma segura en RN y usar localStorage en Web
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function getStorage(): StorageAdapter {
  if (isReactNative) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default as StorageAdapter;
    return AsyncStorage;
  }
  if (isBrowser) {
    return {
      getItem: async (key) => window.localStorage.getItem(key),
      setItem: async (key, value) => void window.localStorage.setItem(key, value),
      removeItem: async (key) => void window.localStorage.removeItem(key),
    } as StorageAdapter;
  }
  // Fallback in Node: memoria
  const mem = new Map<string, string>();
  return {
    getItem: async (key) => mem.get(key) ?? null,
    setItem: async (key, value) => void mem.set(key, value),
    removeItem: async (key) => void mem.delete(key),
  } as StorageAdapter;
}

const storage = getStorage();
import type { ExamMock } from '@/types/exam';

export type Attempt = {
  id: string;
  examId: string;
  title: string;
  level: ExamMock['level'];
  createdAt: number;
  finishedAt?: number;
  score?: number;
};

const KEY = 'prepai_attempts_v1';

export async function saveAttempt(attempt: Attempt): Promise<void> {
  const existing = await getAttempts();
  existing.unshift(attempt);
  await storage.setItem(KEY, JSON.stringify(existing.slice(0, 100)));
}

export async function getAttempts(): Promise<Attempt[]> {
  const raw = await storage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Attempt[];
  } catch {
    return [];
  }
}


