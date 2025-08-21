// Note: We rely on moduleNameMapper in jest.simple.config.js to mock
// - '@react-native-async-storage/async-storage'
// - 'react-native'
// - 'expo-application'
// So we don't set explicit jest.mock() for them here.
import '@testing-library/jest-native/extend-expect';
// Mock the eventBus
jest.mock('@/store/eventBus', () => {
  const listeners: Record<string, Function[]> = {};

  const mock = {
    on: jest.fn((event: string, cb: Function) => {
      (listeners[event] ||= []).push(cb);
      return () => {
        const arr = listeners[event] || [];
        const i = arr.indexOf(cb);
        if (i >= 0) arr.splice(i, 1);
      };
    }),
    off: jest.fn((event: string, cb: Function) => {
      const arr = listeners[event] || [];
      const i = arr.indexOf(cb);
      if (i >= 0) arr.splice(i, 1);
    }),
    emit: jest.fn((event: string, data: any) => {
      (listeners[event] || []).slice().forEach(fn => {
        try { fn(data); } catch {}
      });
    }),
  };

  return { eventBus: mock, default: mock };
});

jest.mock('expo-application', () => ({
  getIosIdForVendorAsync: jest.fn(async () => 'ios-id-test'),
  getAndroidId: jest.fn(() => 'android-id-test'),
  nativeApplicationVersion: 'test',
}));

// Define globals often used in React Native code paths
;(globalThis as any).__DEV__ = false;

// Mock the environment variable
process.env.EXPO_PUBLIC_USE_SUPABASE = 'false';

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});
