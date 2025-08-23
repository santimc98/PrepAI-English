// Test using eventBus in a similar way to userPreferences.ts
import { eventBus } from '../store/eventBus';

// Similar to how it's used in userPreferences.ts
eventBus.on('prefs:certLevel:changed', (data) => {
  console.log('Level changed:', data);
});

describe('EventBus Usage Test', () => {
  it('should use eventBus', () => {
    // This is a no-op, we just want to see if the import and setup works
    expect(true).toBe(true);
  });
});
