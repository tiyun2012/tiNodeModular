// core/coordinate-system.ts
import { Position, Viewport, ViewportConstraints } from '@types';

export class CoordinateSystem {
  private worldSize: number;
  private constraints: ViewportConstraints;
  
  constructor(worldSize: number, constraints: ViewportConstraints) {
    this.worldSize = worldSize;
    this.constraints = constraints;
  }
  
  // Core transformations
  screenToWorld(screenPos: Position, viewport: Viewport): Position {
    return {
      x: (screenPos.x - viewport.x) / viewport.zoom,
      y: (screenPos.y - viewport.y) / viewport.zoom,
    };
  }
  
  worldToScreen(worldPos: Position, viewport: Viewport): Position {
    return {
      x: worldPos.x * viewport.zoom + viewport.x,
      y: worldPos.y * viewport.zoom + viewport.y,
    };
  }
  
  // World coordinate validation
  isInWorldBounds(position: Position): boolean {
    const halfWorld = this.worldSize / 2;
    return (
      position.x >= -halfWorld &&
      position.x <= halfWorld &&
      position.y >= -halfWorld &&
      position.y <= halfWorld
    );
  }
  
  // Constrain position to world bounds
  constrainToWorld(position: Position): Position {
    if (!this.constraints.constrainToWorld) return position;
    
    const halfWorld = this.worldSize / 2;
    return {
      x: Math.max(-halfWorld, Math.min(halfWorld, position.x)),
      y: Math.max(-halfWorld, Math.min(halfWorld, position.y)),
    };
  }
  
  // Normalize world coordinates to [0, 1] range
  normalizeWorldPosition(position: Position): Position {
    const halfWorld = this.worldSize / 2;
    return {
      x: (position.x + halfWorld) / this.worldSize,
      y: (position.y + halfWorld) / this.worldSize,
    };
  }
  
  // Denormalize from [0, 1] back to world coordinates
  denormalizeWorldPosition(normalized: Position): Position {
    const halfWorld = this.worldSize / 2;
    return {
      x: normalized.x * this.worldSize - halfWorld,
      y: normalized.y * this.worldSize - halfWorld,
    };
  }
  
  // Grid snapping
  snapToGrid(position: Position, gridSize: number): Position {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }
  
  // Calculate visible bounds in world coordinates
  getVisibleBounds(
    viewport: Viewport, 
    containerSize: { width: number; height: number }
  ): { minX: number; maxX: number; minY: number; maxY: number } {
    const topLeft = this.screenToWorld({ x: 0, y: 0 }, viewport);
    const topRight = this.screenToWorld({ x: containerSize.width, y: 0 }, viewport);
    const bottomLeft = this.screenToWorld({ x: 0, y: containerSize.height }, viewport);
    const bottomRight = this.screenToWorld({ x: containerSize.width, y: containerSize.height }, viewport);
    
    const xCoords = [topLeft.x, topRight.x, bottomLeft.x, bottomRight.x];
    const yCoords = [topLeft.y, topRight.y, bottomLeft.y, bottomRight.y];
    
    return {
      minX: Math.min(...xCoords),
      maxX: Math.max(...xCoords),
      minY: Math.min(...yCoords),
      maxY: Math.max(...yCoords),
    };
  }
  
  // Calculate zoom level to fit content
  calculateZoomToFit(
    contentBounds: { width: number; height: number },
    containerSize: { width: number; height: number },
    padding: number = 20
  ): number {
    const availableWidth = containerSize.width - padding * 2;
    const availableHeight = containerSize.height - padding * 2;
    
    const scaleX = availableWidth / contentBounds.width;
    const scaleY = availableHeight / contentBounds.height;
    
    return Math.min(scaleX, scaleY, this.constraints.maxZoom);
  }
  
  // Check if a point is visible in the viewport
  isPointVisible(point: Position, viewport: Viewport, containerSize: { width: number; height: number }): boolean {
    const screenPoint = this.worldToScreen(point, viewport);
    
    return (
      screenPoint.x >= 0 &&
      screenPoint.x <= containerSize.width &&
      screenPoint.y >= 0 &&
      screenPoint.y <= containerSize.height
    );
  }
  
  // Get world size
  getWorldSize(): number {
    return this.worldSize;
  }
  
  // Set world size
  setWorldSize(size: number): void {
    this.worldSize = size;
  }
  
  // Transform multiple points at once (optimized for bulk operations)
  batchScreenToWorld(screenPoints: Position[], viewport: Viewport): Position[] {
    return screenPoints.map(point => this.screenToWorld(point, viewport));
  }
  
  batchWorldToScreen(worldPoints: Position[], viewport: Viewport): Position[] {
    return worldPoints.map(point => this.worldToScreen(point, viewport));
  }
}