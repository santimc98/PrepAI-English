// Test for simplified user preferences store
import { simpleUserPreferencesStore } from '../store/simpleUserPreferences';

describe('Simple UserPreferences Test', () => {
  it('should import simpleUserPreferencesStore', () => {
    expect(simpleUserPreferencesStore).toBeDefined();
  });

  it('should have default certification level', () => {
    expect(simpleUserPreferencesStore.certificationLevel).toBe('B1');
  });

  it('should set certification level', async () => {
    await simpleUserPreferencesStore.setCertificationLevel('C1');
    expect(simpleUserPreferencesStore.certificationLevel).toBe('C1');
  });
});
