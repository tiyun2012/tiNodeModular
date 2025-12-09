his update includes:

Performance Section: Documents the GPU acceleration (translate3d) we implemented.

New File Structure: Explixitly documents the components/nodes/ directory pattern.

Step-by-Step Guide: Updated instructions on how to create, export, and register a new node type using the barrel file (index.ts) pattern.

Markdown

# Node Layer Plugin Documentation

**Plugin ID:** `node-layer`  
**Class:** `NodeLayerPlugin`

The Node Layer is the core plugin responsible for rendering the actual content of your canvas. It listens to engine events (`node:added`, `node:dragged`, etc.) and renders React components corresponding to the node data.

## Architecture

This plugin relies on the **Component Registry** pattern. It does not have a specific configuration object in `ui` but is heavily themable and extensible via code.

### Node Data Structure
Every node in the engine must adhere to this interface:
```typescript
interface CanvasNode {
  id: string;
  type: string;       // Keys into the ComponentRegistry (e.g., 'text', 'image')
  content: string;    // Main text content
  position: { x: number, y: number };
  size: { width: number, height: number };
  metadata?: any;     // Custom data (colors, image URLs, etc.)
}
Performance & Rendering
The Node Layer is optimized for high-performance interactions using hardware acceleration.

GPU Acceleration: Nodes are positioned using CSS transform: translate3d(...) instead of top/left. This ensures that dragging and panning operations run on the GPU and do not trigger expensive browser layout recalculations (reflows).

Will-Change Hinting: Active elements are hinted with will-change: transform to inform the browser to optimize compositing layers.

Theming
Nodes are styled using the theme.colors.node object.

Container Background: theme.colors.node.background

Border: theme.colors.node.border

Selected State: theme.colors.node.selected (Border color when dragging)

Text Color: theme.colors.node.text

Customization: Adding New Node Types
We recommend isolating each node type in its own file within components/nodes/.

1. Create the Component
Create a new file, e.g., components/nodes/VideoNode.tsx:

TypeScript

import React from 'react';
import { CanvasNode } from '@types';

export const VideoNode: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ height: '100%', background: '#000', display: 'flex', flexDirection: 'column' }}>
     <div style={{ padding: '4px', color: '#fff' }}>{node.content}</div>
     <video src={node.metadata?.src} controls style={{ width: '100%', flex: 1 }} />
  </div>
);
2. Export the Component
Add the export to the barrel file components/nodes/index.ts:

TypeScript

export * from './TextNode';
export * from './ImageNode';
export * from './ShapeNode';
export * from './AINode';
export * from './VideoNode'; // <-- Add this
3. Register the Component
Update components/registry.tsx to map the type string to your new component:

TypeScript

import { TextNode, ImageNode, ShapeNode, AINode, VideoNode } from './nodes';

// ...

export const ComponentRegistry = {
  // ...
  initialize() {
    this.register('text', TextNode);
    this.register('image', ImageNode);
    this.register('shape', ShapeNode);
    this.register('ai-generated', AINode);
    this.register('video', VideoNode); // <-- Add this
  }
};
4. Use the New Node
You can now add a node with type: 'video' to the engine:

TypeScript

engine.addNode({
  type: 'video',
  content: 'Demo Video',
  position: { x: 0, y: 0 },
  size: { width: 400, height: 300 },
  metadata: { src: '/assets/demo.mp4' }
});