// components/built-in/Grid.tsx
import React from 'react';
import { Viewport } from '@types';

interface GridProps {
  viewport: Viewport;
  config: any;
  theme: any;
}

export const Grid: React.FC<GridProps> = React.memo(({ viewport, config, theme }) => {
  if (!config.enabled) return null;

  const { x, y, zoom } = viewport;
  const scaledGridSize = config.size * zoom;
  
  // Calculate opacity
  const opacity = zoom >= 0.5 
    ? config.opacity 
    : Math.max(0, (zoom - config.fadeBelowZoom) / (0.5 - config.fadeBelowZoom)) * config.opacity;

  const gridStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
    backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
    backgroundPosition: `${x}px ${y}px`,
    backgroundImage: `radial-gradient(circle, ${config.color} 1px, transparent 1px)`,
    opacity,
    transform: 'translateZ(0)',
  };

  // Large grid
  const largeGridSize = scaledGridSize * (config.largeGridMultiplier || 10);
  const largeGridStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    backgroundSize: `${largeGridSize}px ${largeGridSize}px`,
    backgroundPosition: `${x}px ${y}px`,
    backgroundImage: config.showLargeGrid
      ? `linear-gradient(to right, ${config.color}20 1px, transparent 1px),
         linear-gradient(to bottom, ${config.color}20 1px, transparent 1px)`
      : 'none',
    opacity: opacity * 0.5,
  };

  return (
    <>
      <div style={gridStyle} />
      {config.showLargeGrid && <div style={largeGridStyle} />}
    </>
  );
});

Grid.displayName = 'Grid';