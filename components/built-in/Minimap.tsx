// components/built-in/Minimap.tsx
import React, { useRef, useState, useMemo } from 'react';
import { Viewport, CanvasNode, Position } from '@types';

interface MinimapProps {
  viewport: Viewport;
  nodes: CanvasNode[];
  config: any;
  theme: any;
  onNavigate: (x: number, y: number) => void;
}

const WORLD_SIZE = 10000;

export const Minimap: React.FC<MinimapProps> = ({ viewport, nodes, config, theme, onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Hide on mobile
  if (window.innerWidth < 768 || !config.enabled) return null;

  // Calculate indicator position
  const { left, top, width, height } = useMemo(() => {
    const screenToWorld = (screenPos: Position, viewport: Viewport): Position => ({
      x: (screenPos.x - viewport.x) / viewport.zoom,
      y: (screenPos.y - viewport.y) / viewport.zoom,
    });

    const topLeft = screenToWorld({ x: 0, y: 0 }, viewport);
    const bottomRight = screenToWorld({ x: window.innerWidth, y: window.innerHeight }, viewport);
    
    const worldWidth = bottomRight.x - topLeft.x;
    const worldHeight = bottomRight.y - topLeft.y;
    const mapScale = 100 / WORLD_SIZE;

    return {
      left: (topLeft.x * mapScale) + 50,
      top: (topLeft.y * mapScale) + 50,
      width: worldWidth * mapScale,
      height: worldHeight * mapScale,
    };
  }, [viewport]);

  // Handle drag navigation (for the indicator)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!config.interactive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !config.interactive) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current.getBoundingClientRect();
    const dxPx = e.clientX - dragStartRef.current.x;
    const dyPx = e.clientY - dragStartRef.current.y;

    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const dxWorld = (dxPx / rect.width) * WORLD_SIZE;
    const dyWorld = (dyPx / rect.height) * WORLD_SIZE;

    onNavigate(dxWorld, dyWorld);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // Get node color based on type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'ai-generated':
        return '#d946ef';
      case 'image':
        return '#10b981';
      case 'shape':
        return '#f59e0b';
      case 'text':
      default:
        return '#3b82f6';
    }
  };

  return (
    <div
      className="minimap"
      ref={containerRef}
      // ✅ FIX: Stop propagation to prevent main canvas panning/zooming
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        bottom: config.position.includes('bottom') ? '16px' : 'auto',
        top: config.position.includes('top') ? '16px' : 'auto',
        left: config.position.includes('left') ? '16px' : 'auto',
        right: config.position.includes('right') ? '16px' : 'auto',
        width: config.size,
        height: config.size,
        backgroundColor: theme.colors.minimap.background,
        border: `1px solid ${theme.colors.minimap.border}`,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        zIndex: 40,
        boxShadow: theme.shadows.md,
        backdropFilter: 'blur(4px)',
        opacity: config.opacity,
        pointerEvents: config.interactive ? 'auto' : 'none',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Nodes */}
        {config.showNodes && nodes.map(node => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: getNodeColor(node.type),
              borderRadius: '50%',
              left: `${(node.position.x / WORLD_SIZE) * 100 + 50}%`,
              top: `${(node.position.y / WORLD_SIZE) * 100 + 50}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Viewport Indicator */}
        {config.showViewportIndicator && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              border: `1px solid ${theme.colors.minimap.indicator}`,
              backgroundColor: isDragging
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              cursor: config.interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
              pointerEvents: 'auto',
              touchAction: 'none',
            }}
          />
        )}

        {/* Center Crosshair */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 2,
          height: 2,
          background: 'rgba(255, 255, 255, 0.3)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
};