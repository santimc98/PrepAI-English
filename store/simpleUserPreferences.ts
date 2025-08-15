// Simplified version of userPreferences.ts for testing
import { Platform } from 'react-native';

export type CertificationLevel = 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

class SimpleUserPreferencesStore {
  private _certificationLevel: CertificationLevel = 'B1';
  private _hydrateDone = false;

  get certificationLevel(): CertificationLevel {
    return this._certificationLevel;
  }

  get hydrateDone(): boolean {
    return this._hydrateDone;
  }

  async setCertificationLevel(level: CertificationLevel): Promise<void> {
    this._certificationLevel = level;
    this._hydrateDone = true;
  }

  async initialize(): Promise<void> {
    this._hydrateDone = true;
  }
}

// Create and export the singleton instance
export const simpleUserPreferencesStore = new SimpleUserPreferencesStore();

// Initialize the store
simpleUserPreferencesStore.initialize().catch(console.error);
