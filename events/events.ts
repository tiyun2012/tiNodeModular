// events/events.ts
import { CanvasEvent } from '@types';

// Event factory functions
export const createViewportChangedEvent = (viewport: any) => ({
  type: 'viewport:changed' as CanvasEvent,
  data: viewport,
});

export const createZoomEvent = (delta: number, focalPoint: any, zoom: number) => ({
  type: 'viewport:zoom' as CanvasEvent,
  data: { delta, focalPoint, zoom },
});

export const createPanEvent = (dx: number, dy: number) => ({
  type: 'viewport:pan' as CanvasEvent,
  data: { dx, dy },
});

export const createToolbarActionEvent = (action: string) => ({
  type: 'toolbar:action' as CanvasEvent,
  data: { action },
});

export const createConfigChangedEvent = (section: string, config: any) => ({
  type: 'config:changed' as CanvasEvent,
  data: { section, config },
});