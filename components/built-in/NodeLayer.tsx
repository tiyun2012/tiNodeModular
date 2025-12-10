// components/built-in/NodeLayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Viewport, CanvasNode } from '@types';
import { CanvasEngine } from '@core/canvas-engine';
import { ComponentRegistry } from '../registry';
import './NodeLayer.css'; 

interface NodeLayerProps {
  engine: CanvasEngine;
  viewport?: Viewport;
  theme: any;
}

export const NodeLayer: React.FC<NodeLayerProps> = ({ engine, theme }) => {
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

    const unsubViewport = eventBus.on('viewport:changed', scheduleUpdate);
    const unsubAdd = eventBus.on('node:added', scheduleUpdate);
    const unsubRemove = eventBus.on('node:removed', scheduleUpdate);
    const unsubUpdate = eventBus.on('node:updated', scheduleUpdate);
    const unsubDrag = eventBus.on('node:dragged', scheduleUpdate);
    // ✅ FIX: Listen for drag end to reset cursor
    const unsubDragEnd = eventBus.on('node:dragend', scheduleUpdate);
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

        const x = node.position.x * viewport.zoom + viewport.x;
        const y = node.position.y * viewport.zoom + viewport.y;

        return (
          <div
            key={node.id}
            className={`node-item ${isDragging ? 'node-dragging' : ''}`}
            // ✅ FIX: Block context menu bubbling
            // ✅ FIX 3: Prevent native HTML5 drag ghosting
            draggable={false}
            onContextMenu={(e) => {
              e.stopPropagation(); // Don't let CanvasContainer see this
              e.preventDefault();  // Don't show browser default menu
            }}
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
