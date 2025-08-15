// Test importing a simple utility
import { add } from '../utils/add';

describe('Utils Import Test', () => {
  it('should import and use the add function', () => {
    expect(add(2, 3)).toBe(5);
  });
});
