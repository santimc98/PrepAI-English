// Enhanced minimal version of userPreferences.ts for testing
import { Platform, PlatformOSType } from 'react-native';
import { eventBus } from './eventBus';

// Telemetry event types
type TelemetryEvent = {
  event: 'cert_level_changed' | 'cert_level_sync_failed' | 'cert_level_load_failed';
  timestamp: string;
  deviceId?: string;
  platform: PlatformOSType;
  appVersion?: string;
  previousLevel?: string;
  newLevel?: string;
  error?: string;
  retryCount?: number;
};

export type CertificationLevel = 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

const DEFAULT_LEVEL: CertificationLevel = 'B1';
const STORAGE_KEY = 'prefs:certLevel:v1';

// Simple in-memory storage for testing
const memoryStorage: Record<string, string> = {};

// Try to import AsyncStorage dynamically
let AsyncStorage: any;
if (Platform.OS !== 'web') {
  try {
    // This is just the import, we'll use it in the next step
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.warn('AsyncStorage import failed, falling back to memory storage', e);
  }
}

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    return memoryStorage[key] || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStorage[key] = value;
  }
};

class MinimalUserPreferencesStore {
  private _certificationLevel: CertificationLevel = DEFAULT_LEVEL;
  private _hydrateDone = false;
  private _initialized = false;
  private _listeners: (() => void)[] = [];

  private _notifyListeners() {
    this._listeners.forEach(listener => listener());
  }

  private logTelemetry(event: Omit<TelemetryEvent, 'timestamp' | 'deviceId' | 'platform' | 'appVersion'>) {
    // No-op for now
  }

  private async getDeviceId(): Promise<string> {
    // Simplified version without expo-application
    return 'test-device-id';
  }

  subscribe(listener: () => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  get certificationLevel(): CertificationLevel {
    return this._certificationLevel;
  }

  get hydrateDone(): boolean {
    return this._hydrateDone;
  }

  private normalizeLevel(level: unknown): CertificationLevel {
    if (typeof level !== 'string') return DEFAULT_LEVEL;
    const normalized = level.toUpperCase();
    if (['A2', 'B1', 'B2', 'C1', 'C2'].includes(normalized)) {
      return normalized as CertificationLevel;
    }
    return DEFAULT_LEVEL;
  }

  async initialize(): Promise<void> {
    if (this._initialized) return;
    
    try {
      const stored = await storage.getItem(STORAGE_KEY);
      if (stored) {
        this._certificationLevel = this.normalizeLevel(stored);
      }
      this._hydrateDone = true;
      this._initialized = true;
      this._notifyListeners();
    } catch (e) {
      console.error('Failed to initialize user preferences', e);
      this._hydrateDone = true; // Continue even if hydration fails
      this._initialized = true;
    }
  }

  async setCertificationLevel(level: CertificationLevel): Promise<void> {
    const previousLevel = this._certificationLevel;
    this._certificationLevel = this.normalizeLevel(level);
    
    try {
      await storage.setItem(STORAGE_KEY, this._certificationLevel);
      
      // Log the change
      this.logTelemetry({
        event: 'cert_level_changed',
        previousLevel,
        newLevel: this._certificationLevel
      });
      
      // Notify listeners
      this._notifyListeners();
      
      // Emit event
      eventBus.emit('prefs:certLevel:changed', {
        from: previousLevel,
        to: this._certificationLevel
      });
    } catch (e) {
      console.error('Failed to save certification level', e);
      // Revert on error
      this._certificationLevel = previousLevel;
      throw e;
    }
  }
}

// Create and export the singleton instance
export const minimalUserPreferencesStore = new MinimalUserPreferencesStore();

// Initialize the store
minimalUserPreferencesStore.initialize().catch(console.error);
