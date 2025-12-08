// components/built-in/NodeLayer.tsx
import React, { useState, useEffect } from 'react';
import { Viewport, CanvasNode } from '@types';
import { CanvasEngine } from '@core/canvas-engine';
import { ComponentRegistry } from '../registry';
import './NodeLayer.css'; // Make sure to create the CSS file below

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

        return (
          <div
            key={node.id}
            className={`node-item ${isDragging ? 'node-dragging' : ''}`}
            // Dynamic coordinates MUST be inline for performance
            style={{
              left: `${node.position.x * viewport.zoom + viewport.x}px`,
              top: `${node.position.y * viewport.zoom + viewport.y}px`,
              width: `${node.size.width * viewport.zoom}px`,
              height: `${node.size.height * viewport.zoom}px`,
              borderColor: isDragging ? theme.colors.node.selected : theme.colors.node.border,
              backgroundColor: theme.colors.node.background,
              color: theme.colors.node.text,
              fontSize: `${14 * viewport.zoom}px`,
            }}
          >
            <NodeComponent node={node} theme={theme} />
          </div>
        );
      })}
    </div>
  );
};