// Basic test to verify Jest setup
function sum(a: number, b: number): number {
  return a + b;
}

describe('Basic Test', () => {
  it('should add two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('should pass a simple assertion', () => {
    expect(true).toBe(true);
  });
});
