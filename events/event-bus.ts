// events/event-bus.ts
import { CanvasEvent, EventPayload } from '@types';

type EventCallback = (data: any) => void;

export class EventBus {
  private listeners: Map<CanvasEvent, Set<EventCallback>> = new Map();
  private eventHistory: EventPayload[] = [];
  private maxHistory = 100;

  on(event: CanvasEvent, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event: CanvasEvent, callback: EventCallback): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  emit(event: CanvasEvent, data?: any): void {
    const payload: EventPayload = {
      event,
      data,
      timestamp: Date.now(),
    };

    // Add to history
    this.eventHistory.push(payload);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    // Notify listeners
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    // Also notify wildcard listeners
    const wildcardCallbacks = this.listeners.get('*' as CanvasEvent);
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in wildcard event handler:', error);
        }
      });
    }
  }

  once(event: CanvasEvent, callback: EventCallback): void {
    const onceCallback = (data: any) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  getHistory(): EventPayload[] {
    return [...this.eventHistory];
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  dispose(): void {
    this.listeners.clear();
    this.eventHistory = [];
  }
}