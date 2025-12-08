// hooks/use-events.ts
import { useEffect, useRef } from 'react';
import { useCanvas } from './use-canvas';
import { CanvasEvent } from '@types';

export const useEventListener = (
  event: CanvasEvent,
  callback: (data: any) => void,
  dependencies: any[] = []
) => {
  const { engine } = useCanvas();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!engine) return;

    const handleEvent = (data: any) => {
      callbackRef.current(data);
    };

    const unsubscribe = engine.getEventBus().on(event, handleEvent);

    return () => {
      unsubscribe();
    };
  }, [engine, event, ...dependencies]);
};