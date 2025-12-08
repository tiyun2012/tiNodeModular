Node Layer Plugin
This plugin renders the actual interactive elements (nodes) on the canvas. It is unique because it relies heavily on the ComponentRegistry for content rendering.

Configuration Location: No specific ui config; relies on theme.colors.node.

Registry: TiNodes/components/registry.tsx.

Theming Options
Controlled via theme.colors.node:

TypeScript

interface NodeTheme {
  background: string; // Background color of node containers
  border: string;     // Default border color
  selected: string;   // Border color when dragging/selected
  hover: string;      // Border color on hover
  text: string;       // Default text color
}
How to Customize (Advanced)
The most powerful customization here is adding new node types.

Create a Component: Create a React component that accepts node and theme props.

TypeScript

const VideoNode = ({ node, theme }) => (
  <div style={{ border: `1px solid ${theme.colors.primary}` }}>
    <video src={node.metadata.src} />
  </div>
);
Register it: Use the registry singleton to link a type string to your component.

TypeScript

import { ComponentRegistry } from '@components/registry';
ComponentRegistry.register('video', VideoNode);
Use it: Add a node with type: 'video' to your engine.