// components/canvas/CanvasContainer.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useCanvas } from '@hooks/use-canvas';
import { useConfigs } from '@hooks/use-configs';
import { PluginErrorBoundary } from '@components/common/PluginErrorBoundary';

export const CanvasContainer: React.FC = () => {
  const { engine, plugins } = useCanvas();
  const { ui } = useConfigs();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Force update when plugins request it (e.g. NodePicker showing up)
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    if (!engine) return;
    const unsub = engine.getEventBus().on('plugin:render-requested', () => {
       forceUpdate(n => n + 1);
    });
    return unsub;
  }, [engine]);

  const interactionMode = useRef<'idle' | 'panning' | 'dragging_node'>('idle');

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!engine) return;
    engine.getEventBus().emit('canvas:contextmenu', { x: e.clientX, y: e.clientY });
  }, [engine]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!engine || e.button !== 0) return;
    
    (e.target as Element).setPointerCapture(e.pointerId);
    
    const worldPos = engine.screenToWorld({ x: e.clientX, y: e.clientY });
    const clickedNode = engine.getNodeAtPosition(worldPos);

    if (clickedNode) {
      interactionMode.current = 'dragging_node';
      engine.startNodeDrag(clickedNode.id, e.clientX, e.clientY);
      // Nodes handle their own cursors via CSS classes (.node-dragging)
    } else {
      interactionMode.current = 'panning';
      engine.startDrag(e.clientX, e.clientY);
      
      // ✅ IMPROVEMENT: Direct DOM manipulation for performance
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
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
    if (interactionMode.current === 'dragging_node') engine.endNodeDrag();
    else if (interactionMode.current === 'panning') engine.endDrag();
    
    interactionMode.current = 'idle';
    
    // ✅ IMPROVEMENT: Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }

    if ((e.target as Element).hasPointerCapture(e.pointerId)) {
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
  }, [engine]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!engine) return;
    if (e.ctrlKey || e.metaKey) e.preventDefault();
    engine.zoom(e.deltaY, { x: e.clientX, y: e.clientY });
  }, [engine]);

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
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        cursor: 'grab', // Default cursor
        touchAction: 'none', overflow: 'hidden', outline: 'none',
        backgroundColor: ui.theme?.colors?.background || '#0f172a',
      }}
      tabIndex={0}
    >
      {activePlugins.map(plugin => {
        const content = plugin.render ? plugin.render() : null;
        if (!content) return null; 

        return (
          <PluginErrorBoundary key={plugin.id} pluginId={plugin.id}>
             <React.Fragment>{content}</React.Fragment>
          </PluginErrorBoundary>
        );
      })}
    </div>
  );
};