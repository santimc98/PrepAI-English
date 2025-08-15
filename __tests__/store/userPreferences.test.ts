import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import the store and types
import { userPreferencesStore, type CertificationLevel } from '@/store';
import { eventBus } from '@/store/eventBus';
import * as Application from 'expo-application';

// Mock the eventBus
const mockEventBus = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  clear: jest.fn(),
};

jest.mock('@/store/eventBus', () => ({
  eventBus: mockEventBus
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock expo-application
const mockExpoApplication = {
  nativeApplicationVersion: '1.0.0',
  getIosIdForVendorAsync: jest.fn().mockResolvedValue('mock-device-id'),
  getAndroidId: jest.fn().mockReturnValue('mock-android-id'),
};

jest.mock('expo-application', () => mockExpoApplication);

// Platform is mocked via moduleNameMapper to __mocks__/react-native.ts

describe('userPreferencesStore', () => {
  
  // Mock console methods
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    // Suppress console output during tests
    console.warn = jest.fn();
    console.error = jest.fn();
  });
  
  afterAll(() => {
    // Restore console methods
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset the store state
    // @ts-ignore - Accessing private member for testing
    userPreferencesStore._certificationLevel = 'B1';
    // @ts-ignore - Accessing private member for testing
    userPreferencesStore._hydrateDone = false;
    // @ts-ignore - Accessing private member for testing
    userPreferencesStore._initialized = false;
    // @ts-ignore - Accessing private member for testing
    userPreferencesStore._listeners = [];
    
    // Reset event bus mocks
    mockEventBus.emit.mockClear();
    mockEventBus.on.mockClear();
    mockEventBus.off.mockClear();
    mockEventBus.clear.mockClear();
    
    // Reset async storage mocks
    mockAsyncStorage.getItem.mockReset();
    mockAsyncStorage.setItem.mockReset();
    mockAsyncStorage.removeItem.mockReset();
    
    // Reset expo-application mocks
    mockExpoApplication.getIosIdForVendorAsync.mockClear();
    mockExpoApplication.getAndroidId.mockClear();
  });
  
  describe('initialization', () => {
    it('should initialize with default values', async () => {
      // Mock AsyncStorage to return null (no saved preferences)
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      // Initialize the store
      await userPreferencesStore.initialize();
      
      expect(userPreferencesStore.certificationLevel).toBe('B1');
    });
    
    it('should load saved level from storage', async () => {
      // Mock AsyncStorage to return a saved level
      mockAsyncStorage.getItem.mockImplementation((key) => {
        return key === 'prefs:certLevel:v1' ? Promise.resolve('"C1"') : Promise.resolve(null);
      });
      
      await userPreferencesStore.initialize();
      
      expect(userPreferencesStore.certificationLevel).toBe('C1');
    });
    
    it('should handle invalid stored level', async () => {
      // Mock AsyncStorage to return an invalid level
      mockAsyncStorage.getItem.mockImplementation((key) => {
        return key === 'prefs:certLevel:v1' ? Promise.resolve('"INVALID"') : Promise.resolve(null);
      });
      
      await userPreferencesStore.initialize();
      
      // Should fall back to default level
      expect(userPreferencesStore.certificationLevel).toBe('B1');
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid certification level: INVALID. Falling back to B1'
      );
    });
  });
  
  describe('setCertificationLevel', () => {
    it('should update the level and persist it', async () => {
      await userPreferencesStore.setCertificationLevel('C1');
      
      expect(userPreferencesStore.certificationLevel).toBe('C1');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('prefs:certLevel:v1', '"C1"');
      expect(mockEventBus.emit).toHaveBeenCalledWith('prefs:certLevel:changed', {
        from: 'B1',
        to: 'C1',
      });
    });
    
    it('should not persist if persist option is false', async () => {
      await userPreferencesStore.setCertificationLevel('C1', { persist: false });
      
      expect(userPreferencesStore.certificationLevel).toBe('C1');
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });
    
    it('should not sync with server if syncServer option is false', async () => {
      await userPreferencesStore.setCertificationLevel('C1', { syncServer: false });
      
      expect(userPreferencesStore.certificationLevel).toBe('C1');
      expect(mockEventBus.emit).toHaveBeenCalledWith('prefs:certLevel:changed', {
        from: 'B1',
        to: 'C1',
      });
    });
    
    it('should handle persistence errors gracefully', async () => {
      const error = new Error('Storage error');
      mockAsyncStorage.setItem.mockRejectedValueOnce(error);
      
      await userPreferencesStore.setCertificationLevel('C1');
      
      expect(userPreferencesStore.certificationLevel).toBe('C1');
      expect(console.error).toHaveBeenCalledWith('Failed to persist certification level', error);
    });
  });
  
  describe('level normalization', () => {
    it('should normalize valid levels', () => {
      // Test with direct string comparison since we can't access private methods
      expect(userPreferencesStore.certificationLevel).toBeDefined();
      
      // Test that setting a valid level works
      userPreferencesStore.setCertificationLevel('A2');
      expect(userPreferencesStore.certificationLevel).toBe('A2');
      
      userPreferencesStore.setCertificationLevel('B1');
      expect(userPreferencesStore.certificationLevel).toBe('B1');
      
      userPreferencesStore.setCertificationLevel('B2');
      expect(userPreferencesStore.certificationLevel).toBe('B2');
      
      userPreferencesStore.setCertificationLevel('C1');
      expect(userPreferencesStore.certificationLevel).toBe('C1');
      
      userPreferencesStore.setCertificationLevel('C2');
      expect(userPreferencesStore.certificationLevel).toBe('C2');
    });
    
    it('should handle invalid levels by falling back to default', async () => {
      // Test with direct string comparison since we can't access private methods
      expect(userPreferencesStore.certificationLevel).toBeDefined();
      
      // Store original console.warn to restore later
      const originalWarn = console.warn;
      console.warn = jest.fn();
      
      try {
        // Test with invalid level (should fall back to default 'B1')
        // @ts-ignore - Testing invalid input
        await userPreferencesStore.setCertificationLevel('INVALID');
        expect(userPreferencesStore.certificationLevel).toBe('B1');
        
        // @ts-ignore - Testing invalid input
        await userPreferencesStore.setCertificationLevel('');
        expect(userPreferencesStore.certificationLevel).toBe('B1');
        
        // @ts-ignore - Testing invalid input
        await userPreferencesStore.setCertificationLevel(null);
        expect(userPreferencesStore.certificationLevel).toBe('B1');
        
        // @ts-ignore - Testing invalid input
        await userPreferencesStore.setCertificationLevel(undefined);
        expect(userPreferencesStore.certificationLevel).toBe('B1');
        
        // @ts-ignore - Testing invalid input
        await userPreferencesStore.setCertificationLevel(123);
        expect(userPreferencesStore.certificationLevel).toBe('B1');
        
        // Verify warnings were logged
        expect(console.warn).toHaveBeenCalled();
      } finally {
        // Restore console.warn
        console.warn = originalWarn;
      }
    });
  });
  
  describe('subscribe', () => {
    it('should call listeners when level changes', async () => {
      const listener = jest.fn();
      
      const unsubscribe = userPreferencesStore.subscribe(listener);
      await userPreferencesStore.setCertificationLevel('C1');
      
      expect(listener).toHaveBeenCalledTimes(1);
      
      // Unsubscribe and verify listener is not called
      unsubscribe();
      await userPreferencesStore.setCertificationLevel('B2');
      
      expect(listener).toHaveBeenCalledTimes(1); // Still only called once
    });
    
    it('should handle errors in listeners', async () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      
      userPreferencesStore.subscribe(errorListener);
      
      // Should not throw, should be caught internally
      await userPreferencesStore.setCertificationLevel('C1');
      
      // Should still call other listeners
      const normalListener = jest.fn();
      userPreferencesStore.subscribe(normalListener);
      await userPreferencesStore.setCertificationLevel('B2');
      
      expect(normalListener).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('eventBus integration', () => {
    it('should emit events on level change', async () => {
      const eventListener = jest.fn();
      eventBus.on('prefs:certLevel:changed', eventListener);

      await userPreferencesStore.setCertificationLevel('C1');

      expect(eventListener).toHaveBeenCalledWith({
        from: 'B1',
        to: 'C1',
      });
    });

    it('should handle multiple event listeners', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      eventBus.on('prefs:certLevel:changed', listener1);
      eventBus.on('prefs:certLevel:changed', listener2);

      await userPreferencesStore.setCertificationLevel('C1');

      expect(listener1).toHaveBeenCalledWith({
        from: 'B1',
        to: 'C1',
      });
      expect(listener2).toHaveBeenCalledWith({
        from: 'B1',
        to: 'C1',
      });
    });
  });
});

  describe('initialization', () => {
    it('should initialize with default values', async () => {
      // Mock AsyncStorage to return null (no saved preferences)
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      // Initialize the store
      await userPreferencesStore.initialize();
      
      expect(userPreferencesStore.certificationLevel).toBe('B1');
    });
    
    it('should load saved level from storage', async () => {
      // Mock AsyncStorage to return a saved level
      mockAsyncStorage.getItem.mockImplementation((key) => {
        return key === 'prefs:certLevel:v1' ? Promise.resolve('"C1"') : Promise.resolve(null);
      });
      
      await userPreferencesStore.initialize();
      
      expect(userPreferencesStore.certificationLevel).toBe('C1');
    });
    
    it('should handle invalid stored level', async () => {
      // Mock AsyncStorage to return an invalid level
      mockAsyncStorage.getItem.mockImplementation((key) => {
        return key === 'prefs:certLevel:v1' ? Promise.resolve('"INVALID"') : Promise.resolve(null);
      });

      await userPreferencesStore.initialize();

      // Should fall back to default level
      expect(userPreferencesStore.certificationLevel).toBe('B1');
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid certification level: INVALID. Falling back to B1'
      );
    });
  });

  describe('setCertificationLevel', () => {
it('should update the level and persist it', async () => {
  await userPreferencesStore.setCertificationLevel('C1');

  expect(userPreferencesStore.certificationLevel).toBe('C1');
  expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('prefs:certLevel:v1', '"C1"');
  expect(mockEventBus.emit).toHaveBeenCalledWith('prefs:certLevel:changed', {
    from: 'B1',
    to: 'C1',
  });
});

it('should not persist if persist option is false', async () => {
  await userPreferencesStore.setCertificationLevel('C1', { persist: false });

  expect(userPreferencesStore.certificationLevel).toBe('C1');
  expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
});

it('should not sync with server if syncServer option is false', async () => {
  await userPreferencesStore.setCertificationLevel('C1', { syncServer: false });

  expect(userPreferencesStore.certificationLevel).toBe('C1');
  expect(mockEventBus.emit).toHaveBeenCalledWith('prefs:certLevel:changed', {
    from: 'B1',
    to: 'C1',
  });
});

it('should handle persistence errors gracefully', async () => {
  const error = new Error('Storage error');
  mockAsyncStorage.setItem.mockRejectedValueOnce(error);

  await userPreferencesStore.setCertificationLevel('C1');

  expect(userPreferencesStore.certificationLevel).toBe('C1');
  expect(console.error).toHaveBeenCalledWith('Failed to persist certification level', error);
});
});

describe('level normalization', () => {
it('should normalize valid levels', () => {
  // Test with direct string comparison since we can't access private methods
  expect(userPreferencesStore.certificationLevel).toBeDefined();

  // Test that setting a valid level works
  userPreferencesStore.setCertificationLevel('A2');
  expect(userPreferencesStore.certificationLevel).toBe('A2');

  userPreferencesStore.setCertificationLevel('B1');
  expect(userPreferencesStore.certificationLevel).toBe('B1');

  userPreferencesStore.setCertificationLevel('B2');
  expect(userPreferencesStore.certificationLevel).toBe('B2');

  userPreferencesStore.setCertificationLevel('C1');
  expect(userPreferencesStore.certificationLevel).toBe('C1');

  userPreferencesStore.setCertificationLevel('C2');
  expect(userPreferencesStore.certificationLevel).toBe('C2');
});

it('should handle invalid levels by falling back to default', async () => {
  // Test with direct string comparison since we can't access private methods
  expect(userPreferencesStore.certificationLevel).toBeDefined();

  // Store original console.warn to restore later
  const originalWarn = console.warn;
  console.warn = jest.fn();

  try {
    // Test with invalid level (should fall back to default 'B1')
    // @ts-ignore - Testing invalid input
    await userPreferencesStore.setCertificationLevel('INVALID');
    expect(userPreferencesStore.certificationLevel).toBe('B1');

    // @ts-ignore - Testing invalid input
    await userPreferencesStore.setCertificationLevel('');
    expect(userPreferencesStore.certificationLevel).toBe('B1');

    // @ts-ignore - Testing invalid input
    await userPreferencesStore.setCertificationLevel(null);
    expect(userPreferencesStore.certificationLevel).toBe('B1');

    // @ts-ignore - Testing invalid input
    await userPreferencesStore.setCertificationLevel(undefined);
    expect(userPreferencesStore.certificationLevel).toBe('B1');

    // @ts-ignore - Testing invalid input
    await userPreferencesStore.setCertificationLevel(123);
    expect(userPreferencesStore.certificationLevel).toBe('B1');

    // Verify warnings were logged
    expect(console.warn).toHaveBeenCalled();
  } finally {
    // Restore console.warn
    console.warn = originalWarn;
  }
});
});

describe('subscribe', () => {
it('should call listeners when level changes', async () => {
  const listener = jest.fn();

  const unsubscribe = userPreferencesStore.subscribe(listener);
  await userPreferencesStore.setCertificationLevel('C1');

  expect(listener).toHaveBeenCalledTimes(1);

  // Unsubscribe and verify listener is not called
  unsubscribe();
  await userPreferencesStore.setCertificationLevel('B2');

  expect(listener).toHaveBeenCalledTimes(1); // Still only called once
});

it('should handle errors in listeners', async () => {
  const errorListener = jest.fn().mockImplementation(() => {
    throw new Error('Listener error');
  });

  userPreferencesStore.subscribe(errorListener);

  // Should not throw, should be caught internally
  await userPreferencesStore.setCertificationLevel('C1');

  // Should still call other listeners
  const normalListener = jest.fn();
  userPreferencesStore.subscribe(normalListener);
  await userPreferencesStore.setCertificationLevel('B2');

  expect(normalListener).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalled();
});
});

describe('eventBus integration', () => {
it('should emit events on level change', async () => {
  const eventListener = jest.fn();
  eventBus.on('prefs:certLevel:changed', eventListener);

  await userPreferencesStore.setCertificationLevel('C1');

  expect(eventListener).toHaveBeenCalledWith({
    from: 'B1',
    to: 'C1',
  });
});

it('should handle multiple event listeners', async () => {
  const listener1 = jest.fn();
  const listener2 = jest.fn();

  eventBus.on('prefs:certLevel:changed', listener1);
  eventBus.on('prefs:certLevel:changed', listener2);

  await userPreferencesStore.setCertificationLevel('C1');

  expect(listener1).toHaveBeenCalledWith({
    from: 'B1',
    to: 'C1',
  });
  expect(listener2).toHaveBeenCalledWith({
    from: 'B1',
    to: 'C1',
  });
});
});

describe('platform-specific behavior', () => {
it('should use iOS ID on iOS', async () => {
  (Platform.OS as unknown) = 'ios';

  await userPreferencesStore.initialize();

  expect(Application.getIosIdForVendorAsync).toHaveBeenCalled();
  expect(Application.getAndroidId).not.toHaveBeenCalled();
});

it('should use Android ID on Android', async () => {
  (Platform.OS as unknown) = 'android';

  await userPreferencesStore.initialize();

  expect(Application.getAndroidId).toHaveBeenCalled();
  expect(Application.getIosIdForVendorAsync).not.toHaveBeenCalled();
});
});
