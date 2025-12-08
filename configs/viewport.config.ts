// configs/viewport.config.ts
export interface ViewportBehaviors {
  inertia: boolean;
  momentum: number; // 0-1
  snapToGrid: boolean;
  constrainToWorld: boolean;
}

export interface ViewportConfig {
  initial: {
    x: number;
    y: number;
    zoom: number;
  };
  constraints: {
    minZoom: number;
    maxZoom: number;
    worldSize: number;
  };
  behaviors: ViewportBehaviors;
}

export const DEFAULT_VIEWPORT_CONFIG: ViewportConfig = {
  initial: {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    zoom: 1,
  },
  constraints: {
    minZoom: 0.1,
    maxZoom: 5.0,
    worldSize: 10000,
  },
  behaviors: {
    inertia: false,
    momentum: 0.9,
    snapToGrid: false,
    constrainToWorld: false,
  },
};