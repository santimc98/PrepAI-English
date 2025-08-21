// Note: We rely on moduleNameMapper in jest.simple.config.js to mock
// - '@react-native-async-storage/async-storage'
// - 'react-native'
// - 'expo-application'
// So we don't set explicit jest.mock() for them here.
import '@testing-library/jest-native/extend-expect';
// Mock the eventBus
jest.mock('@/store/eventBus', () => {
  const mock = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };
  return { eventBus: mock, default: mock };
});

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
