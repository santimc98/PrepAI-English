// Minimal test to verify project imports
import { userPreferencesStore } from '../store/userPreferences';

describe('Minimal Import Test', () => {
  it('should import userPreferencesStore', () => {
    expect(userPreferencesStore).toBeDefined();
  });
});
