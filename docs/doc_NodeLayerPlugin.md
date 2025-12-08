Node Layer Plugin Documentation

```markdown
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
  type: string;       // Keys into the ComponentRegistry
  content: string;    // Main text content
  position: { x: number, y: number };
  size: { width: number, height: number };
  metadata?: any;     // Custom data (colors, image URLs, etc.)
}
Theming
Nodes are styled using the theme.colors.node object.

Container Background: theme.colors.node.background

Border: theme.colors.node.border

Selected State: theme.colors.node.selected (Border color when dragging)

Text Color: theme.colors.node.text

Customization: Adding New Node Types
To add a custom node type (e.g., a Video Player):

Create the Component:

TypeScript

// components/custom/VideoNode.tsx
const VideoNode = ({ node }) => (
  <div style={{ height: '100%', background: '#000' }}>
     <video src={node.metadata.src} controls style={{ width: '100%' }} />
  </div>
);
Register the Component: In your app initialization (e.g., index.tsx or a specialized config file):

TypeScript

import { ComponentRegistry } from './components/registry';
import { VideoNode } from './components/custom/VideoNode';

ComponentRegistry.register('video', VideoNode);
Add the Node:

TypeScript

engine.addNode({
  type: 'video',
  content: 'My Video',
  position: { x: 0, y: 0 },
  size: { width: 400, height: 300 },
  metadata: { src: 'demo.mp4' }
});