3. Minimap Plugin
The Minimap shows a high-level overview of the canvas, including all nodes and the current viewport rectangle. It allows click-and-drag navigation.

Configuration Location: ui.minimap object in your config.

Theme Location: theme.colors.minimap.

Configuration Options
TypeScript

interface MinimapConfig {
  enabled: boolean;
  size: number;               // Width/Height of the minimap square (default: 180)
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  opacity: number;            // Opacity of the minimap container
  showNodes: boolean;         // Whether to render dots for nodes
  interactive: boolean;       // If true, allows dragging the viewport rect
  showViewportIndicator: boolean; // Show the rectangle representing current view
}
How to Customize
Node Colors: Currently, node colors in the minimap are hardcoded based on node type in Minimap.tsx (getNodeColor function). To customize this, you would need to refactor getNodeColor to read from a new config section or the node's metadata.

Sizing: Increase size for complex graphs where nodes are hard to see.