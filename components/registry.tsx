// components/registry.tsx
import React from 'react';
import { CanvasNode } from '@types';

// Registry maps node types to React Components
type NodeComponent = React.ComponentType<{ node: CanvasNode; theme: any }>;
const registry = new Map<string, NodeComponent>();

// --- Default Renderers ---

const TextNodeRenderer: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ padding: '8px', color: theme.colors.text.primary }}>
    {node.content}
  </div>
);

const ImageNodeRenderer: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'inherit' }}>
    <img 
      src={node.metadata?.src || 'https://via.placeholder.com/150'} 
      alt={node.content} 
      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
    />
  </div>
);

const ShapeNodeRenderer: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ 
    width: '100%', 
    height: '100%', 
    backgroundColor: node.metadata?.color || theme.colors.palette.accent,
    borderRadius: node.metadata?.shape === 'circle' ? '50%' : '4px',
    opacity: 0.5
  }} />
);

const AINodeRenderer: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ 
    padding: '12px', 
    background: `linear-gradient(135deg, ${theme.colors.palette.secondary}22, ${theme.colors.palette.primary}22)`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }}>
    <div style={{ fontSize: '0.8em', color: theme.colors.palette.secondary, textTransform: 'uppercase' }}>AI Generated</div>
    <div>{node.content}</div>
  </div>
);

// --- Registration ---

export const ComponentRegistry = {
  register(type: string, component: NodeComponent) {
    registry.set(type, component);
  },

  get(type: string): NodeComponent {
    return registry.get(type) || TextNodeRenderer;
  },

  // Initialize with defaults
  initialize() {
    this.register('text', TextNodeRenderer);
    this.register('image', ImageNodeRenderer);
    this.register('shape', ShapeNodeRenderer);
    this.register('ai-generated', AINodeRenderer);
  }
};

// Auto-initialize
ComponentRegistry.initialize();