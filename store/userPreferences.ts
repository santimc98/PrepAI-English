import { Platform, PlatformOSType } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventBus } from '@/store/eventBus';
import * as Application from 'expo-application';

// Telemetry event types (mismo)
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

type SetLevelOptions = {
  persist?: boolean;     // default: true
  syncServer?: boolean;  // default: false
};

export interface UserPreferencesState {
  certificationLevel: CertificationLevel;
  setCertificationLevel: (level: CertificationLevel, options?: SetLevelOptions) => Promise<void>;
  hydrateDone: boolean;
}

const DEFAULT_LEVEL: CertificationLevel = 'B1';
const STORAGE_KEY = 'prefs:certLevel:v1';

// Storage con import estático, fallback para web
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      // Fallback a localStorage en web
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {}
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Fallback a localStorage en web
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch (e2) {
        console.error('Storage setItem failed', e2);
      }
      throw e;  // Lanza si falla en native
    }
  },
};

// Resto del class igual, pero usa eventBus directo (no __bus)
class UserPreferencesStore implements UserPreferencesState {
  private _certificationLevel: CertificationLevel = DEFAULT_LEVEL;
  private _hydrateDone = false;
  private _initialized = false;
  private _listeners: (() => void)[] = [];

  private _notifyListeners() {
    this._listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('Error in listener:', e);
      }
    });
  }

  private async logTelemetry(event: Omit<TelemetryEvent, 'timestamp' | 'deviceId' | 'platform' | 'appVersion'>) {
    // Mismo
    try {
      const deviceId = await this.getDeviceId();
      const telemetryEvent: TelemetryEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        deviceId,
        platform: Platform.OS,
        appVersion: Application.nativeApplicationVersion || 'unknown',
      };
      if (__DEV__) {
        console.log('[Telemetry]', telemetryEvent);
      }
    } catch (e) {
      console.warn('Failed to log telemetry:', e);
    }
  }

  private async getDeviceId(): Promise<string> {
    try {
      if (Platform.OS === 'ios') {
        return await Application.getIosIdForVendorAsync() || 'unknown-device';
      } else if (Platform.OS === 'android') {
        return Application.getAndroidId() || 'unknown-device';
      }
      return 'unknown-device';
    } catch {
      return 'unknown-device';
    }
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
    if (typeof level !== 'string') {
      console.warn('Invalid type for level: not a string');
      this.logTelemetry({
        event: 'cert_level_load_failed',
        error: 'Invalid type: not a string',
        previousLevel: level?.toString()
      });
      return DEFAULT_LEVEL;
    }
    const normalized = level.trim().toUpperCase();
    if (['A2', 'B1', 'B2', 'C1', 'C2'].includes(normalized)) {
      return normalized as CertificationLevel;
    }
    console.warn(`Invalid certification level: ${level}. Falling back to ${DEFAULT_LEVEL}`);
    this.logTelemetry({
      event: 'cert_level_load_failed',
      error: `Invalid level: ${level}`,
      previousLevel: level
    });
    return DEFAULT_LEVEL;
  }

  public async initialize(): Promise<void> {
    if (this._initialized) return;
    await this.getDeviceId().catch(() => {});
    this._initialized = true;

    this._certificationLevel = DEFAULT_LEVEL;
    this._notifyListeners();

    try {
      const stored = await storage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalizedLevel = this.normalizeLevel(parsed);
        this._certificationLevel = normalizedLevel;  // Quitar el if !== DEFAULT, siempre update para consistencia
        this._notifyListeners();
      }

      if (process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
        await this.syncWithServer(this._certificationLevel).catch(e => {
          this.logTelemetry({
            event: 'cert_level_sync_failed',
            error: e instanceof Error ? e.message : String(e),
            previousLevel: this._certificationLevel
          });
        });
      }
    } catch (e) {
      console.warn('Failed to initialize preferences', e);
    } finally {
      this._hydrateDone = true;
      this._notifyListeners();
    }
  }

  async setCertificationLevel(next: CertificationLevel, options: SetLevelOptions = {}) {
    const { persist = true, syncServer = false } = options;

    const prev = this._certificationLevel;
    this._certificationLevel = next;
    this._notifyListeners();

    // Persistir exactamente como espera el test:
    // key: STORAGE_KEY ('prefs:certLevel:v1')
    // value: JSON.stringify(next) --> '"C1"'
    if (persist) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.error('Failed to persist certification level', error);
      }
    }

    // Emitir SIEMPRE el evento con { from, to }
    try {
      eventBus.emit('prefs:certLevel:changed', { from: prev, to: next });
    } catch {}

    // Sync opcional
    if (syncServer) {
      try {
        await this.syncWithServer(next);
      } catch (error) {
        console.warn?.('Failed to sync certification level', error);
      }
    }
  }

  private async syncWithServer(level: CertificationLevel, retryCount = 0): Promise<void> {
    // Mismo placeholder
    if (process.env.EXPO_PUBLIC_USE_SUPABASE !== 'true') return;

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000 * Math.pow(2, retryCount);

    try {
      // TODO: Implementar sync real con Supabase (e.g., update profile)
      const syncTime = new Date().toISOString();
      await storage.setItem(`${STORAGE_KEY}:lastSync`, syncTime);
    } catch (error) {
      console.warn(`Failed to sync level (attempt ${retryCount + 1}):`, error);
      if (retryCount < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return this.syncWithServer(level, retryCount + 1);
      }
      const errorMsg = `Failed to sync after ${MAX_RETRIES} attempts`;
      console.error(errorMsg);
      await this.logTelemetry({
        event: 'cert_level_sync_failed',
        error: errorMsg,
        previousLevel: level,
        retryCount: MAX_RETRIES
      });
    }
  }
}

export const userPreferencesStore = new UserPreferencesStore();

if (process.env.NODE_ENV !== 'test') {
  userPreferencesStore.initialize().catch(console.error);
}