// components/canvas/CanvasContainer.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvas } from '@hooks/use-canvas';
import { useConfigs } from '@hooks/use-configs';

export const CanvasContainer: React.FC = () => {
  const { engine, plugins } = useCanvas();
  const { ui } = useConfigs();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Force re-render when viewport or plugins change
  const [, setTick] = useState(0);
  
  useEffect(() => {
    if (!engine) return;
    const forceUpdate = () => setTick(t => t + 1);
    
    // Subscribe to engine events
    const unsubViewport = engine.getEventBus().on('viewport:changed', forceUpdate);
    const unsubPlugins = engine.getEventBus().on('plugin:render-requested', forceUpdate); // For NodePicker updates
    
    return () => {
      unsubViewport();
      unsubPlugins();
    };
  }, [engine]);

  // Track what we are dragging (Viewport or Node)
  const interactionMode = useRef<'idle' | 'panning' | 'dragging_node'>('idle');

  // ✅ NEW: Handle Right Click natively in React
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the browser's default menu
    
    if (!engine) return;
    
    // Emit custom event for plugins (like NodePicker) to listen to
    engine.getEventBus().emit('canvas:contextmenu', {
      x: e.clientX,
      y: e.clientY
    });
  }, [engine]);
  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!engine) return;
    
    // Only allow left-click (button 0) to initiate dragging/panning
    // Right-click is reserved for context menu
    if (e.button !== 0) return;
    
    (e.target as Element).setPointerCapture(e.pointerId);
    
    const worldPos = engine.screenToWorld({ x: e.clientX, y: e.clientY });
    const clickedNode = engine.getNodeAtPosition(worldPos);

    if (clickedNode) {
      interactionMode.current = 'dragging_node';
      engine.startNodeDrag(clickedNode.id, e.clientX, e.clientY);
    } else {
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
    if (e.ctrlKey || e.metaKey) {
       e.preventDefault();
    }
    engine.zoom(e.deltaY, { x: e.clientX, y: e.clientY });
  }, [engine]);

  if (!engine) return null;
  const activePlugins = plugins.filter(p => p.isActivated());

  return (
    <div
      ref={containerRef}
      data-canvas-container 
      className="canvas-container"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu} // 👈 This connects the right-click logic
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
      {/* Render all active plugins */}
      {activePlugins.map(plugin => {
        const content = plugin.render ? plugin.render() : null;
        return content ? <React.Fragment key={plugin.id}>{content}</React.Fragment> : null;
      })}
    </div>
  );
};