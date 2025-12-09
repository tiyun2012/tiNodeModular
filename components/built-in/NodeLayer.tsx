// components/built-in/NodeLayer.tsx
import React, { useState, useEffect } from 'react';
import { Viewport, CanvasNode } from '@types';
import { CanvasEngine } from '@core/canvas-engine';
import { ComponentRegistry } from '../registry';
import './NodeLayer.css'; 

interface NodeLayerProps {
  engine: CanvasEngine;
  viewport: Viewport;
  theme: any;
}

export const NodeLayer: React.FC<NodeLayerProps> = ({ engine, viewport, theme }) => {
  const [nodes, setNodes] = useState<CanvasNode[]>(engine.getNodes());

  useEffect(() => {
    const eventBus = engine.getEventBus();
    const updateNodes = () => setNodes(engine.getNodes());

    const unsubAdd = eventBus.on('node:added', updateNodes);
    const unsubRemove = eventBus.on('node:removed', updateNodes);
    const unsubUpdate = eventBus.on('node:updated', updateNodes);
    const unsubDrag = eventBus.on('node:dragged', updateNodes);

    return () => {
      unsubAdd(); unsubRemove(); unsubUpdate(); unsubDrag();
    };
  }, [engine]);

  return (
    <div className="node-layer-container">
      {nodes.map(node => {
        const NodeComponent = ComponentRegistry.get(node.type);
        const isDragging = node.id === engine.getDraggedNodeId();

        // Calculate position
        const x = node.position.x * viewport.zoom + viewport.x;
        const y = node.position.y * viewport.zoom + viewport.y;

        return (
          <div
            key={node.id}
            className={`node-item ${isDragging ? 'node-dragging' : ''}`}
            style={{
              // ✅ OPTIMIZATION: Use translate3d for GPU acceleration
              // We append translate(-50%, -50%) to maintain the centering defined in CSS
              transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`,
              width: `${node.size.width * viewport.zoom}px`,
              height: `${node.size.height * viewport.zoom}px`,
              borderColor: isDragging ? theme.colors.node.selected : theme.colors.node.border,
              backgroundColor: theme.colors.node.background,
              color: theme.colors.node.text,
              fontSize: `${14 * viewport.zoom}px`,
              willChange: 'transform',
            }}
          >
            <NodeComponent node={node} theme={theme} />
          </div>
        );
      })}
    </div>
  );
};