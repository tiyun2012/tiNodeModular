import { UIConfig } from '@types'; // ✅ Import interfaces from types

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
