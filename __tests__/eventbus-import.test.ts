// Test importing eventBus directly
import { eventBus } from '../store/eventBus';

describe('EventBus Import Test', () => {
  it('should import eventBus', () => {
    expect(eventBus).toBeDefined();
  });
});
