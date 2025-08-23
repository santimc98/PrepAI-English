import '@testing-library/jest-native/extend-expect';

// ⚠️ Reemplaza tu jest.mock actual por este bloque SIN tipos TS:
jest.mock('@/store/eventBus', () => {
  const listeners = new Map();

  const on = jest.fn((event, cb) => {
    const set = listeners.get(event) || new Set();
    set.add(cb);
    listeners.set(event, set);
    return () => {
      set.delete(cb);
      listeners.set(event, set);
    };
  });

  const off = jest.fn((event, cb) => {
    const set = listeners.get(event);
    if (set) {
      set.delete(cb);
      listeners.set(event, set);
    }
  });

  const emit = jest.fn((event, payload) => {
    const set = listeners.get(event);
    if (set) {
      for (const cb of set) cb(payload);
    }
  });

  return { eventBus: { on, off, emit } };
});

// Variables de entorno de test (lo que ya tenías)
process.env.EXPO_PUBLIC_USE_SUPABASE = 'false';

// Silenciar logs
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});
