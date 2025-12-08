# TiNodes Architecture Documentation

## 1. System Overview
TiNodes is a modular, high-performance infinite canvas framework built with React and TypeScript. It separates core logic (math, state, physics) from the UI rendering layer, connected via an event-driven plugin architecture.

### Key Design Patterns
* **Core/UI Separation:** The `CanvasEngine` handles logic; React components handle rendering.
* **Event-Driven:** Modules communicate via a central `EventBus` to remain decoupled.
* **Plugin System:** All UI features (Grid, Nodes, Toolbar) are isolated plugins.
* **Dependency Injection:** Contexts inject the Engine and Configs into components.

---

## 2. Core Modules

### Canvas Engine (`core/canvas-engine.ts`)
* **Role:** The central controller or "brain" of the application.
* **Responsibilities:**
    * Initializes internal subsystems (`ViewportManager`, `CoordinateSystem`, `EventBus`).
    * Manages the state of all `CanvasNodes` (CRUD operations).
    * Handles hit-testing (determining what the user clicked).
    * Orchestrates drag operations (both Viewport panning and Node moving).
* **Relationships:**
    * Owns: `ViewportManager`, `CoordinateSystem`, `EventBus`.
    * Used By: `CanvasContext`, `BasePlugin`.

### Viewport Manager (`core/viewport-manager.ts`)
* **Role:** The "camera" of the system.
* **Responsibilities:**
    * Stores `x`, `y`, and `zoom` state.
    * Enforces constraints (min/max zoom, world bounds).
    * Handles geometric transformations (Zoom-to-cursor, Pan-to-point).
    * Emits `viewport:changed` events via the EventBus.
* **Relationships:**
    * Used By: `CanvasEngine`.

### Coordinate System (`core/coordinate-system.ts`)
* **Role:** The mathematical utility layer.
* **Responsibilities:**
    * Converts **Screen Coordinates** (mouse pixels) ↔ **World Coordinates** (canvas positions).
    * Calculates visible bounds (culling).
    * Handles grid snapping and world clamping math.
* **Relationships:**
    * Used By: `CanvasEngine`, `ViewportManager`, `Minimap`.

### Event Bus (`events/event-bus.ts`)
* **Role:** The nervous system for inter-module communication.
* **Responsibilities:**
    * Pub/Sub mechanism for decoupling.
    * Events include: `viewport:changed`, `node:dragged`, `config:changed`.
    * Maintains a history of events (for debugging).
* **Relationships:**
    * Injected into: Every major system.

### Configs Manager (`configs/index.ts`)
* **Role:** Centralized configuration store.
* **Responsibilities:**
    * Manages themes, viewport settings, and plugin configurations.
    * Provides deep-merging of user settings with defaults.
    * Allows modules to subscribe to specific config sections (e.g., `ui.grid`).

---

## 3. Plugin System

### Base Plugin (`plugins/base-plugin.ts`)
* **Role:** Abstract base class for all functional extensions.
* **Features:** Standardized lifecycle (`initialize`, `activate`, `deactivate`, `render`).
* **Interaction:** Bridges the imperative `CanvasEngine` with declarative React UI.

### Built-in Plugins

#### 1. Node Layer Plugin
* **Role:** Renders the primary content (nodes).
* **Interaction:**
    * Listens to `node:added`, `node:moved`.
    * Uses `ComponentRegistry` to map node types (text, image, shape) to React components.
    * Updates positions directly via refs/state when the engine updates.

#### 2. Grid Plugin
* **Role:** Renders the infinite background grid.
* **Interaction:**
    * Listens to `viewport:changed` to pan/zoom the background pattern.
    * Listens to `config:changed` for theme updates (color, density).

#### 3. Minimap Plugin
* **Role:** Provides navigation context.
* **Interaction:**
    * **Two-way binding:**
        1.  Engine -> Minimap: Updates indicator when viewport moves.
        2.  Minimap -> Engine: Sets viewport when user drags the indicator.

#### 4. Toolbar Plugin
* **Role:** Provides floating controls.
* **Interaction:**
    * Emits commands (`ZOOM_IN`, `RESET`) to the Engine.
    * Does NOT modify state directly; it requests changes.

---

## 4. Interaction Flows

### Flow A: User Pans the Canvas
1.  **Input:** User drags on `CanvasContainer`.
2.  **Engine:** `handlePointerMove` calls `engine.updateDrag()`.
3.  **ViewportManager:** Calculates new X/Y based on delta.
4.  **EventBus:** Emits `viewport:changed`.
5.  **Plugins:**
    * `GridPlugin`: Re-renders background position.
    * `NodeLayer`: Updates node transforms.
    * `Minimap`: Updates viewport rect indicator.

### Flow B: User Drags a Node
1.  **Input:** User clicks a node in `CanvasContainer`.
2.  **Hit Test:** `engine.getNodeAtPosition()` identifies the target.
3.  **State:** Engine sets `isNodeDragging = true`.
4.  **Loop:** User moves mouse -> `engine.updateNodeDrag()`.
5.  **Event:** Engine emits `node:dragged`.
6.  **UI:** `NodeLayer` listens to event and updates that specific node's position.

### Flow C: Zooming
1.  **Input:** Mouse Wheel or Toolbar Click.
2.  **Engine:** `engine.zoom(delta, cursorPosition)`.
3.  **Math:** `CoordinateSystem` calculates the "stable point" so the view zooms *towards* the cursor.
4.  **Update:** Viewport is updated; `viewport:changed` fires.