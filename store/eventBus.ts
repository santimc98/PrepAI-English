type EventCallback<T = any> = (data: T) => void;

type Events = {
  'prefs:certLevel:changed': { from: string; to: string };
  // Add other events here if needed
};

class EventBus {
  private events: { [K in keyof Events]?: EventCallback<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event]!.filter(cb => cb !== callback);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    if (!this.events[event]) return;
    this.events[event]!.forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error in event handler for ${event}:`, e);
      }
    });
  }
}

export const eventBus = new EventBus();
export default eventBus;