// components/built-in/DebugOverlay.tsx
import React from 'react';
import { Viewport } from '@types';

interface DebugOverlayProps {
  viewport: Viewport;
  config: any;
  theme: any;
  fps: number;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ viewport, config, theme, fps }) => {
  if (!config.enabled) return null;

  // Format coordinates based on config
  const formatCoordinates = () => {
    const formatCoord = (value: number) => Math.round(value);
    
    switch (config.coordinateFormat) {
      case 'world':
        const worldX = (0 - viewport.x) / viewport.zoom;
        const worldY = (0 - viewport.y) / viewport.zoom;
        return `X: ${formatCoord(worldX)} Y: ${formatCoord(worldY)}`;
      case 'both':
        const worldX2 = (0 - viewport.x) / viewport.zoom;
        const worldY2 = (0 - viewport.y) / viewport.zoom;
        return `Screen: ${formatCoord(viewport.x)}, ${formatCoord(viewport.y)} | World: ${formatCoord(worldX2)}, ${formatCoord(worldY2)}`;
      case 'screen':
      default:
        return `X: ${formatCoord(viewport.x)} Y: ${formatCoord(viewport.y)}`;
    }
  };

  return (
    <>
      {/* Debug Info */}
      {config.showCoordinates && (
        <div
          className="debug-info"
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: theme.borderRadius.md,
            color: theme.colors.text.secondary,
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 50,
            pointerEvents: 'none',
            userSelect: 'none',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${theme.colors.toolbar.border}`,
          }}
        >
          {formatCoordinates()}
        </div>
      )}

      {/* FPS Counter */}
      {config.showFPS && (
        <div
          className="debug-fps"
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: theme.borderRadius.md,
            color: theme.colors.text.secondary,
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 50,
            pointerEvents: 'none',
            userSelect: 'none',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${theme.colors.toolbar.border}`,
          }}
        >
          {fps} FPS
        </div>
      )}

      {/* Instructions Overlay */}
      <div
        className="instruction-overlay"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 30,
        }}
      >
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          opacity: 0.2,
          color: theme.colors.text.primary,
        }}>
          InfiniSpace
        </h1>
        <p style={{
          opacity: 0.4,
          color: theme.colors.text.secondary,
          fontSize: '1rem',
        }}>
          Drag to pan • Scroll to zoom • Arrow keys to move
        </p>
      </div>
    </>
  );
};