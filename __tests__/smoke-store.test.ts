import { userPreferencesStore } from '@/store';

describe('UserPreferencesStore smoke test', () => {
  it('should import the store and have expected shape', () => {
    expect(userPreferencesStore).toBeDefined();
    expect(typeof userPreferencesStore.hydrateDone).toBe('boolean');
    expect(typeof userPreferencesStore.certificationLevel).toBe('string');
    expect(typeof userPreferencesStore.setCertificationLevel).toBe('function');
  });
});
