// core/canvas-engine.ts
import { Viewport, Position, ViewportConstraints, CanvasNode } from '@types';
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
    // We pass the main eventBus here, so ViewportManager emits directly to it.
    this.viewportManager = new ViewportManager(
      initialViewport,
      constraints,
      this.coordinateSystem,
      this.eventBus
    );
    
    // 4. Initialize Default Nodes (Demo Data)
    this.nodes = [
      {
        id: '1',
        type: 'text',
        content: 'Center Node',
        position: { x: 0, y: 0 },
        size: { width: 150, height: 80 },
      },
      {
        id: '2',
        type: 'shape',
        content: '',
        position: { x: -300, y: -200 },
        size: { width: 100, height: 100 },
        metadata: { color: '#ef4444', shape: 'circle' }
      },
      {
        id: '3',
        type: 'ai-generated',
        content: 'AI Insights',
        position: { x: 300, y: 200 },
        size: { width: 200, height: 120 },
      },
    ];
    
    // No need to setup re-emitters since we share the bus
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
    // ✅ FIX: Removed infinite loop causing re-emitters.
    // The ViewportManager shares the same eventBus instance, 
    // so its events are already on the main bus.
  }

  dispose(): void {
    this.viewportManager.dispose();
    this.eventBus.dispose();
    this.nodes = [];
  }
}