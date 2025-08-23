// Test for minimal user preferences store
import { minimalUserPreferencesStore } from '../store/minimalUserPreferences';

describe('Minimal UserPreferences Test', () => {
  it('should import minimalUserPreferencesStore', () => {
    expect(minimalUserPreferencesStore).toBeDefined();
  });

  it('should have default certification level', () => {
    expect(minimalUserPreferencesStore.certificationLevel).toBe('B1');
  });

  it('should set certification level', async () => {
    await minimalUserPreferencesStore.setCertificationLevel('C1');
    expect(minimalUserPreferencesStore.certificationLevel).toBe('C1');
  });
});
