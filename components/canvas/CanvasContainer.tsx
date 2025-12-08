// components/canvas/CanvasContainer.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import { useCanvas } from '@hooks/use-canvas';
import { useConfigs } from '@hooks/use-configs';

export const CanvasContainer: React.FC = () => {
  const { engine, plugins } = useCanvas();
  const { ui } = useConfigs();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track what we are dragging (Viewport or Node)
  const interactionMode = useRef<'idle' | 'panning' | 'dragging_node'>('idle');
  
  // --- Input Handlers ---

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!engine) return;
    
    // 1. Capture pointer
    (e.target as Element).setPointerCapture(e.pointerId);
    
    // 2. Determine what was clicked
    const worldPos = engine.screenToWorld({ x: e.clientX, y: e.clientY });
    const clickedNode = engine.getNodeAtPosition(worldPos);

    if (clickedNode) {
      // MODE: Node Dragging
      interactionMode.current = 'dragging_node';
      engine.startNodeDrag(clickedNode.id, e.clientX, e.clientY);
    } else {
      // MODE: Viewport Panning
      interactionMode.current = 'panning';
      engine.startDrag(e.clientX, e.clientY);
    }
  }, [engine]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!engine || interactionMode.current === 'idle') return;
    
    e.preventDefault();
    
    if (interactionMode.current === 'dragging_node') {
      engine.updateNodeDrag(e.clientX, e.clientY);
    } else if (interactionMode.current === 'panning') {
      engine.updateDrag(e.clientX, e.clientY);
    }
  }, [engine]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!engine) return;
    
    if (interactionMode.current === 'dragging_node') {
      engine.endNodeDrag();
    } else if (interactionMode.current === 'panning') {
      engine.endDrag();
    }
    
    interactionMode.current = 'idle';
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, [engine]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!engine) return;
    // Standard behavior: Ctrl+Wheel or Pinch is zoom, otherwise ignored or pan
    // For this simple implementation, we allow direct wheel zoom
    if (e.ctrlKey || e.metaKey) {
       e.preventDefault();
    }
    engine.zoom(e.deltaY, { x: e.clientX, y: e.clientY });
  }, [engine]);

  // --- Render ---

  if (!engine) return null;
  const activePlugins = plugins.filter(p => p.isActivated());

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'grab',
        touchAction: 'none',
        overflow: 'hidden',
        backgroundColor: ui.theme?.colors?.background || '#0f172a',
        outline: 'none',
      }}
      tabIndex={0}
    >
      {activePlugins.map(plugin => {
        // Render the plugin content
        const content = plugin.render ? plugin.render() : null;
        return content ? <React.Fragment key={plugin.id}>{content}</React.Fragment> : null;
      })}
    </div>
  );
};