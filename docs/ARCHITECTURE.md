# **TiNodes Architecture Documentation**

## **1. System Overview**

TiNodes is a modular, high-performance infinite canvas framework built with React and TypeScript. It separates core logic (math, state, physics) from the UI rendering layer, connected via an event-driven plugin architecture.

### **Key Design Patterns**

* **Core/UI Separation:** The CanvasEngine handles logic; React components handle rendering.
* **Event-Driven:** Modules communicate via a central EventBus to remain decoupled.
* **Plugin System:** All UI features (Grid, Nodes, Toolbar) are isolated plugins.
* **Static Shell Pattern:** The `CanvasContainer` is a static wrapper that does not re-render on every frame. Child components (plugins) manage their own subscriptions and update cycles.

## **2. Core Modules**

### **Canvas Engine (core/canvas-engine.ts)**
* **Role:** The central controller or "brain" of the application.
* **Responsibilities:** * Initializes internal subsystems (ViewportManager, CoordinateSystem, EventBus).
  * Manages the state of all CanvasNodes (CRUD operations, Graph Loading).  
  * Handles hit-testing (determining what the user clicked).
  * Orchestrates drag operations (both Viewport panning and Node moving).  
* **Relationships:** * Owns: ViewportManager, CoordinateSystem, EventBus.
  * Used By: CanvasContext, BasePlugin.

### **Viewport Manager (core/viewport-manager.ts)**
* **Role:** The "camera" of the system.
* **Responsibilities:** * Stores x, y, and zoom state.  
  * Enforces constraints (min/max zoom, world bounds).
  * Handles geometric transformations (Zoom-to-cursor, Pan-to-point).  
  * Emits `viewport:changed` events via the EventBus.

### **Coordinate System (core/coordinate-system.ts)**
* **Role:** The mathematical utility layer.
* **Responsibilities:** * Converts **Screen Coordinates** (mouse pixels) ↔ **World Coordinates** (canvas positions).
  * Calculates visible bounds (culling).  
  * Handles grid snapping and world clamping math.

### **Event Bus (events/event-bus.ts)**
* **Role:** The nervous system for inter-module communication.
* **Responsibilities:** * Pub/Sub mechanism for decoupling.  
  * Events include: `viewport:changed`, `node:dragged`, `config:changed`.
  * Maintains a history of events (for debugging).

### **Configs Manager (configs/index.ts)**
* **Role:** Centralized configuration store.  
* **Responsibilities:** * Manages themes, viewport settings, and plugin configurations.
  * Provides deep-merging of user settings with defaults.  

## **3. Plugin System**

### **Base Plugin (plugins/base-plugin.ts)**
* **Role:** Abstract base class for all functional extensions.
* **Features:** Standardized lifecycle (`initialize`, `activate`, `deactivate`, `render`).  

### **Built-in Plugins**

#### **1. Node Layer Plugin**
* **Role:** Renders the primary content (nodes).
* **Interaction:** * **RAF Throttling:** Implements a `requestAnimationFrame` loop to decouple high-frequency engine events (120Hz+) from React render cycles.
  * **Internal State:** Manages its own local state for nodes and viewport position to prevent unnecessary parent re-renders.
  * **GPU Acceleration:** Uses `translate3d` and `will-change` hints for smooth 60fps dragging.

#### **2. Grid Plugin**
* **Role:** Renders the infinite background grid.
* **Interaction:** * Listens to `viewport:changed` to pan/zoom the background pattern.
  * Listens to `config:changed` for theme updates (color, density).

#### **3. Minimap Plugin**
* **Role:** Provides navigation context.
* **Interaction:** * **Throttled Navigation:** Drag events on the map are batched via RAF to prevent main-thread blocking during updates.
  * **Two-way binding:** 1. Engine -> Minimap: Updates indicator when viewport moves.
    2. Minimap -> Engine: Sets viewport when user drags the indicator.

#### **4. Toolbar Plugin**
* **Role:** Provides floating controls.
* **Interaction:** * Emits commands (`ZOOM_IN`, `RESET`) to the Engine.  

#### **5. Node Picker Plugin**
* **Role:** Provides a quick-add menu for creating nodes.
* **Interaction:** * **Event Isolation:** Uses aggressive `stopPropagation` on pointer events to prevent "Capture Conflicts" with the main Canvas drag logic.
  * Listens to `canvas:contextmenu` to appear at the cursor position.
  * Emits `node:created` when a selection is made.

## **4. Interaction Flows**

### **Flow A: User Pans the Canvas**
1. **Input:** User drags on CanvasContainer.  
2. **Engine:** `handlePointerMove` calls `engine.updateDrag()`.
3. **ViewportManager:** Calculates new X/Y based on delta.  
4. **EventBus:** Emits `viewport:changed`.
5. **Plugins:** * NodeLayer: Detects change, schedules RAF update, applies transform.
   * GridPlugin: Re-renders background position.  

### **Flow B: User Drags a Node**
1. **Input:** User clicks a node in CanvasContainer.
2. **Hit Test:** `engine.getNodeAtPosition()` identifies the target.  
3. **State:** Engine sets `isNodeDragging = true`.
4. **Loop:** User moves mouse -> `engine.updateNodeDrag()`.  
5. **Event:** Engine emits `node:dragged` (High Frequency).
6. **Optimization:** NodeLayer receives event but **does not render immediately**. It flags `isDirty` and updates React state only on the next Animation Frame.

### **Flow D: Context Menu & Node Creation**
1. **Input:** User Right-Clicks on CanvasContainer.
2. **Container:** Prevents default browser menu and emits `canvas:contextmenu`.
3. **NodePickerPlugin:** Receives event, sets visibility, requests render.
4. **Isolation:** If user clicks inside the Picker, events are stopped (`stopPropagation`) so the Canvas doesn't interpret them as pans.