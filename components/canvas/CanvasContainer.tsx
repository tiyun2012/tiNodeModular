// components/canvas/CanvasContainer.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useCanvas } from '@hooks/use-canvas';
import { useConfigs } from '@hooks/use-configs';
import { PluginErrorBoundary } from '@components/common/PluginErrorBoundary';

export const CanvasContainer: React.FC = () => {
  const { engine, plugins } = useCanvas();
  const { ui } = useConfigs();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Force update when plugins request it
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

  // ✅ FIX: The "Window Listener" Pattern
  // This ensures smooth dragging even if you leave the node or the browser window
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!engine || e.button !== 0) return;
    
    // 1. Identify what we clicked
    const worldPos = engine.screenToWorld({ x: e.clientX, y: e.clientY });
    const clickedNode = engine.getNodeAtPosition(worldPos);
    
    // 2. Determine Mode
    const mode = clickedNode ? 'dragging_node' : 'panning';
    interactionMode.current = mode;

    // 3. Start Engine Action
    if (mode === 'dragging_node' && clickedNode) {
      engine.startNodeDrag(clickedNode.id, e.clientX, e.clientY);
    } else {
      engine.startDrag(e.clientX, e.clientY);
    }

    // 4. Set Global Cursor (Overrides everything else)
    document.body.style.cursor = 'grabbing';

    // 5. Define Global Handlers
    const onPointerMove = (ev: PointerEvent) => {
        ev.preventDefault();
        if (mode === 'dragging_node') {
            engine.updateNodeDrag(ev.clientX, ev.clientY);
        } else {
            engine.updateDrag(ev.clientX, ev.clientY);
        }
    };

    const onPointerUp = (ev: PointerEvent) => {
        // Stop Engine Action
        if (mode === 'dragging_node') engine.endNodeDrag();
        else engine.endDrag();

        // Reset State
        interactionMode.current = 'idle';
        document.body.style.cursor = ''; // Revert to CSS rules

        // Cleanup Listeners
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    };

    // 6. Attach to WINDOW (not the div)
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

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
      // ✅ REMOVED: onPointerMove & onPointerUp (handled by window now)
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        cursor: 'grab', 
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