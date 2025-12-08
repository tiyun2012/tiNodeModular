Minimap Plugin Documentation

```markdown
# Minimap Plugin Documentation

**Plugin ID:** `minimap`  
**Class:** `MinimapPlugin`

The Minimap Plugin renders a high-level overview of the entire canvas. It displays nodes as small indicators and draws a rectangle representing the current viewport. Users can click or drag on the minimap to navigate the main canvas rapidly.

## Configuration

The minimap is configured via the `ui.minimap` object.

### Interface

```typescript
interface MinimapConfig {
  enabled: boolean;           // Default: true
  size: number;               // Width/Height in pixels (Default: 180)
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  opacity: number;            // Opacity of the background (Default: 0.8)
  showNodes: boolean;         // Render node indicators (Default: true)
  interactive: boolean;       // Allow click/drag navigation (Default: true)
  showViewportIndicator: boolean; // Show the view rectangle (Default: true)
}
Usage Example
TypeScript

const customConfig = {
  ui: {
    minimap: {
      size: 250,              // Larger map
      position: 'bottom-right',
      opacity: 0.9
    }
  }
};
Theming
Colors for the minimap container and indicators are defined in the theme.

Background: theme.colors.minimap.background

Border: theme.colors.minimap.border

Viewport Rect: theme.colors.minimap.indicator

Node Representation
Currently, nodes are rendered as colored dots. The color is determined by the getNodeColor function in components/built-in/Minimap.tsx.

AI Nodes: Magenta

Image Nodes: Emerald Green

Shape Nodes: Amber

Default: Blue

To change these colors, you must currently modify the getNodeColor switch statement in the component source code.