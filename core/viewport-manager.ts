// core/viewport-manager.ts
import { Viewport, Position, ViewportConstraints } from '@types';
import { EventBus } from '@events/event-bus';
import { CoordinateSystem } from './coordinate-system';

export class ViewportManager {
  private viewport: Viewport;
  private constraints: ViewportConstraints;
  private coordinateSystem: CoordinateSystem;
  private eventBus: EventBus;

  // Dragging state
  private isDragging = false;
  private dragStart: Position = { x: 0, y: 0 };
  private dragStartViewport: Viewport | null = null;

  // Animation state
  private animationFrame: number | null = null;

  constructor(
    initialViewport: Viewport,
    constraints: ViewportConstraints,
    coordinateSystem: CoordinateSystem,
    eventBus: EventBus
  ) {
    this.viewport = { ...initialViewport };
    this.constraints = constraints;
    this.coordinateSystem = coordinateSystem;
    this.eventBus = eventBus;
  }

  // --- Getters ---
  getViewport(): Viewport {
    return { ...this.viewport };
  }

  getConstraints(): ViewportConstraints {
    return { ...this.constraints };
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getCenter(): Position {
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
  }

  getVisibleBounds(containerSize: { width: number; height: number }) {
    return this.coordinateSystem.getVisibleBounds(this.viewport, containerSize);
  }

  // --- Core Operations ---
  setViewport(newViewport: Partial<Viewport>): void {
    const nextViewport = {
      ...this.viewport,
      ...newViewport,
      zoom: Math.max(
        this.constraints.minZoom,
        Math.min(this.constraints.maxZoom, newViewport.zoom ?? this.viewport.zoom)
      ),
    };

    // Prevent unnecessary updates
    if (
      nextViewport.x === this.viewport.x &&
      nextViewport.y === this.viewport.y &&
      nextViewport.zoom === this.viewport.zoom
    ) {
      return;
    }

    this.viewport = nextViewport;
    this.eventBus.emit('viewport:changed', this.viewport);
  }

  // --- Zoom Logic ---
  zoom(delta: number, focalPoint: Position): void {
    const currentZoom = this.viewport.zoom;
    const zoomFactor = delta > 0 ? 0.9 : 1.1; // Zoom out or in
    const newZoom = Math.max(
      this.constraints.minZoom,
      Math.min(this.constraints.maxZoom, currentZoom * zoomFactor)
    );

    if (newZoom === currentZoom) return;

    // Calculate world position of the focal point before zoom
    const worldFocus = this.coordinateSystem.screenToWorld(focalPoint, this.viewport);

    // Update zoom
    this.viewport.zoom = newZoom;

    // Calculate new screen position of that world point
    const newScreenFocus = this.coordinateSystem.worldToScreen(worldFocus, this.viewport);

    // Adjust viewport position to keep the focal point stable
    this.viewport.x += focalPoint.x - newScreenFocus.x;
    this.viewport.y += focalPoint.y - newScreenFocus.y;

    this.eventBus.emit('viewport:changed', this.viewport);
    this.eventBus.emit('viewport:zoom', { delta, focalPoint, newZoom });
  }

  zoomIn(amount = 0.1, focalPoint?: Position): void {
    const center = focalPoint || this.getCenter();
    this.zoom(-100, center); // Negative delta for zoom in
  }

  zoomOut(amount = 0.1, focalPoint?: Position): void {
    const center = focalPoint || this.getCenter();
    this.zoom(100, center); // Positive delta for zoom out
  }

  zoomTo(zoom: number, focalPoint?: Position): void {
    const center = focalPoint || this.getCenter();
    // Simple implementation: set directly (could be animated)
    this.setViewport({ zoom });
  }

  // --- Pan Logic ---
  pan(dx: number, dy: number): void {
    this.setViewport({
      x: this.viewport.x + dx,
      y: this.viewport.y + dy,
    });
    this.eventBus.emit('viewport:pan', { dx, dy });
  }

  panTo(x: number, y: number): void {
    const center = this.getCenter();
    // Calculate viewport x/y needed to center the world point (x,y)
    // ScreenX = WorldX * Zoom + ViewportX
    // CenterX = x * Zoom + ViewportX
    // ViewportX = CenterX - x * Zoom
    const newX = center.x - x * this.viewport.zoom;
    const newY = center.y - y * this.viewport.zoom;
    this.setViewport({ x: newX, y: newY });
  }

  resetViewport(centerPoint?: Position): void {
    const center = centerPoint || this.getCenter();
    this.setViewport({
      x: center.x,
      y: center.y,
      zoom: 1,
    });
  }

  animateTo(target: Viewport, duration: number = 300): void {
    const start = { ...this.viewport };
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      this.setViewport({
        x: start.x + (target.x - start.x) * ease,
        y: start.y + (target.y - start.y) * ease,
        zoom: start.zoom + (target.zoom - start.zoom) * ease,
      });

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animationFrame = null;
      }
    };

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(animate);
  }

  // --- Drag Logic ---
  startDrag(startX: number, startY: number): void {
    this.isDragging = true;
    this.dragStart = { x: startX, y: startY };
    this.dragStartViewport = { ...this.viewport };
  }

  updateDrag(currentX: number, currentY: number): void {
    if (!this.isDragging || !this.dragStartViewport) return;

    const dx = currentX - this.dragStart.x;
    const dy = currentY - this.dragStart.y;

    this.setViewport({
      x: this.dragStartViewport.x + dx,
      y: this.dragStartViewport.y + dy,
    });
  }

  endDrag(): void {
    this.isDragging = false;
    this.dragStartViewport = null;
  }

  // --- Transforms ---
  screenToWorld(screenPos: Position): Position {
    return this.coordinateSystem.screenToWorld(screenPos, this.viewport);
  }

  worldToScreen(worldPos: Position): Position {
    return this.coordinateSystem.worldToScreen(worldPos, this.viewport);
  }

  dispose(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }
}