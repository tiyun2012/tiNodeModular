// core/index.ts
import { CanvasEngine } from './canvas-engine';
import { ViewportManager } from './viewport-manager';
import { CoordinateSystem } from './coordinate-system';

// Re-export all core components
export { CanvasEngine, ViewportManager, CoordinateSystem };

// Core constants
export const CORE_VERSION = '1.0.0';
export const CORE_NAME = 'InfiniSpace Core';

// Core factory functions
export function createCoreSystem(config?: {
  viewport?: Partial<{
    x: number;
    y: number;
    zoom: number;
  }>;
  constraints?: Partial<{
    minZoom: number;
    maxZoom: number;
    worldSize: number;
    behaviors: {
      inertia: boolean;
      momentum: number;
      snapToGrid: boolean;
      constrainToWorld: boolean;
    };
  }>;
}) {
  const defaultConfig = {
    viewport: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      zoom: 1,
    },
    constraints: {
      minZoom: 0.1,
      maxZoom: 5.0,
      worldSize: 10000,
      behaviors: {
        inertia: false,
        momentum: 0.9,
        snapToGrid: false,
        constrainToWorld: false,
      },
    },
  };
  
  const mergedConfig = {
    viewport: { ...defaultConfig.viewport, ...config?.viewport },
    constraints: { ...defaultConfig.constraints, ...config?.constraints },
  };
  
  // Now CoordinateSystem is available because we imported it
  const coordinateSystem = new CoordinateSystem(
    mergedConfig.constraints.worldSize,
    mergedConfig.constraints
  );
  
  return {
    coordinateSystem,
    viewport: mergedConfig.viewport,
    constraints: mergedConfig.constraints,
  };
}

// Core utilities
export function formatViewport(viewport: { x: number; y: number; zoom: number }): string {
  return `X: ${Math.round(viewport.x)}, Y: ${Math.round(viewport.y)}, Zoom: ${Math.round(viewport.zoom * 100)}%`;
}

export function calculateZoomLevel(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}

export function isViewportEqual(a: { x: number; y: number; zoom: number }, b: { x: number; y: number; zoom: number }): boolean {
  return Math.abs(a.x - b.x) < 0.01 && 
         Math.abs(a.y - b.y) < 0.01 && 
         Math.abs(a.zoom - b.zoom) < 0.01;
}

// Core event constants
export const CORE_EVENTS = {
  VIEWPORT_CHANGED: 'viewport:changed',
  VIEWPORT_ZOOM: 'viewport:zoom',
  VIEWPORT_PAN: 'viewport:pan',
  VIEWPORT_RESET: 'viewport:reset',
  VIEWPORT_ANIMATION_START: 'viewport:animation:start',
  VIEWPORT_ANIMATION_END: 'viewport:animation:end',
} as const;

// Core performance monitoring
export class CoreMonitor {
  private static instance: CoreMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  
  private constructor() {
    this.lastTime = performance.now();
    this.startMonitoring();
  }
  
  static getInstance(): CoreMonitor {
    if (!CoreMonitor.instance) {
      CoreMonitor.instance = new CoreMonitor();
    }
    return CoreMonitor.instance;
  }
  
  private startMonitoring(): void {
    const update = () => {
      const currentTime = performance.now();
      this.frameCount++;
      
      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      
      requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  }
  
  getFPS(): number {
    return this.fps;
  }
  
  getStats(): {
    fps: number;
    timestamp: number;
  } {
    return {
      fps: this.fps,
      timestamp: Date.now(),
    };
  }
}