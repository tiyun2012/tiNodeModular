// contexts/events-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventBus } from '@events/event-bus';
import { CanvasEvent, EventPayload } from '@types';

interface EventsContextValue {
  eventBus: EventBus | null;
  subscribe: (event: CanvasEvent, callback: (data: any) => void) => () => void;
  emit: (event: CanvasEvent, data?: any) => void;
  history: EventPayload[];
  clearHistory: () => void;
  addWildcardListener: (callback: (payload: EventPayload) => void) => () => void;
}

const EventsContext = createContext<EventsContextValue | null>(null);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

interface EventsProviderProps {
  children: React.ReactNode;
  eventBus?: EventBus; // Optional external event bus
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ 
  children, 
  eventBus: externalEventBus 
}) => {
  const [internalEventBus] = useState(() => externalEventBus || new EventBus());
  const [history, setHistory] = useState<EventPayload[]>([]);

  // Subscribe to event bus history updates
  useEffect(() => {
    // Subscribe to all events to build history
    const unsubscribe = internalEventBus.on('*' as CanvasEvent, (payload: EventPayload) => {
      setHistory(prev => {
        const newHistory = [...prev, payload];
        // Keep only last 100 events
        if (newHistory.length > 100) {
          return newHistory.slice(-100);
        }
        return newHistory;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [internalEventBus]);

  const subscribe = (event: CanvasEvent, callback: (data: any) => void) => {
    return internalEventBus.on(event, callback);
  };

  const emit = (event: CanvasEvent, data?: any) => {
    internalEventBus.emit(event, data);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const addWildcardListener = (callback: (payload: EventPayload) => void) => {
    return internalEventBus.on('*' as CanvasEvent, callback);
  };

  const value: EventsContextValue = {
    eventBus: internalEventBus,
    subscribe,
    emit,
    history,
    clearHistory,
    addWildcardListener,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

// Helper hooks for specific events
export const useViewportEvents = (callback: (viewport: any) => void) => {
  const { subscribe } = useEvents();
  
  useEffect(() => {
    const unsubscribe = subscribe('viewport:changed', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useToolbarEvents = (callback: (action: string) => void) => {
  const { subscribe } = useEvents();
  
  useEffect(() => {
    const unsubscribe = subscribe('toolbar:action', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useConfigEvents = (callback: (config: any) => void) => {
  const { subscribe } = useEvents();
  
  useEffect(() => {
    const unsubscribe = subscribe('config:changed', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

// Hook to listen to multiple events
export const useEventListeners = (
  events: CanvasEvent[],
  callback: (event: CanvasEvent, data: any) => void
) => {
  const { subscribe } = useEvents();
  
  useEffect(() => {
    const unsubscribers = events.map(event => 
      subscribe(event, (data) => callback(event, data))
    );
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribe, events, callback]);
};