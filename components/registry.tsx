import React from 'react';
import { CanvasNode } from '@types';

// Import your separated nodes
import { TextNode, ImageNode, ShapeNode, AINode } from './nodes';

// Type Definition
type NodeComponent = React.ComponentType<{ node: CanvasNode; theme: any }>;

// Registry Map
const registry = new Map<string, NodeComponent>();

export const ComponentRegistry = {
  register(type: string, component: NodeComponent) {
    registry.set(type, component);
  },

  get(type: string): NodeComponent {
    // Return TextNode as a safe default if type is not found
    return registry.get(type) || TextNode;
  },

  // Initialize with the imported components
  initialize() {
    this.register('text', TextNode);
    this.register('image', ImageNode);
    this.register('shape', ShapeNode);
    this.register('ai-generated', AINode);
  }
};

// Auto-initialize
ComponentRegistry.initialize();