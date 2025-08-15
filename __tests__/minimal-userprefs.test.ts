// Minimal test for userPreferences import
import { userPreferencesStore } from '../store/userPreferences';

describe('Minimal UserPreferences Test', () => {
  it('should import userPreferencesStore', () => {
    expect(userPreferencesStore).toBeDefined();
  });
});
