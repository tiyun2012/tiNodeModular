// TiNodes/contexts/events-context.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { EventBus } from '@events/event-bus';
import { CanvasEvent, EventPayload } from '@types';

interface EventsContextValue {
  eventBus: EventBus | null;
  subscribe: (event: CanvasEvent, callback: (data: any) => void) => () => void;
  emit: (event: CanvasEvent, data?: any) => void;
  // Change history to a getter or ref to avoid state updates on every event
  getHistory: () => EventPayload[];
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
  eventBus?: EventBus;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ 
  children, 
  eventBus: externalEventBus 
}) => {
  const [internalEventBus] = useState(() => externalEventBus || new EventBus());
  
  // ✅ FIX: Use useRef for history to prevent re-renders on every event
  const historyRef = useRef<EventPayload[]>([]);

  useEffect(() => {
    const unsubscribe = internalEventBus.on('*' as CanvasEvent, (payload: EventPayload) => {
      // Just push to ref, do not trigger setHistory (state update)
      historyRef.current.push(payload);
      if (historyRef.current.length > 100) {
        historyRef.current.shift();
      }
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
    historyRef.current = [];
  };
  
  const getHistory = () => historyRef.current;

  const addWildcardListener = (callback: (payload: EventPayload) => void) => {
    return internalEventBus.on('*' as CanvasEvent, callback);
  };

  const value: EventsContextValue = {
    eventBus: internalEventBus,
    subscribe,
    emit,
    getHistory, // Exposed getter instead of state
    clearHistory,
    addWildcardListener,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

// ... Helper hooks remain the same ...
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