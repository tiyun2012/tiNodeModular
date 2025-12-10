// core/canvas-engine.ts
import { Viewport, Position, ViewportConstraints, CanvasNode, WorkflowData } from '@types';
import { EventBus } from '@events/event-bus';
import { ViewportManager } from './viewport-manager';
import { CoordinateSystem } from './coordinate-system';

export class CanvasEngine {
  private viewportManager: ViewportManager;
  private coordinateSystem: CoordinateSystem;
  private eventBus: EventBus;
  private nodes: CanvasNode[] = [];
  
  // Node Dragging State
  private isNodeDragging = false;
  private dragNodeId: string | null = null;
  private dragNodeStart: Position = { x: 0, y: 0 };

  constructor(initialViewport: Viewport, constraints: ViewportConstraints) {
    // 1. Initialize Coordinate System
    this.coordinateSystem = new CoordinateSystem(
      constraints.worldSize,
      constraints
    );

    // 2. Initialize Event Bus
    this.eventBus = new EventBus();

    // 3. Initialize Viewport Manager (Handles Pan/Zoom physics)
    this.viewportManager = new ViewportManager(
      initialViewport,
      constraints,
      this.coordinateSystem,
      this.eventBus
    );

    // 4. Initialize Event Listeners
    this.setupEventListeners();
  }

  // =========================================================================
  // Core Accessors
  // =========================================================================

  getViewport(): Viewport {
    return this.viewportManager.getViewport();
  }

  getNodes(): CanvasNode[] {
    return [...this.nodes];
  }

  getConstraints(): ViewportConstraints {
    return this.viewportManager.getConstraints();
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }
  
  getCoordinateSystem(): CoordinateSystem {
    return this.coordinateSystem;
  }
  
  getViewportManager(): ViewportManager {
    return this.viewportManager;
  }

  getDraggedNodeId(): string | null {
    return this.dragNodeId;
  }

  // =========================================================================
  // Data Loading & Persistence
  // =========================================================================

  public loadGraph(nodes: CanvasNode[]): void {
    this.nodes = [...nodes];
    // Emit event so UI updates immediately
    if (this.nodes.length > 0) {
      this.eventBus.emit('node:updated', this.nodes[0]);
    } else {
        // Emit empty update if cleared
        this.eventBus.emit('node:updated', null);
    }
  }

  // ✅ NEW: Export current state
  public exportState(): WorkflowData {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      viewport: this.getViewport(),
      nodes: this.getNodes(),
    };
  }

  // ✅ NEW: Import state
  public loadState(data: WorkflowData): void {
    // 1. Restore Nodes
    // loadGraph replaces the array, effectively clearing old nodes
    this.loadGraph(data.nodes || []);
    
    // 2. Restore Viewport
    if (data.viewport) {
      this.setViewport(data.viewport);
    }

    // 3. Notify System
    this.eventBus.emit('config:changed', { section: 'workflow', config: 'loaded' });
    console.log(`[CanvasEngine] Workflow loaded: ${data.nodes.length} nodes`);
  }

  // =========================================================================
  // Hit Testing (CRITICAL FOR INTERACTION)
  // =========================================================================

  getNodeAtPosition(worldPos: Position): CanvasNode | undefined {
    // We iterate backwards so we click the "top" node if they overlap
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const halfWidth = node.size.width / 2;
      const halfHeight = node.size.height / 2;
      
      const minX = node.position.x - halfWidth;
      const maxX = node.position.x + halfWidth;
      const minY = node.position.y - halfHeight;
      const maxY = node.position.y + halfHeight;

      if (
        worldPos.x >= minX &&
        worldPos.x <= maxX &&
        worldPos.y >= minY &&
        worldPos.y <= maxY
      ) {
        return node;
      }
    }
    return undefined;
  }

  // =========================================================================
  // Viewport Operations (Delegated to ViewportManager)
  // =========================================================================

  setViewport(viewport: Partial<Viewport>): void {
    this.viewportManager.setViewport(viewport);
  }

  zoom(delta: number, focalPoint: Position): void {
    this.viewportManager.zoom(delta, focalPoint);
  }

  pan(dx: number, dy: number): void {
    this.viewportManager.pan(dx, dy);
  }

  resetViewport(centerPoint?: Position): void {
    this.viewportManager.resetViewport(centerPoint);
  }

  // =========================================================================
  // Viewport Dragging (Panning the World)
  // =========================================================================

  startDrag(startX: number, startY: number): void {
    this.viewportManager.startDrag(startX, startY);
  }

  updateDrag(currentX: number, currentY: number): void {
    this.viewportManager.updateDrag(currentX, currentY);
  }

  endDrag(): void {
    this.viewportManager.endDrag();
  }
  
  // =========================================================================
  // Node Dragging (Moving Items)
  // =========================================================================

  startNodeDrag(nodeId: string, startX: number, startY: number): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      this.isNodeDragging = true;
      this.dragNodeId = nodeId;
      this.dragNodeStart = { x: startX, y: startY };
      
      this.bringToFront(nodeId);
      
      this.eventBus.emit('node:selected', node);
    }
  }
  
  updateNodeDrag(currentX: number, currentY: number): void {
    if (!this.isNodeDragging || !this.dragNodeId) return;

    const node = this.nodes.find(n => n.id === this.dragNodeId);
    if (node) {
      const dxPx = currentX - this.dragNodeStart.x;
      const dyPx = currentY - this.dragNodeStart.y;
      
      const viewport = this.getViewport();
      const dxWorld = dxPx / viewport.zoom;
      const dyWorld = dyPx / viewport.zoom;
      
      node.position.x += dxWorld;
      node.position.y += dyWorld;
      
      this.dragNodeStart = { x: currentX, y: currentY };
      this.eventBus.emit('node:dragged', { nodeId: this.dragNodeId, position: node.position });
    }
  }
  
  endNodeDrag(): void {
    this.isNodeDragging = false;
    this.dragNodeId = null;
  }

  // =========================================================================
  // Node CRUD Operations
  // =========================================================================

  addNode(node: Omit<CanvasNode, 'id'>): string {
    const newNode: CanvasNode = {
      ...node,
      id: this.generateId(),
    };
    this.nodes.push(newNode);
    this.eventBus.emit('node:added', newNode);
    return newNode.id;
  }

  removeNode(id: string): boolean {
    const index = this.nodes.findIndex(node => node.id === id);
    if (index !== -1) {
      const removed = this.nodes.splice(index, 1)[0];
      this.eventBus.emit('node:removed', removed);
      return true;
    }
    return false;
  }

  updateNode(id: string, updates: Partial<CanvasNode>): boolean {
    const node = this.nodes.find(node => node.id === id);
    if (node) {
      Object.assign(node, updates);
      this.eventBus.emit('node:updated', node);
      return true;
    }
    return false;
  }
  
  getNode(id: string): CanvasNode | undefined {
    return this.nodes.find(node => node.id === id);
  }

  private bringToFront(nodeId: string): void {
    const index = this.nodes.findIndex(n => n.id === nodeId);
    if (index !== -1 && index !== this.nodes.length - 1) {
      const node = this.nodes.splice(index, 1)[0];
      this.nodes.push(node);
    }
  }

  // =========================================================================
  // Utilities & Lifecycle
  // =========================================================================

  screenToWorld(screenPos: Position): Position {
    return this.viewportManager.screenToWorld(screenPos);
  }

  worldToScreen(worldPos: Position): Position {
    return this.viewportManager.worldToScreen(worldPos);
  }

  getCenter(): Position {
    return this.viewportManager.getCenter();
  }
  
  private generateId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }
  
  private setupEventListeners(): void {
    // Listeners can be set up here if needed
  }

  dispose(): void {
    this.viewportManager.dispose();
    this.eventBus.dispose();
    this.nodes = [];
  }
}
