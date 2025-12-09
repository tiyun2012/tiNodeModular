docs/doc_NodeLayerPlugin.md
Updated to explain the new Performance Architecture.

Markdown

# Node Layer Plugin Documentation

**Plugin ID:** `node-layer`  
**Class:** `NodeLayerPlugin`

The Node Layer is the core plugin responsible for rendering the actual content of your canvas. It listens to engine events (`node:added`, `node:dragged`, etc.) and renders React components corresponding to the node data.

## Architecture & Performance

To maintain 60fps during heavy interactions (like dragging a node across a complex graph), the Node Layer uses a decoupled rendering architecture.

### **1. RequestAnimationFrame (RAF) Throttling**
Instead of updating React state on every single mouse event (which can fire 120+ times per second on high-refresh displays), the layer uses a "Dirty Flag" pattern:
1.  Engine emits `node:dragged`.
2.  Listener sets `isDirty = true`.
3.  A scheduled `requestAnimationFrame` loop checks the flag.
4.  If dirty, it triggers **one** React state update for that frame.

### **2. Internal State Management**
The Node Layer maintains its own internal copy of `nodes` and `viewport`.
* **Why?** The parent `CanvasContainer` is a "Static Shell" that does not re-render during interactions.
* **Result:** The Node Layer is self-contained. It subscribes directly to `viewport:changed` to update positions, ensuring nodes stay synchronized with the camera even if the parent component doesn't update.

### **3. GPU Acceleration**
Nodes are positioned using CSS hardware acceleration:
* **Transform:** `translate3d(x, y, 0)` forces the browser to use the GPU.
* **Will-Change:** Active nodes receive `will-change: transform` to hint the browser compositor.
* **Pointer Events:** `pointer-events: auto` is explicitly set to ensure nodes capture clicks despite the container configuration.

## Node Data Structure

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
Theming
Nodes are styled using the theme.colors.node object.

Container Background: theme.colors.node.background

Border: theme.colors.node.border

Selected State: theme.colors.node.selected (Border color when dragging)

Text Color: theme.colors.node.text

Customization: Adding New Node Types
We recommend isolating each node type in its own file within components/nodes/.

1. Create the Component

TypeScript

// components/nodes/VideoNode.tsx
import React from 'react';
import { CanvasNode } from '@types';

export const VideoNode: React.FC<{ node: CanvasNode; theme: any }> = ({ node, theme }) => (
  <div style={{ height: '100%', background: '#000' }}>
     <video src={node.metadata?.src} controls style={{ width: '100%' }} />
  </div>
);
2. Register the Component Update components/registry.tsx:

TypeScript

import { VideoNode } from './nodes';

export const ComponentRegistry = {
  initialize() {
    this.register('video', VideoNode);
  }
};

---

### 3. `docs/doc_NodePickerPlugin.md`
*Added the critical "Event Isolation" section.*

```markdown
# Node Picker Plugin Documentation

**Plugin ID:** `node-picker`  
**Class:** `NodePickerPlugin`

The Node Picker Plugin provides a context-sensitive menu for quickly adding new nodes to the canvas. It is triggered via a right-click or a keyboard shortcut, appearing at the cursor's location or the screen center.

## Interaction & Event Isolation

Since the Node Picker floats **on top** of the interactive Canvas, it must carefully manage pointer events to avoid conflicts.

### **The "Capture Conflict" Problem**
If a user clicks inside the Node Picker (e.g., to focus the search bar), that `pointerdown` event naturally bubbles up to the `CanvasContainer`. The Container interprets this as a "Pan Start" command and captures the pointer. This "freezes" the Node Picker, as all subsequent input is hijacked by the canvas pan logic.

### **The Solution: Event Propagation Stopping**
The Node Picker root component explicitly stops propagation for all pointer events:
* `onPointerDown`
* `onPointerMove`
* `onPointerUp`
* `onWheel`
* `onClick`

This ensures that interactions within the menu remain isolated and do not trigger viewport panning or node dragging.

## Configuration

The Node Picker is part of the `builtIn` plugins list. It relies on theme settings for styling.

### Interaction Triggers

**Context Menu (Right-Click):**
* **Trigger:** Right-clicking anywhere on the CanvasContainer.
* **Event:** Listens for `canvas:contextmenu`.
* **Behavior:** Opens the picker at the exact mouse coordinates.

**Keyboard Shortcut:**
* **Trigger:** `Ctrl + Shift + N` (or `Cmd + Shift + N`).
* **Behavior:** Opens the picker at the center of the screen.

## Events

* **Emits:** `node:created` when a user selects a node type.
* **Listens:** `canvas:contextmenu` to know when to appear.
4. docs/doc_MinimapPlugin.md
Updated to mention throttling.

Markdown

# Minimap Plugin Documentation

**Plugin ID:** `minimap`  
**Class:** `MinimapPlugin`

The Minimap Plugin renders a high-level overview of the entire canvas. It displays nodes as small indicators and draws a rectangle representing the current viewport. Users can click or drag on the minimap to navigate the main canvas rapidly.

## Performance Optimization

### **Throttled Navigation**
Dragging the viewport indicator on the minimap triggers high-frequency updates. To prevent the main thread from locking up:
1.  The Minimap component uses `requestAnimationFrame` to throttle drag events.
2.  Updates are only sent to the Engine (via `onNavigate`) once per frame.
3.  This ensures the main Canvas renders smoothly even during rapid minimap scrubbing.

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
Theming
Colors for the minimap container and indicators are defined in the theme.

Background: theme.colors.minimap.background

Border: theme.colors.minimap.border

Viewport Rect: theme.colors.minimap.indicator

Node Representation
Nodes are rendered as colored dots based on their type:

AI Nodes: Magenta (#d946ef)

Image Nodes: Emerald Green (#10b981)

Shape Nodes: Amber (#f59e0b)

Default: Blue (#3b82f6)