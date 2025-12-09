// File: D:\dev\tiNodeModular\components\built-in\NodeLayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Viewport, CanvasNode } from '@types';
import { CanvasEngine } from '@core/canvas-engine';
import { ComponentRegistry } from '../registry';
import './NodeLayer.css'; 

interface NodeLayerProps {
  engine: CanvasEngine;
  // We ignore the passed viewport prop as it might be stale in a static container
  viewport?: Viewport; 
  theme: any;
}

export const NodeLayer: React.FC<NodeLayerProps> = ({ engine, theme }) => {
  // ✅ FIX 1: Track viewport internally so we don't rely on parent re-renders
  const [state, setState] = useState({
    nodes: engine.getNodes(),
    viewport: engine.getViewport()
  });
  
  const rafRef = useRef<number | null>(null);
  const isDirty = useRef(false);

  useEffect(() => {
    const eventBus = engine.getEventBus();

    const scheduleUpdate = () => {
      isDirty.current = true;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (isDirty.current) {
            // ✅ FIX 2: Batch update both nodes and viewport
            setState({
              nodes: [...engine.getNodes()],
              viewport: { ...engine.getViewport() }
            });
            isDirty.current = false;
          }
          rafRef.current = null;
        });
      }
    };

    // ✅ FIX 3: Listen to viewport changes!
    // Without this, nodes won't move when you drag the minimap or pan
    const unsubViewport = eventBus.on('viewport:changed', scheduleUpdate);
    const unsubAdd = eventBus.on('node:added', scheduleUpdate);
    const unsubRemove = eventBus.on('node:removed', scheduleUpdate);
    const unsubUpdate = eventBus.on('node:updated', scheduleUpdate);
    const unsubDrag = eventBus.on('node:dragged', scheduleUpdate);

    return () => {
      unsubViewport(); unsubAdd(); unsubRemove(); unsubUpdate(); unsubDrag();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [engine]);

  const { nodes, viewport } = state;

  return (
    <div className="node-layer-container">
      {nodes.map(node => {
        const NodeComponent = ComponentRegistry.get(node.type);
        const isDragging = node.id === engine.getDraggedNodeId();

        // Calculate position using the FRESH internal viewport state
        const x = node.position.x * viewport.zoom + viewport.x;
        const y = node.position.y * viewport.zoom + viewport.y;

        return (
          <div
            key={node.id}
            className={`node-item ${isDragging ? 'node-dragging' : ''}`}
            style={{
              transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`,
              width: `${node.size.width * viewport.zoom}px`,
              height: `${node.size.height * viewport.zoom}px`,
              borderColor: isDragging ? theme.colors.node.selected : theme.colors.node.border,
              backgroundColor: theme.colors.node.background,
              color: theme.colors.node.text,
              fontSize: `${14 * viewport.zoom}px`,
              willChange: isDragging ? 'transform' : 'auto',
              pointerEvents: 'auto'
            }}
          >
            <NodeComponent node={node} theme={theme} />
          </div>
        );
      })}
    </div>
  );
};