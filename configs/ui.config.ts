import { ToolbarConfig } from '@types';

export interface GridConfig {
  enabled: boolean;
  size: number;
  color: string;
  fadeBelowZoom: number;
  opacity: number;
  showLargeGrid: boolean;
  largeGridMultiplier: number;
}

export interface MinimapConfig {
  enabled: boolean;
  size: number;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  opacity: number;
  showNodes: boolean;
  interactive: boolean;
  showViewportIndicator: boolean;
}

export interface DebugConfig {
  enabled: boolean;
  showCoordinates: boolean;
  showFPS: boolean;
  showEvents: boolean;
  showPerformance: boolean;
  coordinateFormat: 'screen' | 'world' | 'both';
}

export interface UIConfig {
  toolbar: ToolbarConfig;
  grid: GridConfig;
  minimap: MinimapConfig;
  debug: DebugConfig;
}

export const DEFAULT_UI_CONFIG: UIConfig = {
  toolbar: {
    enabled: true,
    position: 'floating',
    width: 38,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 19,
    items: [],
  },
  grid: {
    enabled: true,
    size: 20,
    color: '#334155',
    fadeBelowZoom: 0.5,
    opacity: 1,
    showLargeGrid: true,
    largeGridMultiplier: 10,
  },
  minimap: {
    enabled: true,
    size: 180,
    position: 'bottom-left',
    opacity: 0.8,
    showNodes: true,
    interactive: true,
    showViewportIndicator: true,
  },
  debug: {
    enabled: true,
    showCoordinates: true,
    showFPS: false,
    showEvents: false,
    showPerformance: false,
    coordinateFormat: 'screen',
  },
};