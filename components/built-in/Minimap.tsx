// components/built-in/Minimap.tsx
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Viewport, CanvasNode, Position } from '@types';
import './Minimap.css'; 

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

  // Safety check
  if (window.innerWidth < 768 || !config.enabled) return null;

  // --- 1. Calculate Dimensions (Memoized) ---
  const { left, top, width, height } = useMemo(() => {
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
      width: Math.max(0, worldWidth * mapScale), 
      height: Math.max(0, worldHeight * mapScale),
    };
  }, [viewport]);

  // --- 2. The Robust "Window Listener" Drag Pattern ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!config.interactive) return;
    
    e.preventDefault();
    e.stopPropagation(); // Stop Canvas Panning
    
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    // ✅ FORCE GLOBAL CURSOR
    document.body.style.cursor = 'grabbing';

    // ✅ ATTACH GLOBAL LISTENERS
    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
  };

  const handleWindowPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    
    // Throttle with RAF
    if (rafRef.current) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dxPx = currentX - dragStartRef.current.x;
        const dyPx = currentY - dragStartRef.current.y;
        
        dragStartRef.current = { x: currentX, y: currentY };

        const dxWorld = (dxPx / rect.width) * WORLD_SIZE;
        const dyWorld = (dyPx / rect.height) * WORLD_SIZE;

        onNavigate(dxWorld, dyWorld);
        rafRef.current = null;
    });
  };

  const handleWindowPointerUp = (e: PointerEvent) => {
    setIsDragging(false);
    
    // ✅ CLEANUP GLOBAL CURSOR
    document.body.style.cursor = '';
    
    // ✅ REMOVE LISTENERS
    window.removeEventListener('pointermove', handleWindowPointerMove);
    window.removeEventListener('pointerup', handleWindowPointerUp);

    if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    }
  };

  // Cleanup on unmount (just in case)
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      document.body.style.cursor = '';
    };
  }, []);

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
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onContextMenu={(e) => { e.stopPropagation(); e.preventDefault(); }}
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
            draggable={false}
            // ✅ Only Attach Down Handler (Move/Up handled globally)
            onPointerDown={handlePointerDown}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              border: `1px solid ${theme.colors.minimap.indicator}`,
              backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              // We still set cursor here for HOVER state (grab), 
              // but the dragging state (grabbing) is forced on body.
              cursor: config.interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
              pointerEvents: 'auto',
              touchAction: 'none',
              userSelect: 'none', 
            }}
          />
        )}

        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 2, height: 2, background: 'rgba(255, 255, 255, 0.3)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
};
