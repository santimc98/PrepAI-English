import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userPreferencesStore } from '../../store/userPreferences';
import { eventBus } from '../../store/eventBus';
import * as Application from 'expo-application';

// Mock eventBus
jest.mock('../../store/eventBus', () => {
  const listeners: Record<string, ((payload: unknown) => void)[]> = {};

  const on = jest.fn((event: string, cb: (payload: unknown) => void) => {
    (listeners[event] ||= []).push(cb);
  });

  const off = jest.fn((event: string, cb: (payload: unknown) => void) => {
    const arr = listeners[event];
    if (!arr) return;
    listeners[event] = arr.filter(fn => fn !== cb);
  });

  const emit = jest.fn((event: string, payload: unknown) => {
    (listeners[event] || []).forEach(cb => cb(payload));
  });

  return { eventBus: { on, off, emit } };
});


// Mock AsyncStorage con implementación básica
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-application
jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  getIosIdForVendorAsync: jest.fn().mockResolvedValue('mock-device-id'),
  getAndroidId: jest.fn().mockReturnValue('mock-android-id'),
}));

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  userPreferencesStore['_certificationLevel'] = 'B1'; // Corrección del typo
  userPreferencesStore['_hydrateDone'] = false;
  userPreferencesStore['_initialized'] = false;
  userPreferencesStore['_listeners'] = [];
});

describe('userPreferencesStore', () => {
  describe('initialization', () => {
    it('should initialize with default values', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await userPreferencesStore.initialize();
      expect(userPreferencesStore.certificationLevel).toBe('B1');
    });

    it('should load saved level from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('"C1"');
      await userPreferencesStore.initialize();
      expect(userPreferencesStore.certificationLevel).toBe('C1');
    });

    it('should handle invalid stored level', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('"INVALID"');
      await userPreferencesStore.initialize();
      expect(userPreferencesStore.certificationLevel).toBe('B1');
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid certification level'));
    });
  });

  describe('setCertificationLevel', () => {
    it('should update the level and persist it', async () => {
      await userPreferencesStore.setCertificationLevel('C1');
      expect(userPreferencesStore.certificationLevel).toBe('C1');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('prefs:certLevel:v1', '"C1"');
      expect(eventBus.emit).toHaveBeenCalledWith('prefs:certLevel:changed', { from: 'B1', to: 'C1' });
    });

    it('should not sync with server if syncServer option is false', async () => {
      await userPreferencesStore.setCertificationLevel('C1', { syncServer: false });
      expect(userPreferencesStore.certificationLevel).toBe('C1');
      expect(eventBus.emit).toHaveBeenCalledWith('prefs:certLevel:changed', { from: 'B1', to: 'C1' });
    });

    it('should handle persistence errors gracefully', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(error);
      await userPreferencesStore.setCertificationLevel('C1');
      expect(userPreferencesStore.certificationLevel).toBe('C1');
      expect(console.error).toHaveBeenCalledWith('Failed to persist certification level', error);
    });
  });

  describe('eventBus integration', () => {
    it('should emit events on level change', async () => {
      const eventListener = jest.fn();
      eventBus.on('prefs:certLevel:changed', eventListener);
      await userPreferencesStore.setCertificationLevel('C1');
      expect(eventListener).toHaveBeenCalledWith({ from: 'B1', to: 'C1' });
    });

    it('should handle multiple event listeners', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      eventBus.on('prefs:certLevel:changed', listener1);
      eventBus.on('prefs:certLevel:changed', listener2);
      await userPreferencesStore.setCertificationLevel('C1');
      expect(listener1).toHaveBeenCalledWith({ from: 'B1', to: 'C1' });
      expect(listener2).toHaveBeenCalledWith({ from: 'B1', to: 'C1' });
    });
  });

  describe('platform-specific behavior', () => {
    it('should use iOS ID on iOS', async () => {
      Platform.OS = 'ios';
      await userPreferencesStore.initialize();
      expect(Application.getIosIdForVendorAsync).toHaveBeenCalled();
      expect(Application.getAndroidId).not.toHaveBeenCalled();
    });

    it('should use Android ID on Android', async () => {
      Platform.OS = 'android';
      await userPreferencesStore.initialize();
      expect(Application.getAndroidId).toHaveBeenCalled();
      expect(Application.getIosIdForVendorAsync).not.toHaveBeenCalled();
    });
  });
});