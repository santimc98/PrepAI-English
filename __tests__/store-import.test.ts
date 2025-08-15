// Test importing from the store directory
import { getGreeting } from '../store/simpleStore';

describe('Store Import Test', () => {
  it('should import and use the getGreeting function', () => {
    expect(getGreeting()).toBe('Hello from store');
  });
});
