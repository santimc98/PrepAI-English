// Test that only imports but doesn't use the store
import { userPreferencesStore } from '../store/userPreferences';

// This test just imports the store but doesn't use it
describe('Import Only Test', () => {
  it('should pass if the import works', () => {
    expect(true).toBe(true);
  });
});
