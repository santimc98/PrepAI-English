// Simple test to verify Jest setup with project imports
import { userPreferencesStore } from '../store/userPreferences';
import { CertificationLevel } from '../store/userPreferences';

describe('Simple Test with Project Imports', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should access userPreferencesStore', () => {
    expect(userPreferencesStore).toBeDefined();
  });
});
