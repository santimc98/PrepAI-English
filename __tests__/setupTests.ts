// Note: We rely on moduleNameMapper in jest.simple.config.js to mock
// - '@react-native-async-storage/async-storage'
// - 'react-native'
// - 'expo-application'
// So we don't set explicit jest.mock() for them here.

// Mock the eventBus
jest.mock('@/store/eventBus', () => ({
  eventBus: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}));

// Define globals often used in React Native code paths
;(globalThis as any).__DEV__ = false;

// Mock the environment variable
process.env.EXPO_PUBLIC_USE_SUPABASE = 'false';
