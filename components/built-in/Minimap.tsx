// components/built-in/Minimap.tsx
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Viewport, CanvasNode, Position } from '@types';
import './Minimap.css'; // Make sure to import the CSS file

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
  const rafRef = useRef<number | null>(null);

  if (window.innerWidth < 768 || !config.enabled) return null;

  const { left, top, width, height } = useMemo(() => {
    // Safety check for Zoom to prevent Infinity/NaN
    const safeZoom = Math.max(0.0001, viewport.zoom);
    
    const screenToWorld = (screenPos: Position): Position => ({
      x: (screenPos.x - viewport.x) / safeZoom,
      y: (screenPos.y - viewport.y) / safeZoom,
    });

    const topLeft = screenToWorld({ x: 0, y: 0 });
    const bottomRight = screenToWorld({ x: window.innerWidth, y: window.innerHeight });
    
    const worldWidth = bottomRight.x - topLeft.x;
    const worldHeight = bottomRight.y - topLeft.y;
    const mapScale = 100 / WORLD_SIZE;

    return {
      left: (topLeft.x * mapScale) + 50,
      top: (topLeft.y * mapScale) + 50,
      width: Math.max(0, worldWidth * mapScale), // Prevent negative width
      height: Math.max(0, worldHeight * mapScale),
    };
  }, [viewport]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!config.interactive) return;
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling to canvas
    
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !config.interactive) return;
    e.preventDefault();
    e.stopPropagation();

    // Throttle minimap updates using RAF
    if (rafRef.current) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dxPx = currentX - dragStartRef.current.x;
        const dyPx = currentY - dragStartRef.current.y;
        
        // Update ref for next frame
        dragStartRef.current = { x: currentX, y: currentY };

        const dxWorld = (dxPx / rect.width) * WORLD_SIZE;
        const dyWorld = (dyPx / rect.height) * WORLD_SIZE;

        onNavigate(dxWorld, dyWorld);
        rafRef.current = null;
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.stopPropagation();
    if ((e.target as Element).hasPointerCapture(e.pointerId)) {
        (e.target as Element).releasePointerCapture(e.pointerId);
    }
    if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'ai-generated': return '#d946ef';
      case 'image': return '#10b981';
      case 'shape': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div
      className="minimap"
      ref={containerRef}
      // ✅ FIX 1: Stop all interaction propagation to the main canvas
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      
      // ✅ FIX 2: Block Context Menu (stops Node Picker from opening)
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}

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

        {config.showViewportIndicator && (
          <div
            // ✅ FIX 3: Disable native browser dragging ghost image
            draggable={false}

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
              backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              cursor: config.interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
              pointerEvents: 'auto',
              // Force touch action off via style as backup to CSS
              touchAction: 'none',
              userSelect: 'none', 
            }}
          />
        )}

        {/* Center Crosshair (Visual Aid) */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 2, height: 2, background: 'rgba(255, 255, 255, 0.3)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
};