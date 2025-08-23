// Test with no imports
describe('No Imports Test', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should access a global', () => {
    expect(global).toBeDefined();
  });
});
