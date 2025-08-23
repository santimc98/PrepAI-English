// Test importing just the type from userPreferences
import type { CertificationLevel } from '../store/userPreferences';

describe('Type Import Test', () => {
  it('should import CertificationLevel type', () => {
    const level: CertificationLevel = 'B1';
    expect(level).toBe('B1');
  });
});
