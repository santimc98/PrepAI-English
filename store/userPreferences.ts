import { Platform, PlatformOSType } from 'react-native';
import * as _eventBus from '@/store/eventBus';
const __bus = (_eventBus as any)?.eventBus ?? { on() {}, off() {}, emit() {} };
import * as Application from 'expo-application';

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

export interface UserPreferencesState {
  certificationLevel: CertificationLevel;
  setCertificationLevel: (level: CertificationLevel, options?: { persist?: boolean; syncServer?: boolean }) => Promise<void>;
  hydrateDone: boolean;
}

const DEFAULT_LEVEL: CertificationLevel = 'B1';
const STORAGE_KEY = 'prefs:certLevel:v1';

// Storage abstraction for web and native
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    // 1) intenta AsyncStorage (funciona con el mock en Jest)
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const v = await AsyncStorage.getItem(key);
      if (v != null) return v;
    } catch {}
    // 2) cae a localStorage en web
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch {}
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    // 1) intenta AsyncStorage (mockeable en Jest)
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem(key, value);
      return;
    } catch {}
    // 2) cae a localStorage en web
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    } catch (e) {
      console.error('Storage setItem failed', e);
    }
  },
};

// In-memory store with persistence
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
    try {
      const deviceId = await this.getDeviceId();
      const telemetryEvent: TelemetryEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        deviceId,
        platform: Platform.OS,
        appVersion: Application.nativeApplicationVersion || 'unknown',
      };

      // Log to console in development
      if (__DEV__) {
        console.log('[Telemetry]', telemetryEvent);
      }

      // In a real app, you would send this to your analytics service
      // Example:
      // await analytics.logEvent(event.event, telemetryEvent);
      
    } catch (e) {
      console.warn('Failed to log telemetry:', e);
    }
  }

  private async getDeviceId(): Promise<string> {
    try {
      // Try to get a stable device ID
      return await Application.getIosIdForVendorAsync() || 
             Application.getAndroidId() || 
             'unknown-device';
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
      this.logTelemetry({
        event: 'cert_level_load_failed',
        error: 'Invalid type: not a string',
        previousLevel: level?.toString()
      });
      return DEFAULT_LEVEL;
    }
    
    // Normalize string case and trim whitespace
    const normalized = level.trim().toUpperCase();
    
    // Check if the normalized value is a valid CertificationLevel
    if (['A2', 'B1', 'B2', 'C1', 'C2'].includes(normalized)) {
      return normalized as CertificationLevel;
    }
    
    // Fallback to default if invalid
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
    
    // Set initial state before hydration to avoid UI flash
    this._certificationLevel = DEFAULT_LEVEL;
    this._notifyListeners();
    
    try {
      // Try to load from AsyncStorage
      const stored = await storage.getItem(STORAGE_KEY);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const normalizedLevel = this.normalizeLevel(parsed);
          
          // Only update if different from default to avoid unnecessary re-renders
          if (normalizedLevel !== DEFAULT_LEVEL) {
            this._certificationLevel = normalizedLevel;
            this._notifyListeners();
          }
        } catch (e) {
          console.warn('Failed to parse stored preferences', e);
          // Fall through to use default
        }
      }
      
      // If we have a session, try to sync with server
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
      // Continue with default values
    } finally {
      this._hydrateDone = true;
      this._notifyListeners();
    }
  }

  async setCertificationLevel(
    level: CertificationLevel,
    options: { persist?: boolean; syncServer?: boolean } = { persist: true, syncServer: true }
  ): Promise<void> {
    // Normalize the input level
    const normalizedLevel = this.normalizeLevel(level);
    const prevLevel = this._certificationLevel;
    
    // If the level hasn't changed, do nothing
    if (normalizedLevel === prevLevel) return;

    // Update in-memory state immediately for responsive UI
    this._certificationLevel = normalizedLevel;
    
    // Log the level change for analytics
    this.logTelemetry({
      event: 'cert_level_changed',
      previousLevel: prevLevel,
      newLevel: normalizedLevel
    });
    
    // Notify subscribers of the change
    this._notifyListeners();
    
    // Emit event for cache invalidation and other listeners
    __bus.emit('prefs:certLevel:changed', { 
      from: prevLevel, 
      to: normalizedLevel 
    });

    // Prepare an array of promises for all operations we want to perform
    const operations: Promise<unknown>[] = [];

    // Persist to local storage if requested
    if (options.persist) {
    operations.push(
      storage.setItem(STORAGE_KEY, JSON.stringify(normalizedLevel))
        .catch(e => {
          console.error('Failed to persist certification level', e);
        })
      );
    }


    // Sync with server if requested (fire and forget)
    if (options.syncServer && process.env.EXPO_PUBLIC_USE_SUPABASE === 'true') {
      operations.push(
        this.syncWithServer(normalizedLevel)
          .catch(e => {
            console.warn('Background sync failed', e);
            this.logTelemetry({
              event: 'cert_level_sync_failed',
              error: e instanceof Error ? e.message : String(e),
              previousLevel: prevLevel,
              newLevel: normalizedLevel
            });
            // The syncWithServer method handles its own retries
          })
      );
    }

    // Log for analytics
    console.log(`[prefs] certLevel_changed: ${prevLevel} → ${normalizedLevel}`);
    
    // Wait for all operations to complete (but don't block the UI)
    // Note: We're not awaiting here to keep the UI responsive
    Promise.all(operations).catch(e => {
      console.warn('One or more operations failed', e);
    });
  }

  private async syncWithServer(level: CertificationLevel, retryCount = 0): Promise<void> {
    if (process.env.EXPO_PUBLIC_USE_SUPABASE !== 'true') return;

    const startTime = Date.now();
    const operationId = Math.random().toString(36).substring(2, 9);
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000 * Math.pow(2, retryCount); // Exponential backoff

    // Log start of sync
    console.log(`[Sync ${operationId}] Starting sync for level: ${level}`);

    try {
      // Placeholder for API call to sync preferences
      // On success, update the last sync time
      const syncTime = new Date().toISOString();
      await storage.setItem(`${STORAGE_KEY}:lastSync`, syncTime);

      // Log successful sync
      const duration = Date.now() - startTime;
      console.log(`[Sync ${operationId}] Completed in ${duration}ms`);
    } catch (error) {
      console.warn(`Failed to sync certification level (attempt ${retryCount + 1}):`, error);

      // Retry with exponential backoff
      if (retryCount < MAX_RETRIES - 1) {
        console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return this.syncWithServer(level, retryCount + 1);
      }

      // After max retries, log the error and continue
      const errorMsg = `Failed to sync certification level after ${MAX_RETRIES} attempts`;
      console.error(`[Sync ${operationId}] ${errorMsg}`);

      await this.logTelemetry({
        event: 'cert_level_sync_failed',
        error: errorMsg,
        previousLevel: level,
        retryCount: MAX_RETRIES
      });
    }
  }
}

// Create and initialize the store
export const userPreferencesStore = new UserPreferencesStore();
userPreferencesStore.initialize().catch(console.error);
